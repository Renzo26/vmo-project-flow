import json
import uuid
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser
from app.api.schemas import (
    AvalRequest,
    DecisaoRequest,
    SolicitacaoDetail,
    SolicitacaoListItem,
)
from app.database import get_db
from app.models import (
    AnalisePF,
    Proposta,
    PropostaStatus,
    Solicitacao,
    SolicitacaoDocumento,
    SolicitacaoStatus,
    Usuario,
    UserRole,
)
from app.services import solicitacao_service, storage_service
from app.services.storage_service import StorageError, safe_filename
from app.services.ai_agent import analyze_document
from app.services.document_parser import UnsupportedDocumentError, extract_text
from app.services.template_reader import get_expected_fields
from app.schemas import Methodology

router = APIRouter(prefix="/solicitacoes", tags=["solicitacoes"])


@router.get("", response_model=list[SolicitacaoListItem])
async def listar(
    user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[SolicitacaoListItem]:
    stmt = select(Solicitacao).order_by(Solicitacao.created_at.desc())
    if user.role == UserRole.solicitante:
        stmt = stmt.where(Solicitacao.solicitante_id == user.id)
    elif user.role == UserRole.fornecedor:
        if not user.fornecedor_id:
            return []
        stmt = stmt.where(
            Solicitacao.fornecedor_id == user.fornecedor_id,
            Solicitacao.status.in_(
                [
                    SolicitacaoStatus.aguardando_proposta,
                    SolicitacaoStatus.proposta_enviada,
                    SolicitacaoStatus.aceita,
                    SolicitacaoStatus.recusada,
                ]
            ),
        )
    # controle vê todas
    rows = await db.scalars(stmt)
    return [await solicitacao_service.to_list_item(db, s) for s in rows]


async def _load_for_user(db: AsyncSession, user: Usuario, solicitacao_id: uuid.UUID) -> Solicitacao:
    s = await db.get(Solicitacao, solicitacao_id)
    if s is None:
        raise HTTPException(status_code=404, detail="Solicitação não encontrada.")
    if user.role == UserRole.solicitante and s.solicitante_id != user.id:
        raise HTTPException(status_code=403, detail="Sem acesso a esta solicitação.")
    if user.role == UserRole.fornecedor and s.fornecedor_id != user.fornecedor_id:
        raise HTTPException(status_code=403, detail="Sem acesso a esta solicitação.")
    return s


@router.get("/{solicitacao_id}", response_model=SolicitacaoDetail)
async def detalhe(
    solicitacao_id: uuid.UUID,
    user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> SolicitacaoDetail:
    s = await _load_for_user(db, user, solicitacao_id)
    return await solicitacao_service.to_detail(db, s)


@router.post("", response_model=SolicitacaoDetail, status_code=status.HTTP_201_CREATED)
async def criar(
    user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    titulo: Annotated[str, Form()],
    arquivo: Annotated[UploadFile, File()],
    area: Annotated[str | None, Form()] = None,
    prioridade: Annotated[str | None, Form()] = None,
    categoria: Annotated[str | None, Form()] = None,
    descricao: Annotated[str | None, Form()] = None,
    sistemas_impactados: Annotated[str | None, Form()] = None,
    entregaveis: Annotated[str | None, Form()] = None,
    complexidade: Annotated[str | None, Form()] = None,
    ambiente: Annotated[str | None, Form()] = None,
    prazo_entrega: Annotated[str | None, Form()] = None,
    prazo_resposta: Annotated[str | None, Form()] = None,
    modalidade: Annotated[str | None, Form()] = None,
    tipo_servico: Annotated[str | None, Form()] = None,
    subtipo: Annotated[str | None, Form()] = None,
    senioridade: Annotated[str | None, Form()] = None,
    fin_type: Annotated[str | None, Form()] = None,
    iniciativa: Annotated[str | None, Form()] = None,
    urgencia: Annotated[str | None, Form()] = None,
    metodologia_pf: Annotated[str, Form()] = "sfp",
    form_json: Annotated[str | None, Form()] = None,
    fornecedor_id: Annotated[str | None, Form()] = None,
    doc_aprovacao: Annotated[UploadFile | None, File()] = None,
) -> SolicitacaoDetail:
    if user.role != UserRole.solicitante:
        raise HTTPException(status_code=403, detail="Apenas solicitantes podem criar solicitações.")

    data = await arquivo.read()
    if not data:
        raise HTTPException(status_code=400, detail="Arquivo vazio.")

    numero = await solicitacao_service.gerar_numero(db)
    solic = Solicitacao(
        numero=numero,
        titulo=titulo,
        area=area,
        prioridade=prioridade,
        categoria=categoria,
        solicitante_id=user.id,
        descricao=descricao,
        sistemas_impactados=sistemas_impactados,
        entregaveis=entregaveis,
        complexidade=complexidade,
        ambiente=ambiente,
        prazo_entrega=prazo_entrega,
        prazo_resposta=prazo_resposta,
        modalidade=modalidade,
        tipo_servico=tipo_servico,
        subtipo=subtipo,
        senioridade=senioridade,
        fin_type=fin_type,
        iniciativa=iniciativa,
        urgencia=urgencia,
        metodologia_pf=metodologia_pf,
        form_json=json.loads(form_json) if form_json else None,
        fornecedor_id=uuid.UUID(fornecedor_id) if fornecedor_id else None,
        status=SolicitacaoStatus.aguardando_controle,
    )
    db.add(solic)
    await db.flush()

    # Upload do arquivo no Supabase Storage
    original_name = arquivo.filename or "documento.xlsx"
    path = f"solicitacoes/{solic.id}/{safe_filename(original_name)}"
    try:
        await storage_service.upload(path, data, arquivo.content_type)
    except StorageError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    db.add(
        SolicitacaoDocumento(
            solicitacao_id=solic.id,
            nome=original_name,
            storage_path=path,
            content_type=arquivo.content_type,
            tamanho=len(data),
            kind="planilha_pf",
        )
    )

    # Upload do documento de aprovação de superior (quando < 2 fornecedores indicados)
    if doc_aprovacao is not None:
        aprov_data = await doc_aprovacao.read()
        if aprov_data:
            aprov_name = doc_aprovacao.filename or "aprovacao"
            aprov_path = f"solicitacoes/{solic.id}/{safe_filename(aprov_name)}"
            try:
                await storage_service.upload(aprov_path, aprov_data, doc_aprovacao.content_type)
            except StorageError as exc:
                raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
            db.add(
                SolicitacaoDocumento(
                    solicitacao_id=solic.id,
                    nome=aprov_name,
                    storage_path=aprov_path,
                    content_type=doc_aprovacao.content_type,
                    tamanho=len(aprov_data),
                    kind="aprovacao_fornecedor",
                )
            )

    # Análise de IA (Padrão de Entrada PF) — persiste o resultado
    try:
        metodologia = Methodology(metodologia_pf)
        texto = extract_text(arquivo.filename or "documento.xlsx", data)
        expected = get_expected_fields(metodologia)
        resultado = analyze_document(metodologia, arquivo.filename or "documento.xlsx", texto, expected)
        db.add(
            AnalisePF(
                solicitacao_id=solic.id,
                metodologia=resultado.metodologia.value,
                aba=resultado.aba,
                total_campos=resultado.total_campos,
                total_preenchidos=resultado.total_preenchidos,
                total_pendentes=resultado.total_pendentes,
                completo=resultado.completo,
                campos=[c.model_dump() for c in resultado.campos],
                pendentes=resultado.pendentes,
                resumo=resultado.resumo,
            )
        )
    except (UnsupportedDocumentError, ValueError, Exception):
        # Não bloqueia a criação caso a análise falhe; segue sem análise persistida.
        pass

    await db.flush()
    return await solicitacao_service.to_detail(db, solic)


@router.patch("/{solicitacao_id}/aval", response_model=SolicitacaoDetail)
async def dar_aval(
    solicitacao_id: uuid.UUID,
    body: AvalRequest,
    user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> SolicitacaoDetail:
    if user.role != UserRole.controle:
        raise HTTPException(status_code=403, detail="Apenas o Controle Econômico pode dar o aval.")
    s = await db.get(Solicitacao, solicitacao_id)
    if s is None:
        raise HTTPException(status_code=404, detail="Solicitação não encontrada.")
    if s.status != SolicitacaoStatus.aguardando_controle:
        raise HTTPException(status_code=409, detail="Solicitação não está aguardando aval.")
    if body.fornecedor_id is not None:
        s.fornecedor_id = body.fornecedor_id
    s.parecer_controle = body.parecer_controle
    s.estimativa_aprovada = body.estimativa_aprovada
    s.status = SolicitacaoStatus.aguardando_proposta
    s.aval_em = datetime.now(timezone.utc)
    await db.flush()
    return await solicitacao_service.to_detail(db, s)


@router.patch("/{solicitacao_id}/rejeitar", response_model=SolicitacaoDetail)
async def rejeitar(
    solicitacao_id: uuid.UUID,
    user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    parecer: Annotated[str | None, Form()] = None,
) -> SolicitacaoDetail:
    if user.role != UserRole.controle:
        raise HTTPException(status_code=403, detail="Apenas o Controle Econômico pode rejeitar.")
    s = await db.get(Solicitacao, solicitacao_id)
    if s is None:
        raise HTTPException(status_code=404, detail="Solicitação não encontrada.")
    s.status = SolicitacaoStatus.rejeitada_controle
    s.parecer_controle = parecer
    s.aval_em = datetime.now(timezone.utc)
    await db.flush()
    return await solicitacao_service.to_detail(db, s)


@router.post("/{solicitacao_id}/proposta", response_model=SolicitacaoDetail)
async def enviar_proposta(
    solicitacao_id: uuid.UUID,
    user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    valor: Annotated[float | None, Form()] = None,
    prazo: Annotated[str | None, Form()] = None,
    observacoes: Annotated[str | None, Form()] = None,
    arquivo: Annotated[UploadFile | None, File()] = None,
) -> SolicitacaoDetail:
    if user.role != UserRole.fornecedor:
        raise HTTPException(status_code=403, detail="Apenas fornecedores podem enviar propostas.")
    s = await _load_for_user(db, user, solicitacao_id)
    if s.status not in (SolicitacaoStatus.aguardando_proposta, SolicitacaoStatus.proposta_enviada):
        raise HTTPException(status_code=409, detail="Solicitação não está aguardando proposta.")

    storage_path = None
    arquivo_nome = None
    if arquivo is not None:
        data = await arquivo.read()
        if data:
            arquivo_nome = arquivo.filename or "proposta"
            storage_path = f"propostas/{s.id}/{safe_filename(arquivo_nome)}"
            try:
                await storage_service.upload(storage_path, data, arquivo.content_type)
            except StorageError as exc:
                raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc

    existing = await db.scalar(select(Proposta).where(Proposta.solicitacao_id == s.id))
    if existing:
        existing.valor = valor
        existing.prazo = prazo
        existing.observacoes = observacoes
        if storage_path:
            existing.storage_path = storage_path
            existing.arquivo_nome = arquivo_nome
    else:
        db.add(
            Proposta(
                solicitacao_id=s.id,
                fornecedor_id=user.fornecedor_id,
                valor=valor,
                prazo=prazo,
                observacoes=observacoes,
                storage_path=storage_path,
                arquivo_nome=arquivo_nome,
                status=PropostaStatus.enviada,
            )
        )
    s.status = SolicitacaoStatus.proposta_enviada
    await db.flush()
    return await solicitacao_service.to_detail(db, s)


@router.patch("/{solicitacao_id}/decisao", response_model=SolicitacaoDetail)
async def decisao(
    solicitacao_id: uuid.UUID,
    body: DecisaoRequest,
    user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> SolicitacaoDetail:
    if user.role != UserRole.solicitante:
        raise HTTPException(status_code=403, detail="Apenas o solicitante pode decidir.")
    s = await _load_for_user(db, user, solicitacao_id)
    if s.status != SolicitacaoStatus.proposta_enviada:
        raise HTTPException(status_code=409, detail="Não há proposta para decidir.")
    if body.decisao not in ("aceita", "recusada"):
        raise HTTPException(status_code=400, detail="Decisão inválida.")
    s.status = SolicitacaoStatus.aceita if body.decisao == "aceita" else SolicitacaoStatus.recusada
    s.decisao_solicitante = body.decisao
    s.decidido_em = datetime.now(timezone.utc)
    proposta = await db.scalar(select(Proposta).where(Proposta.solicitacao_id == s.id))
    if proposta:
        proposta.status = PropostaStatus.aceita if body.decisao == "aceita" else PropostaStatus.recusada
    await db.flush()
    return await solicitacao_service.to_detail(db, s)
