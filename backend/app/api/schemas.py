from datetime import date, datetime
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


class AnalisePropostaOut(BaseModel):
    id: UUID
    pf_contagem: float | None = None
    pf_proposta: float | None = None
    variacao_pct: float | None = None
    valor_estimado: float | None = None
    valor_proposta: float | None = None
    acao_recomendada: str | None = None
    alcada_requerida: str | None = None
    status: str
    resumo: str | None = None
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
    analise_proposta: AnalisePropostaOut | None = None
    # Valores econômicos derivados da Configuração APF + contagem vinculada
    valor_pf_config: float | None = None
    valor_estimado: float | None = None
    valor_max_ce: float | None = None
    excede_teto_ce: bool = False
    form_json: dict | None = None


class AvalRequest(BaseModel):
    fornecedor_id: UUID | None = None
    parecer_controle: str | None = None
    estimativa_aprovada: str | None = None


class DecisaoRequest(BaseModel):
    decisao: str  # "aceita" | "recusada"


# ─── Contagem PF ─────────────────────────────────────────────────────────────

class FuncaoIFPUGIn(BaseModel):
    descricao: str
    tipo: str           # EE | SE | CE | ALI | AIE
    complexidade: str   # L | A | H
    deflator_mnemonico: str = "Inc-4.1"


class FuncaoSFPIn(BaseModel):
    descricao: str
    tipo: str      # AL | PE
    operacao: str  # ADD | CHG | DEL | CFP


class ContagemPFCreate(BaseModel):
    titulo: str
    metodologia: str        # sfp | ifpug
    tipo_projeto: str       # desenvolvimento | melhoria
    funcoes_ifpug: list[FuncaoIFPUGIn] = []
    funcoes_sfp: list[FuncaoSFPIn] = []
    asfpb: float = 0.0      # SFP melhoria: tamanho anterior
    solicitacao_id: UUID | None = None


class FuncaoPFOut(BaseModel):
    id: UUID
    ordem: int
    descricao: str
    tipo: str
    complexidade: str | None = None
    deflator_mnemonico: str | None = None
    operacao: str | None = None
    pf_bruto: float
    pf_local: float

    model_config = {"from_attributes": True}


class ContagemPFOut(BaseModel):
    id: UUID
    titulo: str
    metodologia: str
    tipo_projeto: str
    total_pf_bruto: float
    total_pf_local: float
    esforco_horas: float
    created_at: datetime
    usuario_nome: str | None = None
    solicitacao_id: UUID | None = None

    model_config = {"from_attributes": True}


class ContagemPFDetail(ContagemPFOut):
    funcoes: list[FuncaoPFOut] = []
    distribuicao: dict = {}
    asfpb: float | None = None


# ─── Configuração APF ─────────────────────────────────────────────────────────

class ConfiguracaoAPFCreate(BaseModel):
    metodologia: str
    tipo_contagem: str
    usar_vaf: bool = False
    vigencia: date
    versao: str
    usar_deflatores: bool = True
    deflatores_json: list[dict] = []
    valor_pf: float = 820.0
    tolerancia: float = 10.0
    valor_max_ce: float = 50000.0
    saving_minimo: float = 5.0
    prazo_fornecedor: int = 5
    modalidade: str = "Ponto de Função (PF)"
    alcadas_json: list[dict] = []
    faixas_json: dict = {}
    notificar_ce: str = "Qualquer recusa automática"
    enviar_copia: str = ""


class ConfiguracaoAPFOut(BaseModel):
    id: UUID
    metodologia: str
    tipo_contagem: str
    usar_vaf: bool
    vigencia: date
    versao: str
    usar_deflatores: bool
    deflatores_json: list[dict]
    valor_pf: float
    tolerancia: float
    valor_max_ce: float
    saving_minimo: float
    prazo_fornecedor: int
    modalidade: str
    alcadas_json: list[dict]
    faixas_json: dict
    notificar_ce: str
    enviar_copia: str
    ativa: bool
    created_at: datetime

    model_config = {"from_attributes": True}
