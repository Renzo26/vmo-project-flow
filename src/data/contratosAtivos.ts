/**
 * Base mock do módulo "Contratos ativos" (frontend only — sem backend por enquanto).
 * Quando o backend existir, trocar por chamadas via TanStack Query em `@/lib/api`.
 */

export type ContratoStatus = "vigente" | "a_vencer" | "vencido";

export interface PedidoCompra {
  numero: string;
  descricao: string;
  saldo: number;
}

export interface NotaFiscalRegistrada {
  numero: string;
  serie: string;
  emissao: string; // ISO "YYYY-MM-DD"
  valor: number;
  situacao: "Em análise" | "Aprovada" | "Recusada";
}

export interface ContratoAtivo {
  id: string;
  numero: string;
  fornecedor: string;
  cnpj: string;
  /** Filiais habilitadas a emitir nota contra o contrato. */
  cnpjsEmissores: { cnpj: string; nome: string }[];
  objeto: string;
  gestor: string;
  vigenciaInicio: string; // ISO
  vigenciaFim: string; // ISO
  valorTotal: number;
  valorConsumido: number;
  valorPF: number;
  pedidos: PedidoCompra[];
  projetos: string[];
  notas: NotaFiscalRegistrada[];
}

export const TIPOS_NOTA = [
  "Serviço",
  "Material",
  "Serviço e Material",
  "Reembolso",
] as const;

/** Espécies aceitas no registro de nota fiscal. */
export const ESPECIES_NOTA = [
  "Nota fiscal de serviço",
  "Nota fiscal eletrônica – SEFAZ",
  "Reembolso de despesas financeiras",
  "Recibo",
  "Fatura",
  "Conhecimento de Transporte",
  "Nota fiscal de serviço de transporte",
  "Nota fiscal de serviço de comunicação",
  "Conta de energia elétrica",
  "Leasing",
  "Nota Fiscal de Serviço de Telecomunicações",
] as const;

export const UNIDADES_ITEM = ["PF", "Hora", "Serviço", "Mês", "Unidade"] as const;

