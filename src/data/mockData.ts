export type ProjectStatus = "aguardando" | "contratado" | "corrigir" | "concluido" | "nao_iniciado" | "cancelado";

export interface Project {
  id: string;
  name: string;
  type: string;
  supplier: string;
  status: ProjectStatus;
  capex: boolean;
  urgent: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  since: number;
}

export const mockProjects: Project[] = [
  { id: "VMO-2024-042", name: "Módulo Relatórios RH", type: "Desenvolvimento", supplier: "Fornecedor A", status: "aguardando", capex: true, urgent: false },
  { id: "VMO-2024-041", name: "Automação Fiscal Q3", type: "Desenvolvimento", supplier: "Fornecedor B", status: "contratado", capex: false, urgent: false },
  { id: "VMO-2024-039", name: "Portal Clientes v2", type: "Ciclo Completo", supplier: "Fornecedor A", status: "corrigir", capex: true, urgent: true },
  { id: "VMO-2024-037", name: "API Integração ERP", type: "Testes", supplier: "Fornecedor C", status: "concluido", capex: false, urgent: false },
  { id: "VMO-2024-035", name: "Migração Cloud BD", type: "Gestão", supplier: "Fornecedor B", status: "nao_iniciado", capex: true, urgent: false },
];

export const mockSuppliers: Supplier[] = [
  { id: "forn-a", name: "Fornecedor A", since: 2021 },
  { id: "forn-b", name: "Fornecedor B", since: 2019 },
  { id: "forn-c", name: "Fornecedor C", since: 2023 },
];

export const mockPriceTable: Record<string, Record<string, number>> = {
  "forn-a": {
    "Desenvolvimento": 200,
    "Análise": 160,
    "Testes": 180,
  },
  "forn-b": {
    "Desenvolvimento": 190,
    "Análise": 150,
    "Testes": 170,
  },
  "forn-c": {
    "Desenvolvimento": 210,
    "Análise": 155,
    "Testes": 185,
  },
};

export const statusLabels: Record<ProjectStatus, string> = {
  aguardando: "Aguard. Proposta",
  contratado: "Contratado",
  corrigir: "Corrigir Proposta",
  concluido: "Concluído",
  nao_iniciado: "Não iniciado",
  cancelado: "Cancelado",
};

export const statusColors: Record<ProjectStatus, string> = {
  aguardando: "bg-warning/15 text-warning border-warning/30",
  contratado: "bg-success/15 text-success border-success/30",
  corrigir: "bg-destructive/15 text-destructive border-destructive/30",
  concluido: "bg-emerald-800/15 text-emerald-800 border-emerald-800/30",
  nao_iniciado: "bg-purple-500/15 text-purple-600 border-purple-500/30",
  cancelado: "bg-muted text-muted-foreground border-muted",
};

export const mockUsers = {
  solicitante: { name: "Carlos Mendes", email: "solicitante@vmo.com", team: "Equipe Digital" },
  fornecedor: { name: "TechSoft Soluções", email: "fornecedor@vmo.com", team: "Fornecedor A" },
  controle: { name: "Juliana Costa", email: "controle@vmo.com", team: "Controle Econômico" },
};
