"""Router de ingestão — só tradução HTTP. A regra vive em `services/ingestao.py`."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.governanca.schemas.ingestao import IngestaoEntrada, IngestaoSaida
from app.governanca.services import ingestao as servico

roteador = APIRouter(prefix="/ingestao", tags=["ingestao"])


@roteador.post("/dossie", response_model=IngestaoSaida, status_code=status.HTTP_200_OK)
async def registrar(
    entrada: IngestaoEntrada, sessao: AsyncSession = Depends(get_db)
) -> IngestaoSaida:
    """Grava (ou substitui) o dossiê de um lançamento processado pelo agente.

    200 e não 201 de propósito: reprocessar o mesmo lançamento é o caso normal, e o
    corpo já diz em `criado` se a linha nasceu agora ou foi substituída. Um 201 fixo
    afirmaria criação em toda chamada.
    """
    try:
        return await servico.registrar(sessao, entrada)
    except servico.ErroDeIngestao as erro:
        raise HTTPException(
            status.HTTP_409_CONFLICT, {"mensagem": str(erro), "campo": None}
        ) from erro
