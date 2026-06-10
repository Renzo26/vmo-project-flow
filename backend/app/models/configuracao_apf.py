import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class ConfiguracaoAPF(Base):
    __tablename__ = "configuracoes_apf"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Metodologia
    metodologia: Mapped[str] = mapped_column(String, nullable=False, default="IFPUG — CPM 4.3.1 (padrão BRAESP)")
    tipo_contagem: Mapped[str] = mapped_column(String, nullable=False, default="DSFP — Novo desenvolvimento")
    usar_vaf: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    vigencia: Mapped[date] = mapped_column(Date, nullable=False)
    versao: Mapped[str] = mapped_column(String, nullable=False, default="v2026.1")

    # Deflatores
    usar_deflatores: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    deflatores_json: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)

    # Parâmetros econômicos
    valor_pf: Mapped[float] = mapped_column(Float, nullable=False, default=820.0)
    tolerancia: Mapped[float] = mapped_column(Float, nullable=False, default=10.0)
    valor_max_ce: Mapped[float] = mapped_column(Float, nullable=False, default=50000.0)
    saving_minimo: Mapped[float] = mapped_column(Float, nullable=False, default=5.0)
    prazo_fornecedor: Mapped[int] = mapped_column(Integer, nullable=False, default=5)
    modalidade: Mapped[str] = mapped_column(String, nullable=False, default="Ponto de Função (PF)")

    # Alçadas e faixas
    alcadas_json: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    faixas_json: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    notificar_ce: Mapped[str] = mapped_column(String, nullable=False, default="Qualquer recusa automática")
    enviar_copia: Mapped[str] = mapped_column(String, nullable=False, default="")

    # Meta
    ativa: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    criado_por: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
