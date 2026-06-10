import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, require_role
from app.api.schemas import (
    ContagemPFCreate,
    ContagemPFDetail,
    ContagemPFOut,
    FuncaoPFOut,
)
from app.database import get_db
from app.models import Usuario, UserRole
from app.models.contagem_pf import ContagemPF, FuncaoPF
from app.services import pf_calculator as calc

router = APIRouter(prefix="/pf", tags=["pf"])

ControleUser = Annotated[Usuario, Depends(require_role(UserRole.controle))]


@router.get("/deflatores")
async def deflatores(_: CurrentUser) -> dict:
    """Catálogo completo de deflatores SISP 2.3."""
    return calc.listar_deflatores()


@router.post("/calcular", response_model=dict)
async def calcular_preview(body: ContagemPFCreate, _: CurrentUser) -> dict:
    """Cálculo sem persistência — retorna o resultado imediatamente."""
    return _executar_calculo(body)


@router.post("/contagens", response_model=ContagemPFDetail, status_code=status.HTTP_201_CREATED)
async def criar_contagem(
    body: ContagemPFCreate,
    user: ControleUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ContagemPFDetail:
    resultado = _executar_calculo(body)

    contagem = ContagemPF(
        titulo=body.titulo,
        metodologia=body.metodologia,
        tipo_projeto=body.tipo_projeto,
        total_pf_bruto=resultado["total_pf_bruto"],
        total_pf_local=resultado["total_pf_local"],
        esforco_horas=resultado["esforco_horas"],
        distribuicao_json=resultado["distribuicao"],
        asfpb=body.asfpb if body.metodologia == "sfp" else None,
        usuario_id=user.id,
        solicitacao_id=body.solicitacao_id,
    )
    db.add(contagem)
    await db.flush()

    for i, d in enumerate(resultado["detalhes"]):
        db.add(FuncaoPF(
            contagem_id=contagem.id,
            ordem=i,
            descricao=d["descricao"],
            tipo=d["tipo"],
            complexidade=d.get("complexidade"),
            deflator_mnemonico=d.get("deflator_mnemonico"),
            operacao=d.get("operacao"),
            pf_bruto=d["pf_bruto"],
            pf_local=d["pf_local"],
        ))

    await db.flush()
    return await _to_detail(db, contagem, user)


@router.get("/contagens", response_model=list[ContagemPFOut])
async def listar_contagens(
    user: ControleUser,
    db: Annotated[AsyncSession, Depends(get_db)],
    solicitacao_id: uuid.UUID | None = None,
) -> list[ContagemPFOut]:
    query = select(ContagemPF).order_by(ContagemPF.created_at.desc())
    if solicitacao_id is not None:
        query = query.where(ContagemPF.solicitacao_id == solicitacao_id)
    rows = await db.scalars(query)
    result = []
    for c in rows:
        u = await db.get(Usuario, c.usuario_id)
        result.append(ContagemPFOut(
            id=c.id,
            titulo=c.titulo,
            metodologia=c.metodologia,
            tipo_projeto=c.tipo_projeto,
            total_pf_bruto=c.total_pf_bruto,
            total_pf_local=c.total_pf_local,
            esforco_horas=c.esforco_horas,
            created_at=c.created_at,
            usuario_nome=u.nome if u else None,
            solicitacao_id=c.solicitacao_id,
        ))
    return result


@router.get("/contagens/{contagem_id}", response_model=ContagemPFDetail)
async def detalhe_contagem(
    contagem_id: uuid.UUID,
    user: ControleUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ContagemPFDetail:
    c = await db.get(ContagemPF, contagem_id)
    if c is None:
        raise HTTPException(status_code=404, detail="Contagem não encontrada.")
    return await _to_detail(db, c, user)


@router.delete("/contagens/{contagem_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deletar_contagem(
    contagem_id: uuid.UUID,
    _: ControleUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    c = await db.get(ContagemPF, contagem_id)
    if c is None:
        raise HTTPException(status_code=404, detail="Contagem não encontrada.")
    await db.delete(c)


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _executar_calculo(body: ContagemPFCreate) -> dict:
    """Executa o cálculo e retorna dict serializado com detalhes."""
    if body.metodologia == "ifpug":
        funcoes = [
            calc.FuncaoIFPUG(
                descricao=f.descricao,
                tipo=f.tipo,
                complexidade=f.complexidade,
                deflator_mnemonico=f.deflator_mnemonico,
            )
            for f in body.funcoes_ifpug
        ]
        r = calc.calcular_ifpug(funcoes)
        detalhes = [
            {
                "descricao": d.descricao,
                "tipo": d.tipo,
                "complexidade": d.complexidade,
                "deflator_mnemonico": d.deflator_mnemonico,
                "pf_bruto": d.pf_bruto,
                "pf_local": d.pf_local,
            }
            for d in r.detalhes
        ]
        return {
            "total_pf_bruto": r.total_pf_bruto,
            "total_pf_local": r.total_pf_local,
            "esforco_horas": r.esforco_horas,
            "distribuicao": r.distribuicao,
            "detalhes": detalhes,
            "extra": {},
        }
    else:  # sfp
        funcoes_sfp = [
            calc.FuncaoSFP(descricao=f.descricao, tipo=f.tipo, operacao=f.operacao)
            for f in body.funcoes_sfp
        ]
        if body.tipo_projeto == "melhoria":
            r = calc.calcular_sfp_melhoria(funcoes_sfp, body.asfpb)
            extra = {"esfp": r.esfp, "asfpa": r.asfpa}
        else:
            r = calc.calcular_sfp_desenvolvimento(funcoes_sfp)
            extra = {"dsfp": r.dsfp, "asfp": r.asfp}  # type: ignore[union-attr]

        detalhes = [
            {
                "descricao": d.descricao,
                "tipo": d.tipo,
                "operacao": d.operacao,
                "pf_bruto": d.pf_unitario,
                "pf_local": d.pf_unitario,  # SFP não usa deflator por função
            }
            for d in r.detalhes
        ]
        return {
            "total_pf_bruto": r.total_pf,
            "total_pf_local": r.total_pf,
            "esforco_horas": r.esforco_horas,
            "distribuicao": r.distribuicao,
            "detalhes": detalhes,
            "extra": extra,
        }


async def _to_detail(db: AsyncSession, c: ContagemPF, user: Usuario) -> ContagemPFDetail:
    funcoes_rows = await db.scalars(
        select(FuncaoPF).where(FuncaoPF.contagem_id == c.id).order_by(FuncaoPF.ordem)
    )
    funcoes = [FuncaoPFOut.model_validate(f) for f in funcoes_rows]
    u = await db.get(Usuario, c.usuario_id)
    return ContagemPFDetail(
        id=c.id,
        titulo=c.titulo,
        metodologia=c.metodologia,
        tipo_projeto=c.tipo_projeto,
        total_pf_bruto=c.total_pf_bruto,
        total_pf_local=c.total_pf_local,
        esforco_horas=c.esforco_horas,
        created_at=c.created_at,
        usuario_nome=u.nome if u else None,
        solicitacao_id=c.solicitacao_id,
        funcoes=funcoes,
        distribuicao=c.distribuicao_json or {},
        asfpb=c.asfpb,
    )
