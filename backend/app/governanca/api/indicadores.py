"""Router dos indicadores do dashboard."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.governanca.schemas.indicador import Indicadores
from app.governanca.services import indicadores as servico

roteador = APIRouter(prefix="/indicadores", tags=["indicadores"])


@roteador.get("", response_model=Indicadores)
async def obter(
    # Extensão opcional ao contrato: sem o parâmetro, o serviço escolhe a
    # competência mais recente com dados — que é o comportamento acordado.
    competencia: str | None = Query(default=None),
    sessao: AsyncSession = Depends(get_db),
) -> Indicadores:
    return await servico.obter(sessao, competencia=competencia)
