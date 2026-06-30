import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class ContagemPF(Base):
    __tablename__ = "contagens_pf"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    titulo: Mapped[str] = mapped_column(String(300), nullable=False)
    metodologia: Mapped[str] = mapped_column(String(10), nullable=False)   # sfp | ifpug
    tipo_projeto: Mapped[str] = mapped_column(String(20), nullable=False)  # desenvolvimento | melhoria

    total_pf_bruto: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    total_pf_local: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    esforco_horas: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    distribuicao_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    # SFP melhoria: tamanho da aplicação antes
    asfpb: Mapped[float | None] = mapped_column(Float, nullable=True)

    usuario_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False
    )
    solicitacao_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("solicitacoes.id"), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class FuncaoPF(Base):
    __tablename__ = "funcoes_pf"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    contagem_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("contagens_pf.id", ondelete="CASCADE"), nullable=False, index=True
    )

    ordem: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    descricao: Mapped[str] = mapped_column(Text, nullable=False)

    # IFPUG: tipo (EE/SE/CE/ALI/AIE) + complexidade (L/A/H) + deflator
    tipo: Mapped[str] = mapped_column(String(10), nullable=False)
    complexidade: Mapped[str | None] = mapped_column(String(5), nullable=True)
    deflator_mnemonico: Mapped[str | None] = mapped_column(String(20), nullable=True)

    # SFP: operacao (ADD/CHG/DEL/CFP)
    operacao: Mapped[str | None] = mapped_column(String(10), nullable=True)

    # APF detalhada: DER (campos) e ALR/RET (entidades referenciadas) usados na complexidade
    der: Mapped[int | None] = mapped_column(Integer, nullable=True)
    alr: Mapped[int | None] = mapped_column(Integer, nullable=True)

    pf_bruto: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    pf_local: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
