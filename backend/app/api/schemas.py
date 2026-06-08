from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr


# ─── Auth ───────────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: EmailStr
    senha: str


class UsuarioOut(BaseModel):
    id: UUID
    nome: str
    email: EmailStr
    role: str
    team: str | None = None
    fornecedor_id: UUID | None = None

    model_config = {"from_attributes": True}


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UsuarioOut


# ─── Fornecedores ───────────────────────────────────────────────────────────
class FornecedorResumo(BaseModel):
    id: UUID
    nome: str

    model_config = {"from_attributes": True}


class FornecedorCreate(BaseModel):
    nome: str
    cnpj: str | None = None
    email: EmailStr
    telefone: str | None = None
    categorias: str | None = None
    senha: str  # senha do login do fornecedor


class FornecedorOut(BaseModel):
    id: UUID
    nome: str
    cnpj: str | None = None
    email: str | None = None
    telefone: str | None = None
    categorias: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Solicitações ───────────────────────────────────────────────────────────
class AnalisePFOut(BaseModel):
    metodologia: str
    aba: str | None = None
    total_campos: int
    total_preenchidos: int
    total_pendentes: int
    completo: bool
    campos: list | None = None
    pendentes: list | None = None
    resumo: str | None = None

    model_config = {"from_attributes": True}


class DocumentoOut(BaseModel):
    id: UUID
    nome: str
    kind: str
    content_type: str | None = None
    url: str | None = None  # URL assinada, preenchida no detalhe

    model_config = {"from_attributes": True}


class PropostaOut(BaseModel):
    id: UUID
    fornecedor_id: UUID
    valor: float | None = None
    prazo: str | None = None
    observacoes: str | None = None
    arquivo_nome: str | None = None
    url: str | None = None
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class SolicitacaoListItem(BaseModel):
    id: UUID
    numero: str
    titulo: str
    tipo_servico: str | None = None
    status: str
    fornecedor_id: UUID | None = None
    fornecedor_nome: str | None = None
    solicitante_nome: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class SolicitacaoDetail(SolicitacaoListItem):
    area: str | None = None
    prioridade: str | None = None
    categoria: str | None = None
    descricao: str | None = None
    sistemas_impactados: str | None = None
    entregaveis: str | None = None
    complexidade: str | None = None
    ambiente: str | None = None
    prazo_entrega: str | None = None
    prazo_resposta: str | None = None
    modalidade: str | None = None
    subtipo: str | None = None
    senioridade: str | None = None
    fin_type: str | None = None
    iniciativa: str | None = None
    urgencia: str | None = None
    metodologia_pf: str | None = None
    parecer_controle: str | None = None
    estimativa_aprovada: str | None = None
    decisao_solicitante: str | None = None
    documentos: list[DocumentoOut] = []
    analise_pf: AnalisePFOut | None = None
    proposta: PropostaOut | None = None


class AvalRequest(BaseModel):
    fornecedor_id: UUID
    parecer_controle: str | None = None
    estimativa_aprovada: str | None = None


class DecisaoRequest(BaseModel):
    decisao: str  # "aceita" | "recusada"
