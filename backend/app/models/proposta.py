import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class PropostaStatus(str, enum.Enum):
    enviada = "enviada"
    aceita = "aceita"
    recusada = "recusada"


class Proposta(Base):
    __tablename__ = "propostas"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    solicitacao_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("solicitacoes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    fornecedor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("fornecedores.id"), nullable=False, index=True
    )
    valor: Mapped[float | None] = mapped_column(Numeric(14, 2), nullable=True)
    prazo: Mapped[str | None] = mapped_column(String(50), nullable=True)
    observacoes: Mapped[str | None] = mapped_column(Text, nullable=True)
    storage_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    arquivo_nome: Mapped[str | None] = mapped_column(String(300), nullable=True)
    status: Mapped[PropostaStatus] = mapped_column(
        Enum(PropostaStatus, name="proposta_status"), nullable=False, default=PropostaStatus.enviada
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
