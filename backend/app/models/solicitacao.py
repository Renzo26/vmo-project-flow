import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class SolicitacaoStatus(str, enum.Enum):
    aguardando_controle = "aguardando_controle"
    rejeitada_controle = "rejeitada_controle"
    aguardando_proposta = "aguardando_proposta"
    proposta_enviada = "proposta_enviada"
    aceita = "aceita"
    recusada = "recusada"


class Solicitacao(Base):
    __tablename__ = "solicitacoes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    numero: Mapped[str] = mapped_column(String(30), nullable=False, unique=True, index=True)

    # Bloco 1 — Identificação
    titulo: Mapped[str] = mapped_column(String(300), nullable=False)
    area: Mapped[str | None] = mapped_column(String(200), nullable=True)
    prioridade: Mapped[str | None] = mapped_column(String(30), nullable=True)
    categoria: Mapped[str | None] = mapped_column(String(100), nullable=True)

    solicitante_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False, index=True
    )

    # Bloco 2 — Escopo
    descricao: Mapped[str | None] = mapped_column(Text, nullable=True)
    sistemas_impactados: Mapped[str | None] = mapped_column(Text, nullable=True)
    entregaveis: Mapped[str | None] = mapped_column(Text, nullable=True)
    complexidade: Mapped[str | None] = mapped_column(String(30), nullable=True)
    ambiente: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # Bloco 3 — Prazo / modalidade
    prazo_entrega: Mapped[str | None] = mapped_column(String(30), nullable=True)
    prazo_resposta: Mapped[str | None] = mapped_column(String(30), nullable=True)
    modalidade: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Tipo de serviço
    tipo_servico: Mapped[str | None] = mapped_column(String(100), nullable=True)
    subtipo: Mapped[str | None] = mapped_column(String(200), nullable=True)
    senioridade: Mapped[str | None] = mapped_column(String(30), nullable=True)

    # Classificação
    fin_type: Mapped[str | None] = mapped_column(String(10), nullable=True)
    iniciativa: Mapped[str | None] = mapped_column(String(50), nullable=True)
    urgencia: Mapped[str | None] = mapped_column(String(30), nullable=True)

    # Metodologia de contagem (Padrão de Entrada PF)
    metodologia_pf: Mapped[str | None] = mapped_column(String(20), nullable=True)

    # Campos adicionais do formulário (livre)
    form_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    # Workflow
    status: Mapped[SolicitacaoStatus] = mapped_column(
        Enum(SolicitacaoStatus, name="solicitacao_status"),
        nullable=False,
        default=SolicitacaoStatus.aguardando_controle,
    )
    fornecedor_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("fornecedores.id"), nullable=True, index=True
    )
    parecer_controle: Mapped[str | None] = mapped_column(Text, nullable=True)
    estimativa_aprovada: Mapped[str | None] = mapped_column(String(100), nullable=True)
    decisao_solicitante: Mapped[str | None] = mapped_column(String(20), nullable=True)

    aval_em: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    decidido_em: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
