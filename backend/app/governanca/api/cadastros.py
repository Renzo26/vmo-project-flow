"""Router da aba Cadastros — fornecedores e unidades.

Um router só para as duas listas: elas compartilham a mesma tela e a mesma
origem (contratos), e separá-las em dois arquivos só espalharia três linhas.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.governanca.schemas.cadastro import FornecedorResumo, UnidadeResumo
from app.governanca.services import cadastros as servico

roteador = APIRouter(tags=["cadastros"])


@roteador.get("/fornecedores", response_model=list[FornecedorResumo])
async def listar_fornecedores(
    sessao: AsyncSession = Depends(get_db),
) -> list[FornecedorResumo]:
    return await servico.listar_fornecedores(sessao)


@roteador.get("/unidades", response_model=list[UnidadeResumo])
async def listar_unidades(
    sessao: AsyncSession = Depends(get_db),
) -> list[UnidadeResumo]:
    return await servico.listar_unidades(sessao)
