import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class AnaliseProposta(Base):
    __tablename__ = "analise_proposta"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    solicitacao_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("solicitacoes.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    proposta_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("propostas.id", ondelete="SET NULL"), nullable=True,
    )

    pf_contagem: Mapped[float | None] = mapped_column(Float, nullable=True)
    pf_proposta: Mapped[float | None] = mapped_column(Float, nullable=True)
    variacao_pct: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Valores econômicos (PF × R$/PF da config ativa)
    valor_estimado: Mapped[float | None] = mapped_column(Float, nullable=True)
    valor_proposta: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Parecer derivado das faixas de desvio configuradas
    acao_recomendada: Mapped[str | None] = mapped_column(String(30), nullable=True)
    alcada_requerida: Mapped[str | None] = mapped_column(String(120), nullable=True)

    # ok | atencao | divergente | sem_contagem | sem_pf_proposta
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="processando")
    resumo: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False,
    )
