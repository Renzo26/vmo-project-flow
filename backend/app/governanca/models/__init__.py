"""Modelos ORM do módulo de governança (contas a pagar).

Importar tudo aqui é o que faz o `Base.metadata` ficar completo para o Alembic.
"""

from app.governanca.models.contrato import GovFornecedor, GovContrato, GovContratoItem
from app.governanca.models.documento import GovDocumentoColetado
from app.governanca.models.dossie import GovDossie, GovDossieArquivo, GovDossieTrilha
from app.governanca.models.linx import GovMovimentoLinx, GovPedidoLinx
from app.governanca.models.operacao import GovExecucaoAgente, GovFilaExcecao

__all__ = [
    "GovContrato",
    "GovContratoItem",
    "GovDocumentoColetado",
    "GovDossie",
    "GovDossieArquivo",
    "GovDossieTrilha",
    "GovExecucaoAgente",
    "GovFilaExcecao",
    "GovFornecedor",
    "GovMovimentoLinx",
    "GovPedidoLinx",
]
