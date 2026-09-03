"""Esquema do módulo de governança — SQLAlchemy 2 declarativo.

Usa o Base do Metri (app.database) para que todas as tabelas compartilhem
o mesmo metadata e o Alembic veja tudo junto.
"""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base  # noqa: F401 — reexportado para conveniência

CANAIS = ("Portal", "Email", "Api", "SefazDFe", "UploadManual")
TIPOS_DOCUMENTO = ("Desconhecido", "NotaFiscal", "Boleto", "Fatura", "NotaFiscalComBoleto")
DESFECHOS = (
    "LiberadoParaPagamento",
    "DevolvidoAoFornecedor",
    "TravadoAguardandoPedido",
    "PendenteConferenciaHumana",
)
SITUACOES_MEDICAO = ("Aderente", "NaoAderente", "NaoMensuravel")
SITUACOES_CONFERENCIA = ("Conforme", "Divergente", "PedidoNaoLocalizado")
MOTIVOS_NAO_ADERENCIA = (
    "Nenhum",
    "ValorAcimaDoContrato",
    "UnidadeNaoCoberta",
    "ForaDaVigencia",
    "SemContratoCadastrado",
    "ValorIlegivel",
    "CompetenciaIndefinida",
)
MOTIVOS_FALHA = (
    "Nenhum",
    "CredencialInvalida",
    "DesafioAntiRobo",
    "LayoutAlterado",
    "PortalIndisponivel",
    "ErroInesperado",
)


def _em(coluna: str, valores: tuple[str, ...], nome: str) -> CheckConstraint:
    lista = ", ".join(f"'{v}'" for v in valores)
    return CheckConstraint(f"{coluna} IN ({lista})", name=nome)


def _criado_em() -> Mapped[datetime]:
    return mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
