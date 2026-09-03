import { z } from "zod";

const BASE = import.meta.env["VITE_API_URL"] ?? "http://localhost:8000";

export class ErroDeValidacao extends Error {
  constructor(
    message: string,
    readonly campo?: string,
  ) {
    super(message);
    this.name = "ErroDeValidacao";
  }
}

export class ErroNaoEncontrado extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ErroNaoEncontrado";
  }
}

const itemSchema = z.object({
  id: z.number().optional(),
  unidade: z.string().min(1, "Informe a unidade."),
  descricao: z.string().nullable().optional(),
  valor_mensal: z.coerce.number().min(0, "O valor não pode ser negativo."),
});

export const contratoSchema = z
  .object({
    numero: z.string().min(1, "Informe o número do contrato."),
    fornecedor_cnpj: z
      .string()
      .refine((v) => v.replace(/\D/g, "").length === 14, "CNPJ deve ter 14 dígitos."),
    fornecedor_nome: z.string().min(1, "Informe o nome do fornecedor."),
    fornecedor_id: z.string().nullable().optional(),
    objeto: z.string().nullable().optional(),
    categoria_servico: z.string().nullable().optional(),
    gestor: z.string().nullable().optional(),
    email_fornecedor: z.string().nullable().optional(),
    vigencia_inicio: z.string().nullable().optional(),
    vigencia_fim: z.string().nullable().optional(),
    tolerancia_percentual: z.coerce.number().min(0).max(100),
    ativo: z.boolean(),
    itens: z.array(itemSchema).min(1, "Um contrato precisa de ao menos uma unidade."),
  })
  .refine(
    (c) => !c.vigencia_inicio || !c.vigencia_fim || c.vigencia_fim >= c.vigencia_inicio,
    { message: "A vigência final não pode ser anterior à inicial.", path: ["vigencia_fim"] },
  );

export type ContratoFormulario = z.input<typeof contratoSchema>;
export type ContratoItem = z.infer<typeof itemSchema>;

export type ContratoResumo = {
  id: number;
  numero: string;
  fornecedor_nome: string;
  fornecedor_cnpj: string;
  categoria_servico: string | null;
  vigencia_inicio: string | null;
  vigencia_fim: string | null;
  tolerancia_percentual: string;
  ativo: boolean;
  total_itens: number;
  valor_mensal_total: string;
};

export type Contrato = z.infer<typeof contratoSchema> & { id: number };

async function pedir<T>(caminho: string, init?: RequestInit): Promise<T> {
  let resposta: Response;

  try {
    resposta = await fetch(`${BASE}/api/governanca${caminho}`, {
      ...init,
      headers: { "content-type": "application/json", ...init?.headers },
    });
  } catch {
    throw new Error(`Não foi possível falar com a API (${BASE}). Ela está no ar?`);
  }

  if (resposta.status === 204) return undefined as T;

  const corpo = await resposta.json().catch(() => null);

  if (resposta.ok) return corpo as T;

  if (resposta.status === 404) {
    throw new ErroNaoEncontrado(
      typeof corpo?.detail === "string" ? corpo.detail : "Registro não encontrado.",
    );
  }

  if (resposta.status === 409 && corpo?.detail?.mensagem) {
    throw new ErroDeValidacao(corpo.detail.mensagem, corpo.detail.campo ?? undefined);
  }

  if (resposta.status === 422 && Array.isArray(corpo?.detail)) {
    const primeiro = corpo.detail[0];
    const campo = Array.isArray(primeiro?.loc)
      ? primeiro.loc.filter((p: unknown) => p !== "body").join(".")
      : undefined;
    throw new ErroDeValidacao(primeiro?.msg ?? "Dados inválidos.", campo || undefined);
  }

  throw new Error(`A API respondeu ${resposta.status}. Verifique o log do servidor.`);
}

export type StatusFatura = "conciliada" | "divergente" | "pendente" | "recebida";

