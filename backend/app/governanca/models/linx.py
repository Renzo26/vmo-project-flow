"""Modelos ORM — linx (governança)."""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    CheckConstraint, DateTime,
    Index, Integer, Numeric, String, Text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.governanca.models.base import Base, _criado_em


class GovPedidoLinx(Base):
    __tablename__ = "gov_pedidos_linx"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    numero: Mapped[str] = mapped_column(String(40), nullable=False, unique=True)
    fornecedor_cnpj: Mapped[str] = mapped_column(String(18), nullable=False)
    unidade: Mapped[str] = mapped_column(String(40), nullable=False)
    competencia: Mapped[str] = mapped_column(String(7), nullable=False)
    valor: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    status: Mapped[str] = mapped_column(String(30), nullable=False, server_default="Aberto")
    area_requisitante: Mapped[str | None] = mapped_column(String(120))
    email_requisitante: Mapped[str | None] = mapped_column(String(200))
    descricao: Mapped[str | None] = mapped_column(Text)

    __table_args__ = (
        Index(
            "gov_ix_pedidos_linx_busca",
            "fornecedor_cnpj", "unidade", "competencia", "valor",
        ),
        CheckConstraint("competencia ~ '^[0-9]{4}-[0-9]{2}$'", name="gov_ck_pedidos_linx_competencia"),
    )


class GovMovimentoLinx(Base):
    __tablename__ = "gov_linx_movimentos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tipo: Mapped[str] = mapped_column(String(40), nullable=False, index=True)
    lancamento_referencia: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    fornecedor_cnpj: Mapped[str | None] = mapped_column(String(18))
    pedido_numero: Mapped[str | None] = mapped_column(String(40))
    protocolo: Mapped[str | None] = mapped_column(String(60))
    valor: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    detalhe: Mapped[str | None] = mapped_column(Text)
    registrado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    criado_em: Mapped[datetime] = _criado_em()
