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

export const mockProjects: Project[] = [];

export const mockSuppliers: Supplier[] = [];

export const mockPriceTable: Record<string, Record<string, number>> = {};

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
  controle: { name: "Juliana Costa", email: "controle@vmo.com", team: "Governança" },
};
