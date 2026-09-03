"""Router da fila de pendências."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.governanca.schemas.pendencia import Pendencia
from app.governanca.services import pendencias as servico

roteador = APIRouter(prefix="/pendencias", tags=["pendencias"])


@roteador.get("", response_model=list[Pendencia])
async def listar(sessao: AsyncSession = Depends(get_db)) -> list[Pendencia]:
    return await servico.listar(sessao)
