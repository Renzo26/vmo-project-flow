"""Modelos ORM — contrato (governança)."""

from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean, CheckConstraint, Date, DateTime,
    ForeignKey, Integer, Numeric, String, Text, UniqueConstraint, func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.governanca.models.base import Base, _criado_em


class GovFornecedor(Base):
    __tablename__ = "gov_fornecedores"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    nome: Mapped[str] = mapped_column(String(200), nullable=False)
    cnpj: Mapped[str] = mapped_column(String(18), nullable=False, index=True)
    email_faturamento: Mapped[str | None] = mapped_column(String(200))
    criado_em: Mapped[datetime] = _criado_em()

    contratos: Mapped[list[GovContrato]] = relationship(back_populates="fornecedor")


class GovContrato(Base):
    __tablename__ = "gov_contratos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    numero: Mapped[str] = mapped_column(String(60), nullable=False, unique=True)
    fornecedor_id: Mapped[str | None] = mapped_column(
        ForeignKey("gov_fornecedores.id", ondelete="SET NULL")
    )
    fornecedor_cnpj: Mapped[str] = mapped_column(String(18), nullable=False, index=True)
    fornecedor_nome: Mapped[str] = mapped_column(String(200), nullable=False)
    objeto: Mapped[str | None] = mapped_column(Text)
    categoria_servico: Mapped[str | None] = mapped_column(String(120))
    gestor: Mapped[str | None] = mapped_column(String(120))
    email_fornecedor: Mapped[str | None] = mapped_column(String(200))
    vigencia_inicio: Mapped[date | None] = mapped_column(Date)
    vigencia_fim: Mapped[date | None] = mapped_column(Date)
    tolerancia_percentual: Mapped[Decimal] = mapped_column(
        Numeric(6, 3), nullable=False, server_default="0"
    )
    ativo: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="true")
    criado_em: Mapped[datetime] = _criado_em()

    fornecedor: Mapped[GovFornecedor | None] = relationship(back_populates="contratos")
    itens: Mapped[list[GovContratoItem]] = relationship(
        back_populates="contrato", cascade="all, delete-orphan"
    )

    __table_args__ = (
        CheckConstraint(
            "vigencia_fim IS NULL OR vigencia_inicio IS NULL OR vigencia_fim >= vigencia_inicio",
            name="gov_ck_contratos_vigencia_coerente",
        ),
    )


class GovContratoItem(Base):
    __tablename__ = "gov_contrato_itens"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    contrato_id: Mapped[int] = mapped_column(
        ForeignKey("gov_contratos.id", ondelete="CASCADE"), nullable=False
    )
    unidade: Mapped[str] = mapped_column(String(40), nullable=False)
    descricao: Mapped[str | None] = mapped_column(Text)
    valor_mensal: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)

    contrato: Mapped[GovContrato] = relationship(back_populates="itens")

    __table_args__ = (
        UniqueConstraint("contrato_id", "unidade", name="gov_uq_contrato_itens_unidade"),
        CheckConstraint("valor_mensal >= 0", name="gov_ck_contrato_itens_valor_nao_negativo"),
    )
