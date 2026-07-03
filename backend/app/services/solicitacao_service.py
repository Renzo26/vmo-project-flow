from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.schemas import (
    AnalisePFOut,
    AnalisePropostaOut,
    DocumentoOut,
    PropostaOut,
    SolicitacaoDetail,
    SolicitacaoListItem,
)
from app.models import (
    AnalisePF,
    AnaliseProposta,
    Fornecedor,
    Proposta,
    Solicitacao,
    SolicitacaoDocumento,
    Usuario,
)
from app.models.contagem_pf import ContagemPF
from app.services import apf_config_service, storage_service


async def gerar_numero(db: AsyncSession) -> str:
    ano = datetime.now(timezone.utc).year
    prefixo = f"VMO-{ano}-"
    total = await db.scalar(
        select(func.count()).select_from(Solicitacao).where(Solicitacao.numero.like(f"{prefixo}%"))
    )
    return f"{prefixo}{(total or 0) + 1:03d}"


async def to_list_item(db: AsyncSession, s: Solicitacao) -> SolicitacaoListItem:
    fornecedor_nome = None
    if s.fornecedor_id:
        f = await db.get(Fornecedor, s.fornecedor_id)
        fornecedor_nome = f.nome if f else None
    solicitante = await db.get(Usuario, s.solicitante_id)
    return SolicitacaoListItem(
        id=s.id,
        numero=s.numero,
        titulo=s.titulo,
        tipo_servico=s.tipo_servico,
        status=s.status.value,
        fornecedor_id=s.fornecedor_id,
        fornecedor_nome=fornecedor_nome,
        solicitante_nome=solicitante.nome if solicitante else None,
        created_at=s.created_at,
    )


async def to_detail(db: AsyncSession, s: Solicitacao, *, with_urls: bool = True) -> SolicitacaoDetail:
    base = await to_list_item(db, s)

    docs_rows = await db.scalars(
        select(SolicitacaoDocumento).where(SolicitacaoDocumento.solicitacao_id == s.id)
    )
    documentos: list[DocumentoOut] = []
    for d in docs_rows:
        url = None
        if with_urls:
            try:
                url = await storage_service.create_signed_url(d.storage_path)
            except storage_service.StorageError:
                url = None
        documentos.append(
            DocumentoOut(id=d.id, nome=d.nome, kind=d.kind, content_type=d.content_type, url=url)
        )

    analise_row = await db.scalar(select(AnalisePF).where(AnalisePF.solicitacao_id == s.id))
    analise = AnalisePFOut.model_validate(analise_row) if analise_row else None

    proposta_rows = list(await db.scalars(
        select(Proposta).where(Proposta.solicitacao_id == s.id).order_by(Proposta.created_at)
    ))
    propostas: list[PropostaOut] = []
    for pr in proposta_rows:
        purl = None
        if with_urls and pr.storage_path:
            try:
                purl = await storage_service.create_signed_url(pr.storage_path)
            except storage_service.StorageError:
                purl = None
        forn = await db.get(Fornecedor, pr.fornecedor_id)
        propostas.append(PropostaOut(
            id=pr.id,
            fornecedor_id=pr.fornecedor_id,
            fornecedor_nome=forn.nome if forn else None,
            valor=float(pr.valor) if pr.valor is not None else None,
            prazo=pr.prazo,
            observacoes=pr.observacoes,
            arquivo_nome=pr.arquivo_nome,
            url=purl,
            status=pr.status.value,
            created_at=pr.created_at,
        ))
    proposta = propostas[0] if propostas else None

    analise_proposta_row = await db.scalar(
        select(AnaliseProposta).where(AnaliseProposta.solicitacao_id == s.id)
    )
    analise_proposta = AnalisePropostaOut.model_validate(analise_proposta_row) if analise_proposta_row else None

    # Valor estimado = PF da contagem vinculada × R$/PF da Configuração APF ativa
    config = await apf_config_service.get_config_ativa(db)
    vpf = apf_config_service.valor_pf(config)
    teto_ce = apf_config_service.valor_max_ce(config)
    contagem_base = await db.scalar(
        select(ContagemPF)
        .where(ContagemPF.solicitacao_id == s.id)
        .order_by(ContagemPF.created_at)
    )
    valor_estimado = round(contagem_base.total_pf_local * vpf, 2) if contagem_base else None
    excede_teto = valor_estimado is not None and valor_estimado > teto_ce
    pf_estimado = contagem_base.total_pf_local if contagem_base else None
    esforco_horas = contagem_base.esforco_horas if contagem_base else None

    return SolicitacaoDetail(
        **base.model_dump(),
        area=s.area,
        prioridade=s.prioridade,
        categoria=s.categoria,
        descricao=s.descricao,
        sistemas_impactados=s.sistemas_impactados,
        entregaveis=s.entregaveis,
        complexidade=s.complexidade,
        ambiente=s.ambiente,
        prazo_entrega=s.prazo_entrega,
        prazo_resposta=s.prazo_resposta,
        modalidade=s.modalidade,
        subtipo=s.subtipo,
        senioridade=s.senioridade,
        fin_type=s.fin_type,
        iniciativa=s.iniciativa,
        urgencia=s.urgencia,
        metodologia_pf=s.metodologia_pf,
        parecer_controle=s.parecer_controle,
        estimativa_aprovada=s.estimativa_aprovada,
        decisao_solicitante=s.decisao_solicitante,
        documentos=documentos,
        analise_pf=analise,
        proposta=proposta,
        propostas=propostas,
        analise_proposta=analise_proposta,
        valor_pf_config=vpf,
        valor_estimado=valor_estimado,
        valor_max_ce=teto_ce,
        excede_teto_ce=excede_teto,
        pf_estimado=pf_estimado,
        esforco_horas=esforco_horas,
        form_json=s.form_json,
    )
