"""Modelos ORM — operacao (governança)."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import (
    CheckConstraint, DateTime,
    Index, Integer, String, Text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.governanca.models.base import MOTIVOS_FALHA, Base, _criado_em


class GovFilaExcecao(Base):
    __tablename__ = "gov_fila_excecoes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    fornecedor_id: Mapped[str | None] = mapped_column(String(64), index=True)
    lancamento_referencia: Mapped[str | None] = mapped_column(String(120))
    nome_arquivo: Mapped[str | None] = mapped_column(String(400))
    motivo: Mapped[str] = mapped_column(String(60), nullable=False)
    acao: Mapped[str | None] = mapped_column(String(60))
    detalhe: Mapped[str | None] = mapped_column(Text)

    criado_em: Mapped[datetime] = _criado_em()
    resolvido_em: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    resolvido_por: Mapped[str | None] = mapped_column(String(120))

    __table_args__ = (
        Index(
            "gov_ix_fila_excecoes_abertas",
            "criado_em",
            postgresql_where=(resolvido_em.is_(None)),
        ),
    )


class GovExecucaoAgente(Base):
    __tablename__ = "gov_execucoes_agente"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    fornecedor_id: Mapped[str | None] = mapped_column(String(64), index=True)
    canal: Mapped[str | None] = mapped_column(String(20))
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    motivo_falha: Mapped[str | None] = mapped_column(String(40))
    documentos_novos: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    documentos_ignorados: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    detalhe: Mapped[str | None] = mapped_column(Text)
    iniciada_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    finalizada_em: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    __table_args__ = (
        CheckConstraint(
            "status IN ('EmAndamento', 'Sucesso', 'Parcial', 'Falha')",
            name="gov_ck_execucoes_status",
        ),
        CheckConstraint(
            f"motivo_falha IS NULL OR motivo_falha IN "
            f"({', '.join(repr(v) for v in MOTIVOS_FALHA)})",
            name="gov_ck_execucoes_motivo_falha",
        ),
    )
