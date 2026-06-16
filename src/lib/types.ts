import type { Role } from "./auth";

export interface UsuarioOut {
  id: string;
  nome: string;
  email: string;
  role: Role;
  team: string | null;
  fornecedor_id: string | null;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: UsuarioOut;
}

export interface FornecedorOut {
  id: string;
  nome: string;
  cnpj: string | null;
  email: string | null;
  telefone: string | null;
  categorias: string | null;
  created_at: string;
}

export type SolicitacaoStatus =
  | "aguardando_controle"
  | "rejeitada_controle"
  | "aguardando_proposta"
  | "proposta_enviada"
  | "aceita"
  | "recusada";

export interface SolicitacaoListItem {
  id: string;
  numero: string;
  titulo: string;
  tipo_servico: string | null;
  status: SolicitacaoStatus;
  fornecedor_id: string | null;
  fornecedor_nome: string | null;
  solicitante_nome: string | null;
  created_at: string;
}

export interface AnalisePFOut {
  metodologia: string;
  aba: string | null;
  total_campos: number;
  total_preenchidos: number;
  total_pendentes: number;
  completo: boolean;
  campos: { campo: string; preenchido: boolean; valor: string | null; observacao: string | null }[] | null;
  pendentes: string[] | null;
  resumo: string | null;
}

export interface DocumentoOut {
  id: string;
  nome: string;
  kind: string;
  content_type: string | null;
  url: string | null;
}

export interface PropostaOut {
  id: string;
  fornecedor_id: string;
  valor: number | null;
  prazo: string | null;
  observacoes: string | null;
  arquivo_nome: string | null;
  url: string | null;
  status: string;
  created_at: string;
}

export interface SolicitacaoDetail extends SolicitacaoListItem {
  area: string | null;
  prioridade: string | null;
  categoria: string | null;
  descricao: string | null;
  sistemas_impactados: string | null;
  entregaveis: string | null;
  complexidade: string | null;
  ambiente: string | null;
  prazo_entrega: string | null;
  prazo_resposta: string | null;
  modalidade: string | null;
  subtipo: string | null;
  senioridade: string | null;
  fin_type: string | null;
  iniciativa: string | null;
  urgencia: string | null;
  metodologia_pf: string | null;
  parecer_controle: string | null;
  estimativa_aprovada: string | null;
  decisao_solicitante: string | null;
  documentos: DocumentoOut[];
  analise_pf: AnalisePFOut | null;
  proposta: PropostaOut | null;
  form_json: Record<string, unknown> | null;
}

export const STATUS_LABELS: Record<SolicitacaoStatus, string> = {
  aguardando_controle: "Aguard. Controle",
  rejeitada_controle: "Rejeitada",
  aguardando_proposta: "Aguard. Proposta",
  proposta_enviada: "Proposta Recebida",
  aceita: "Aceita",
  recusada: "Recusada",
};

// ─── Contagem PF ─────────────────────────────────────────────────────────────

export interface FuncaoPFOut {
  id: string;
  ordem: number;
  descricao: string;
  tipo: string;
  complexidade: string | null;
  deflator_mnemonico: string | null;
  operacao: string | null;
  pf_bruto: number;
  pf_local: number;
}

export interface ContagemPFOut {
  id: string;
  titulo: string;
  metodologia: string;
  tipo_projeto: string;
  total_pf_bruto: number;
  total_pf_local: number;
  esforco_horas: number;
  created_at: string;
  usuario_nome: string | null;
  solicitacao_id: string | null;
}

export interface ContagemPFDetail extends ContagemPFOut {
  funcoes: FuncaoPFOut[];
  distribuicao: Record<string, number>;
  asfpb: number | null;
}

export interface FuncaoIFPUGIn {
  descricao: string;
  tipo: string;
  complexidade: string;
  deflator_mnemonico: string;
}

export interface FuncaoSFPIn {
  descricao: string;
  tipo: string;
  operacao: string;
}

export interface ContagemPFCreate {
  titulo: string;
  metodologia: string;
  tipo_projeto: string;
  funcoes_ifpug: FuncaoIFPUGIn[];
  funcoes_sfp: FuncaoSFPIn[];
  asfpb: number;
  solicitacao_id: string | null;
}

// ─── Configuração APF ─────────────────────────────────────────────────────────

export interface DeflatoreConfigItem {
  id?: string;
  mne: string;
  descricao: string;
  regra?: string;
  valor: number;
  tipo: string;
  destaque?: boolean;
  ativo: boolean;
  personalizado?: boolean;
}

export interface AlcadaConfig {
  id: string;
  cargo: string;
  ativa: boolean;
}

export interface FaixaDesvioConfig {
  id: string;
  desvioMin: number;
  desvioMax: number | null;
  acao: string;
  alcadaId: string;
  ativa: boolean;
}

export interface ConfiguracaoAPFCreate {
  metodologia: string;
  tipo_contagem: string;
  usar_vaf: boolean;
  vigencia: string;
  versao: string;
  usar_deflatores: boolean;
  deflatores_json: DeflatoreConfigItem[];
  valor_pf: number;
  tolerancia: number;
  valor_max_ce: number;
  saving_minimo: number;
  prazo_fornecedor: number;
  modalidade: string;
  alcadas_json: AlcadaConfig[];
  faixas_json: Record<string, FaixaDesvioConfig[]>;
  notificar_ce: string;
  enviar_copia: string;
}

export interface ConfiguracaoAPFOut extends ConfiguracaoAPFCreate {
  id: string;
  ativa: boolean;
  created_at: string;
}

export const STATUS_COLORS: Record<SolicitacaoStatus, string> = {
  aguardando_controle: "bg-warning/15 text-warning border-warning/30",
  rejeitada_controle: "bg-destructive/15 text-destructive border-destructive/30",
  aguardando_proposta: "bg-primary/15 text-primary border-primary/30",
  proposta_enviada: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  aceita: "bg-success/15 text-success border-success/30",
  recusada: "bg-muted text-muted-foreground border-muted",
};
