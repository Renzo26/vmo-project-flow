import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class AnalisePF(Base):
    __tablename__ = "analises_pf"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    solicitacao_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("solicitacoes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    metodologia: Mapped[str] = mapped_column(String(20), nullable=False)
    aba: Mapped[str | None] = mapped_column(String(50), nullable=True)
    total_campos: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total_preenchidos: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total_pendentes: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    completo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    campos: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    pendentes: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    resumo: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
