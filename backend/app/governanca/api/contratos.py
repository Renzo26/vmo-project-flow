"""Router de contratos — só tradução HTTP. A regra vive em `services/contratos.py`."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.governanca.schemas.contrato import ContratoEntrada, ContratoResumo, ContratoSaida
from app.governanca.services import contratos as servico

roteador = APIRouter(prefix="/contratos", tags=["contratos"])


@roteador.get("", response_model=list[ContratoResumo])
async def listar(
    apenas_ativos: bool = Query(default=False),
    sessao: AsyncSession = Depends(get_db),
):
    return await servico.listar(sessao, apenas_ativos=apenas_ativos)


@roteador.get("/{contrato_id}", response_model=ContratoSaida)
async def obter(contrato_id: int, sessao: AsyncSession = Depends(get_db)):
    try:
        return await servico.obter(sessao, contrato_id)
    except servico.NaoEncontrado as erro:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(erro)) from erro


@roteador.post("", response_model=ContratoSaida, status_code=status.HTTP_201_CREATED)
async def criar(dados: ContratoEntrada, sessao: AsyncSession = Depends(get_db)):
    try:
        return await servico.criar(sessao, dados)
    except servico.ErroDeNegocio as erro:
        raise _conflito(erro) from erro


@roteador.put("/{contrato_id}", response_model=ContratoSaida)
async def atualizar(
    contrato_id: int, dados: ContratoEntrada, sessao: AsyncSession = Depends(get_db)
):
    try:
        return await servico.atualizar(sessao, contrato_id, dados)
    except servico.NaoEncontrado as erro:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(erro)) from erro
    except servico.ErroDeNegocio as erro:
        raise _conflito(erro) from erro


@roteador.delete("/{contrato_id}", status_code=status.HTTP_204_NO_CONTENT)
async def inativar(contrato_id: int, sessao: AsyncSession = Depends(get_db)):
    try:
        await servico.excluir(sessao, contrato_id)
    except servico.NaoEncontrado as erro:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(erro)) from erro


def _conflito(erro: servico.ErroDeNegocio) -> HTTPException:
    """409 com o CAMPO culpado, para o formulário destacar onde está o problema."""
    return HTTPException(
        status.HTTP_409_CONFLICT,
        detail={"mensagem": erro.mensagem, "campo": erro.campo},
    )