export type Indicadores = {
  competencia: string;
  total_faturas: number;
  conciliadas: number;
  divergentes: number;
  pendentes: number;
  valor_total: string;
  valor_liberado: string;
  valor_retido: string;
  economia_identificada: string;
  ultima_execucao: string | null;
};

export type FaturaResumo = {
  id: number;
  referencia: string;
  fornecedor: string;
  fornecedor_cnpj: string;
  unidade: string;
  servico: string;
  pedido: string | null;
  valor: string;
  valor_pedido: string | null;
  competencia: string;
  emissao: string | null;
  vencimento: string | null;
  status: StatusFatura;
  canal: string;
  processado_em: string | null;
};

export type ArquivoFatura = {
  nome_origem: string;
  nome_final: string | null;
  tipo: string;
  hash_sha256: string;
};

export type MedicaoFatura = {
  situacao: string;
  motivo: string;
  contrato_numero: string | null;
  item_contratado: string | null;
  valor_contratado: string | null;
  valor_cobrado: string;
  divergencia: string;
  divergencia_percentual: string;
  explicacao: string;
};

export type ConferenciaFatura = {
  pedido_numero: string | null;
  valor_pedido: string | null;
  conforme: boolean;
  explicacao: string;
};

export type FaturaDetalhe = FaturaResumo & {
  arquivos: ArquivoFatura[];
  medicao: MedicaoFatura | null;
  conferencia: ConferenciaFatura | null;
  protocolo_linx: string | null;
  destinatario_rascunho: string | null;
  trilha: string[];
};

export type TipoPendencia =
  | "Valor diferente"
  | "Pedido não encontrado"
  | "Unidade não identificada"
  | "Sem contrato cadastrado";

export type PrioridadePendencia = "Alta" | "Média" | "Baixa";

export type Pendencia = {
  id: number;
  fatura_id: number | null;
  referencia: string;
  tipo: TipoPendencia;
  prioridade: PrioridadePendencia;
  descricao: string;
  fornecedor: string;
  unidade: string;
  valor: string;
  competencia: string;
  aberta_em: string;
  responsavel: string;
};

export type Fornecedor = {
  id: string;
  nome: string;
  cnpj: string;
  email_faturamento: string | null;
  contratos_ativos: number;
  situacao: string;
};

export type Unidade = {
  codigo: string;
  servico: string | null;
  contratos: number;
  situacao: string;
};

export type FiltrosFatura = {
  status?: string | undefined;
  competencia?: string | undefined;
  fornecedor_cnpj?: string | undefined;
  busca?: string | undefined;
};

function comFiltros(caminho: string, filtros: Record<string, string | undefined>) {
  const busca = new URLSearchParams();
  for (const [chave, valor] of Object.entries(filtros)) {
    if (valor) busca.set(chave, valor);
  }
  const consulta = busca.toString();
  return consulta ? `${caminho}?${consulta}` : caminho;
}

export const govApi = {
  listarContratos: () => pedir<ContratoResumo[]>("/contratos"),
  obterContrato: (id: number) => pedir<Contrato>(`/contratos/${id}`),
  criarContrato: (dados: unknown) =>
    pedir<Contrato>("/contratos", { method: "POST", body: JSON.stringify(dados) }),
  atualizarContrato: (id: number, dados: unknown) =>
    pedir<Contrato>(`/contratos/${id}`, { method: "PUT", body: JSON.stringify(dados) }),
  inativarContrato: (id: number) =>
    pedir<void>(`/contratos/${id}`, { method: "DELETE" }),

  obterIndicadores: () => pedir<Indicadores>("/indicadores"),
  listarFaturas: (filtros: FiltrosFatura = {}) =>
    pedir<FaturaResumo[]>(comFiltros("/faturas", filtros)),
  obterFatura: (id: number) => pedir<FaturaDetalhe>(`/faturas/${id}`),
  listarPendencias: () => pedir<Pendencia[]>("/pendencias"),
  listarFornecedores: () => pedir<Fornecedor[]>("/fornecedores"),
  listarUnidades: () => pedir<Unidade[]>("/unidades"),
};

export { brl, dataBr, mascararCnpj } from "./formato";
