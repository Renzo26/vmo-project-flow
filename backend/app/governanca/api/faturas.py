"""Router de faturas — só tradução HTTP. A regra vive em `services/faturas.py`."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.governanca.schemas.fatura import FaturaDetalhe, FaturaResumo
from app.governanca.services import faturas as servico

roteador = APIRouter(prefix="/faturas", tags=["faturas"])


@roteador.get("", response_model=list[FaturaResumo])
async def listar(
    status_filtro: str | None = Query(default=None, alias="status"),
    competencia: str | None = Query(default=None),
    fornecedor_cnpj: str | None = Query(default=None),
    busca: str | None = Query(default=None),
    sessao: AsyncSession = Depends(get_db),
) -> list[FaturaResumo]:
    # Filtro que não casa com nada devolve `[]`, nunca 404: a tela distingue
    # "vazio" de "falhou", e trocar um pelo outro faz o usuário procurar
    # problema onde não tem.
    return await servico.listar(
        sessao,
        status=status_filtro,
        competencia=competencia,
        fornecedor_cnpj=fornecedor_cnpj,
        busca=busca,
    )


@roteador.get("/{fatura_id}", response_model=FaturaDetalhe)
async def obter(
    fatura_id: int, sessao: AsyncSession = Depends(get_db)
) -> FaturaDetalhe:
    try:
        return await servico.obter(sessao, fatura_id)
    except servico.NaoEncontrado as erro:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(erro)) from erro