export const contratosAtivos: ContratoAtivo[] = [
  {
    id: "ct-2024-018",
    numero: "CT-2024-018",
    fornecedor: "Sonda Procwork Informática",
    cnpj: "60.912.221/0001-45",
    cnpjsEmissores: [
      { cnpj: "60.912.221/0001-45", nome: "Sonda Procwork Informática Ltda — Matriz" },
      { cnpj: "60.912.221/0004-88", nome: "Sonda Procwork Informática Ltda — Filial SP" },
    ],
    objeto: "Fábrica de software — sustentação e evolução de sistemas",
    gestor: "Renzo Arthur",
    vigenciaInicio: "2024-03-01",
    vigenciaFim: "2026-11-30",
    valorTotal: 4_200_000,
    valorConsumido: 3_118_400,
    valorPF: 820,
    pedidos: [
      { numero: "PC-104582", descricao: "Sustentação — 4º trimestre", saldo: 486_000 },
      { numero: "PC-104931", descricao: "Evolutivas — Portal do cliente", saldo: 312_500 },
    ],
    projetos: ["PRJ-0142", "PRJ-0177"],
    notas: [
      { numero: "18452", serie: "1", emissao: "2026-07-05", valor: 184_500, situacao: "Aprovada" },
      { numero: "18610", serie: "1", emissao: "2026-08-05", valor: 176_200, situacao: "Em análise" },
    ],
  },
  {
    id: "ct-2023-044",
    numero: "CT-2023-044",
    fornecedor: "Stefanini Consultoria",
    cnpj: "58.069.360/0001-20",
    cnpjsEmissores: [
      { cnpj: "58.069.360/0001-20", nome: "Stefanini Consultoria e Assessoria S.A. — Matriz" },
    ],
    objeto: "Alocação de squads — canais digitais",
    gestor: "Camila Ferraz",
    vigenciaInicio: "2023-09-15",
    vigenciaFim: "2026-09-14",
    valorTotal: 2_750_000,
    valorConsumido: 2_512_900,
    valorPF: 795,
    pedidos: [{ numero: "PC-098120", descricao: "Squad canais — mensal", saldo: 128_400 }],
    projetos: ["PRJ-0098"],
    notas: [{ numero: "9921", serie: "3", emissao: "2026-08-01", valor: 210_400, situacao: "Aprovada" }],
  },
  {
    id: "ct-2025-007",
    numero: "CT-2025-007",
    fornecedor: "Meta Tecnologia da Informação",
    cnpj: "04.231.777/0001-09",
    cnpjsEmissores: [
      { cnpj: "04.231.777/0001-09", nome: "Meta Tecnologia da Informação Ltda — Matriz" },
      { cnpj: "04.231.777/0002-81", nome: "Meta Tecnologia da Informação Ltda — Filial BH" },
    ],
    objeto: "Integrações e APIs — plataforma de pagamentos",
    gestor: "Renzo Arthur",
    vigenciaInicio: "2025-02-01",
    vigenciaFim: "2027-01-31",
    valorTotal: 1_880_000,
    valorConsumido: 642_300,
    valorPF: 840,
    pedidos: [
      { numero: "PC-118203", descricao: "Integrações — fase 2", saldo: 640_000 },
      { numero: "PC-118990", descricao: "Suporte pós-implantação", saldo: 195_700 },
    ],
    projetos: ["PRJ-0210", "PRJ-0214"],
    notas: [],
  },
  {
    id: "ct-2022-031",
    numero: "CT-2022-031",
    fornecedor: "TIVIT Terceirização de Processos",
    cnpj: "07.073.027/0001-53",
    cnpjsEmissores: [
      { cnpj: "07.073.027/0001-53", nome: "TIVIT Terceirização de Processos S.A. — Matriz" },
    ],
    objeto: "Service desk e sustentação de infraestrutura",
    gestor: "Diego Lemos",
    vigenciaInicio: "2022-06-01",
    vigenciaFim: "2026-05-31",
    valorTotal: 3_400_000,
    valorConsumido: 3_400_000,
    valorPF: 760,
    pedidos: [],
    projetos: ["PRJ-0031"],
    notas: [{ numero: "44120", serie: "2", emissao: "2026-05-28", valor: 96_800, situacao: "Aprovada" }],
  },
  {
    id: "ct-2025-022",
    numero: "CT-2025-022",
    fornecedor: "CI&T Software",
    cnpj: "00.921.780/0001-16",
    cnpjsEmissores: [{ cnpj: "00.921.780/0001-16", nome: "CI&T Software S.A. — Matriz" }],
    objeto: "Discovery e design de produto digital",
    gestor: "Camila Ferraz",
    vigenciaInicio: "2025-08-01",
    vigenciaFim: "2026-10-15",
    valorTotal: 960_000,
    valorConsumido: 415_600,
    valorPF: 880,
    pedidos: [{ numero: "PC-125441", descricao: "Discovery — onda 3", saldo: 218_000 }],
    projetos: ["PRJ-0233"],
    notas: [{ numero: "3312", serie: "1", emissao: "2026-08-12", valor: 88_000, situacao: "Em análise" }],
  },
];

/** Converte "YYYY-MM-DD" em Date local (evita o deslocamento de fuso do `new Date(iso)`). */
export const parseISO = (iso: string): Date => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

/** Data de hoje em "YYYY-MM-DD" no fuso local. */
export const hojeISO = (): string => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
};

export const formatarData = (iso: string): string =>
  iso ? parseISO(iso).toLocaleDateString("pt-BR") : "—";

export const diasParaVencer = (vigenciaFim: string): number => {
  const hoje = new Date();
  const fim = parseISO(vigenciaFim);
  return Math.ceil((fim.getTime() - new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).getTime()) / 86_400_000);
};

export const statusDoContrato = (c: ContratoAtivo): ContratoStatus => {
  const dias = diasParaVencer(c.vigenciaFim);
  if (dias < 0) return "vencido";
  if (dias <= 90) return "a_vencer";
  return "vigente";
};

const brlFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const brlCompact = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const brl = (valor: number): string => brlFormatter.format(valor);
export const brlCurto = (valor: number): string => brlCompact.format(valor);
