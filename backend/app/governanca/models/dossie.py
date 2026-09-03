"""Modelos ORM — dossie (governança)."""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean, CheckConstraint, Computed, DateTime,
    ForeignKey, Integer, Numeric, String, Text, UniqueConstraint, func,
)
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.governanca.models.base import (
    DESFECHOS, MOTIVOS_NAO_ADERENCIA,
    SITUACOES_CONFERENCIA, SITUACOES_MEDICAO, Base, _criado_em, _em,
)


class GovDossie(Base):
    __tablename__ = "gov_dossies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    lancamento_referencia: Mapped[str] = mapped_column(String(120), nullable=False)
    fornecedor_id: Mapped[str] = mapped_column(String(64), nullable=False)
    fornecedor_nome: Mapped[str] = mapped_column(String(200), nullable=False)
    fornecedor_cnpj: Mapped[str] = mapped_column(String(18), nullable=False)
    canal: Mapped[str | None] = mapped_column(String(20))

    processado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    desfecho: Mapped[str] = mapped_column(String(40), nullable=False, index=True)

    competencia: Mapped[str | None] = mapped_column(String(7), index=True)
    unidade: Mapped[str | None] = mapped_column(String(200))
    numero_nota_fiscal: Mapped[str | None] = mapped_column(String(60))
    numero_fatura: Mapped[str | None] = mapped_column(String(60))
    vencimento: Mapped[str | None] = mapped_column(String(20))
    valor: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))

    medicao_situacao: Mapped[str | None] = mapped_column(String(20))
    medicao_motivo: Mapped[str | None] = mapped_column(String(40))
    medicao_explicacao: Mapped[str | None] = mapped_column(Text)
    medicao_contrato_numero: Mapped[str | None] = mapped_column(String(60))
    medicao_item_contratado: Mapped[str | None] = mapped_column(Text)
    medicao_valor_contratado: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    medicao_valor_cobrado: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    medicao_observacao: Mapped[str | None] = mapped_column(Text)

    conferencia_pedido_numero: Mapped[str | None] = mapped_column(String(40))
    conferencia_valor_pedido: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    conferencia_valor_documento: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    conferencia_explicacao: Mapped[str | None] = mapped_column(Text)
    conferencia_situacao: Mapped[str | None] = mapped_column(String(24))
    conferencia_divergencias: Mapped[list[str] | None] = mapped_column(ARRAY(Text))
    conferencia_conforme: Mapped[bool | None] = mapped_column(
        Boolean, Computed("conferencia_situacao = 'Conforme'", persisted=True)
    )

    protocolo_linx: Mapped[str | None] = mapped_column(String(60))
    rascunho_devolucao: Mapped[str | None] = mapped_column(Text)
    destinatario_rascunho: Mapped[str | None] = mapped_column(String(200))

    criado_em: Mapped[datetime] = _criado_em()
    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    arquivos: Mapped[list[GovDossieArquivo]] = relationship(
        back_populates="dossie", cascade="all, delete-orphan"
    )
    trilha: Mapped[list[GovDossieTrilha]] = relationship(
        back_populates="dossie", cascade="all, delete-orphan", order_by="GovDossieTrilha.ordem"
    )

    __table_args__ = (
        UniqueConstraint("fornecedor_id", "lancamento_referencia", name="gov_uq_dossies_lancamento"),
        _em("desfecho", DESFECHOS, "gov_ck_dossies_desfecho"),
        CheckConstraint(
            f"medicao_situacao IS NULL OR medicao_situacao IN "
            f"({', '.join(repr(v) for v in SITUACOES_MEDICAO)})",
            name="gov_ck_dossies_medicao_situacao",
        ),
        CheckConstraint(
            f"medicao_motivo IS NULL OR medicao_motivo IN "
            f"({', '.join(repr(v) for v in MOTIVOS_NAO_ADERENCIA)})",
            name="gov_ck_dossies_medicao_motivo",
        ),
        CheckConstraint(
            f"conferencia_situacao IS NULL OR conferencia_situacao IN "
            f"({', '.join(repr(v) for v in SITUACOES_CONFERENCIA)})",
            name="gov_ck_dossies_conferencia_situacao",
        ),
    )


class GovDossieArquivo(Base):
    __tablename__ = "gov_dossie_arquivos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    dossie_id: Mapped[int] = mapped_column(
        ForeignKey("gov_dossies.id", ondelete="CASCADE"), nullable=False
    )
    nome_origem: Mapped[str] = mapped_column(String(400), nullable=False)
    nome_final: Mapped[str] = mapped_column(String(400), nullable=False)
    tipo: Mapped[str] = mapped_column(String(24), nullable=False)
    hash_sha256: Mapped[str] = mapped_column(String(64), nullable=False)

    dossie: Mapped[GovDossie] = relationship(back_populates="arquivos")

    __table_args__ = (
        _em("tipo", ("Desconhecido", "NotaFiscal", "Boleto", "Fatura", "NotaFiscalComBoleto"),
             "gov_ck_dossie_arquivos_tipo"),
    )


class GovDossieTrilha(Base):
    __tablename__ = "gov_dossie_trilha"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    dossie_id: Mapped[int] = mapped_column(
        ForeignKey("gov_dossies.id", ondelete="CASCADE"), nullable=False
    )
    ordem: Mapped[int] = mapped_column(Integer, nullable=False)
    texto: Mapped[str] = mapped_column(Text, nullable=False)

    dossie: Mapped[GovDossie] = relationship(back_populates="trilha")

    __table_args__ = (UniqueConstraint("dossie_id", "ordem", name="gov_uq_dossie_trilha_ordem"),)
