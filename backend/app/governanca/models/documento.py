"""Modelos ORM — documento (governança)."""

from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    BigInteger, CheckConstraint, DateTime,
    Integer, Numeric, String, Text, UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.governanca.models.base import (
    CANAIS, TIPOS_DOCUMENTO, Base, _criado_em, _em,
)


class GovDocumentoColetado(Base):
    __tablename__ = "gov_documentos_coletados"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    fornecedor_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    fornecedor_nome: Mapped[str] = mapped_column(String(200), nullable=False)
    fornecedor_cnpj: Mapped[str] = mapped_column(String(18), nullable=False)
    canal: Mapped[str] = mapped_column(String(20), nullable=False)
    tipo: Mapped[str] = mapped_column(String(24), nullable=False)

    nome_arquivo_origem: Mapped[str] = mapped_column(String(400), nullable=False)
    caminho_relativo: Mapped[str] = mapped_column(String(600), nullable=False)
    hash_sha256: Mapped[str] = mapped_column(String(64), nullable=False)
    tamanho_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)

    chave_natural: Mapped[str] = mapped_column(String(400), nullable=False)

    id_origem: Mapped[str | None] = mapped_column(String(80))
    numero_fatura: Mapped[str | None] = mapped_column(String(60), index=True)
    numero_nota_fiscal: Mapped[str | None] = mapped_column(String(60))
    serie_nota_fiscal: Mapped[str | None] = mapped_column(String(10))
    numero_pedido: Mapped[str | None] = mapped_column(String(40))
    competencia: Mapped[str | None] = mapped_column(String(7))
    unidade: Mapped[str | None] = mapped_column(String(200))
    emissao: Mapped[str | None] = mapped_column(String(20))
    vencimento: Mapped[str | None] = mapped_column(String(20))
    valor: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))

    coletado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    criado_em: Mapped[datetime] = _criado_em()

    __table_args__ = (
        UniqueConstraint("hash_sha256", name="gov_uq_documentos_hash"),
        UniqueConstraint("chave_natural", name="gov_uq_documentos_chave_natural"),
        _em("canal", CANAIS, "gov_ck_documentos_canal"),
        _em("tipo", TIPOS_DOCUMENTO, "gov_ck_documentos_tipo"),
        CheckConstraint("tamanho_bytes > 0", name="gov_ck_documentos_tamanho"),
    )
