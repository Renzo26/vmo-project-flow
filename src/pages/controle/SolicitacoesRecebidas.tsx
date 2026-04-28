import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Zap,
  Plus,
  Search,
  SlidersHorizontal,
  Laptop,
  Link2,
  User,
  Lock,
  Database,
  Boxes,
  Workflow,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Prioridade = "Baixa" | "Normal" | "Alta" | "Crítica";

export type StatusSol =
  | "apf_pendente"
  | "em_contagem"
  | "em_analise"
  | "em_cotacao"
  | "parecer_emitido"
  | "aprovada"
  | "rejeitada";

type Categoria = "dev_software" | "alocacao" | "seguranca" | "infra" | "qa" | "dados" | "outros";

export interface Solicitacao {
  id: string;
  numero: string;
  titulo: string;
  area: string;
  solicitante: string;
  enviado: string;
  prioridade: Prioridade;
  status: StatusSol;
  categoria: Categoria;
  subtipo: string;
  detalhe: string;
  iconKey: keyof typeof ICON_MAP;
  iconBg: string;
}

// ─── Mock data ─────────────────────────────────────────────────────────────────

export const ICON_MAP = {
  laptop: Laptop,
  link2: Link2,
  user: User,
  lock: Lock,
  database: Database,
  boxes: Boxes,
  workflow: Workflow,
};

export const SOLICITACOES: Solicitacao[] = [
  {
    id: "043",
    numero: "VMO-2026-043",
    titulo: "Sistema Controle de Estoque Mobile",
    area: "Logística",
    solicitante: "Carlos Mendes",
    enviado: "20/04/2026",
    prioridade: "Alta",
    status: "apf_pendente",
    categoria: "dev_software",
    subtipo: "Novo desenvolvimento",
    detalhe: "App mobile + APIs · Estimativa preliminar: ~87 PF",
    iconKey: "laptop",
    iconBg: "bg-amber-100 text-amber-600",
  },
  {
    id: "041",
    numero: "VMO-2026-041",
    titulo: "Integração API CRM-ERP Totvs",
    area: "TI",
    solicitante: "Ana Paula",
    enviado: "18/04/2026",
    prioridade: "Normal",
    status: "em_contagem",
    categoria: "dev_software",
    subtipo: "Integração/APIs",
    detalhe: "EE: 8 | SE: 5 | CE: 4 | ALI: 3 | AIE: 2",
    iconKey: "link2",
    iconBg: "bg-purple-100 text-purple-600",
  },
  {
    id: "039",
    numero: "VMO-2026-039",
    titulo: "Alocação Dev Sênior .NET — 12 meses",
    area: "Plataformas",
    solicitante: "Rodrigo Lima",
    enviado: "17/04/2026",
    prioridade: "Alta",
    status: "em_cotacao",
    categoria: "alocacao",
    subtipo: "Alocação dedicada",
    detalhe: "R$ 22.000/mês · APF não se aplica",
    iconKey: "user",
    iconBg: "bg-orange-100 text-orange-600",
  },
  {
    id: "038",
    numero: "VMO-2026-038",
    titulo: "Pentest Plataforma de Pagamentos",
    area: "Segurança",
    solicitante: "Marcos Vieira",
    enviado: "15/04/2026",
    prioridade: "Crítica",
    status: "parecer_emitido",
    categoria: "seguranca",
    subtipo: "Segurança da informação",
    detalhe: "Escopo fechado · R$ 35.000",
    iconKey: "lock",
    iconBg: "bg-red-100 text-red-600",
  },
  {
    id: "036",
    numero: "VMO-2026-036",
    titulo: "Migração Base de Dados Legado Oracle",
    area: "Infraestrutura",
    solicitante: "Fernanda Souza",
    enviado: "12/04/2026",
    prioridade: "Alta",
    status: "em_analise",
    categoria: "infra",
    subtipo: "Migração de dados",
    detalhe: "Oracle → PostgreSQL · ~380 GB · Janela programada",
    iconKey: "database",
    iconBg: "bg-blue-100 text-blue-600",
  },
  {
    id: "034",
    numero: "VMO-2026-034",
    titulo: "Portal Self-Service RH",
    area: "Recursos Humanos",
    solicitante: "Letícia Alves",
    enviado: "10/04/2026",
    prioridade: "Normal",
    status: "aprovada",
    categoria: "dev_software",
    subtipo: "Novo desenvolvimento",
    detalhe: "App web · Módulo de férias, ponto e benefícios · ~120 PF",
    iconKey: "boxes",
    iconBg: "bg-emerald-100 text-emerald-600",
  },
  {
    id: "032",
    numero: "VMO-2026-032",
    titulo: "Automação de Testes Regressivos",
    area: "Qualidade",
    solicitante: "Bruno Carvalho",
    enviado: "08/04/2026",
    prioridade: "Normal",
    status: "aprovada",
    categoria: "qa",
    subtipo: "QA / Automação",
    detalhe: "Selenium + Cypress · 3 sistemas críticos",
    iconKey: "workflow",
    iconBg: "bg-teal-100 text-teal-600",
  },
  {
    id: "030",
    numero: "VMO-2026-030",
    titulo: "Dashboard BI Comercial",
    area: "Comercial",
    solicitante: "Patrícia Nunes",
    enviado: "05/04/2026",
    prioridade: "Baixa",
    status: "rejeitada",
    categoria: "dados",
    subtipo: "Business Intelligence",
    detalhe: "Power BI + integração CRM · Escopo insuficiente",
    iconKey: "database",
    iconBg: "bg-indigo-100 text-indigo-600",
  },
];

// ─── Config maps ──────────────────────────────────────────────────────────────

const PRIORIDADE_STYLE: Record<Prioridade, string> = {
  Baixa: "text-muted-foreground",
  Normal: "text-primary",
  Alta: "text-warning",
  Crítica: "text-destructive font-semibold",
};

export const STATUS_CONFIG: Record<StatusSol, { label: string; className: string }> = {
  apf_pendente: {
    label: "APF pendente",
    className: "bg-warning/10 text-warning border border-warning/30",
  },
  em_contagem: {
    label: "Em contagem",
    className: "bg-primary/10 text-primary border border-primary/30",
  },
  em_analise: {
    label: "Em análise",
    className: "bg-ctrl/10 text-ctrl border border-ctrl/30",
  },
  em_cotacao: {
    label: "Em cotação",
    className: "bg-muted text-muted-foreground border border-border",
  },
  parecer_emitido: {
    label: "Parecer emitido",
    className: "bg-success/10 text-success border border-success/30",
  },
  aprovada: {
    label: "Aprovada",
    className: "bg-success/10 text-success border border-success/30",
  },
  rejeitada: {
    label: "Rejeitada",
    className: "bg-destructive/10 text-destructive border border-destructive/30",
  },
};

const CATEGORIA_CONFIG: Record<Categoria, { label: string; className: string }> = {
  dev_software: {
    label: "Dev software",
    className: "bg-ctrl/10 text-ctrl border border-ctrl/30",
  },
  alocacao: {
    label: "Alocação",
    className: "bg-muted text-muted-foreground border border-border",
  },
  seguranca: {
    label: "Segurança",
    className: "bg-destructive/10 text-destructive border border-destructive/30",
  },
  infra: {
    label: "Infraestrutura",
    className: "bg-blue-50 text-blue-600 border border-blue-200",
  },
  qa: {
    label: "QA / Testes",
    className: "bg-teal-50 text-teal-600 border border-teal-200",
  },
  dados: {
    label: "Dados / BI",
    className: "bg-indigo-50 text-indigo-600 border border-indigo-200",
  },
  outros: {
    label: "Outros",
    className: "bg-muted text-muted-foreground border border-border",
  },
};

const ACTION_CONFIG: Record<StatusSol, { label: string; isCtrl: boolean }> = {
  apf_pendente: { label: "⚡ Contar APF", isCtrl: true },
  em_contagem: { label: "Continuar APF", isCtrl: false },
  em_analise: { label: "Ver análise", isCtrl: false },
  em_cotacao: { label: "Analisar", isCtrl: false },
  parecer_emitido: { label: "Ver parecer", isCtrl: false },
  aprovada: { label: "Ver detalhes", isCtrl: false },
  rejeitada: { label: "Ver motivo", isCtrl: false },
};

// ─── Tab config ───────────────────────────────────────────────────────────────

type TabKey = "todas" | "aguardando_apf" | "em_analise" | "parecer_emitido" | "aprovadas" | "rejeitadas";

const TABS: { key: TabKey; label: string; count: number; statuses: StatusSol[] }[] = [
  { key: "todas", label: "Todas", count: 24, statuses: [] },
  { key: "aguardando_apf", label: "Aguardando APF", count: 3, statuses: ["apf_pendente"] },
  { key: "em_analise", label: "Em análise", count: 7, statuses: ["em_contagem", "em_analise", "em_cotacao"] },
  { key: "parecer_emitido", label: "Parecer emitido", count: 11, statuses: ["parecer_emitido"] },
  { key: "aprovadas", label: "Aprovadas", count: 9, statuses: ["aprovada"] },
  { key: "rejeitadas", label: "Rejeitadas", count: 3, statuses: ["rejeitada"] },
];

// ─── Component ────────────────────────────────────────────────────────────────

const SolicitacoesRecebidas = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>("todas");
  const [busca, setBusca] = useState("");

  const tabConfig = TABS.find((t) => t.key === activeTab)!;

  const filtered = SOLICITACOES.filter((s) => {
    const matchesTab =
      tabConfig.statuses.length === 0 || tabConfig.statuses.includes(s.status);
    const q = busca.toLowerCase();
    const matchesBusca =
      !busca ||
      s.numero.toLowerCase().includes(q) ||
      s.titulo.toLowerCase().includes(q) ||
      s.area.toLowerCase().includes(q) ||
      s.solicitante.toLowerCase().includes(q);
    return matchesTab && matchesBusca;
  });

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-foreground">Solicitações recebidas</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Demandas encaminhadas ao Controle Econômico para análise e parecer
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground hidden sm:block">
            Aguardando análise e parecer
          </span>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 border-ctrl text-ctrl hover:bg-ctrl/10"
            onClick={() => navigate("/controle/apf/nova-contagem")}
          >
            <Zap className="h-3.5 w-3.5" />
            Nova contagem APF
          </Button>
          <Button
            size="sm"
            className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => navigate("/controle/solicitacoes/analise-apf")}
          >
            <Plus className="h-3.5 w-3.5" />
            Analisar solicitação
          </Button>
        </div>
      </div>

      {/* ── Tabs + Search ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-ctrl text-ctrl-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {tab.label}{" "}
              <span className={activeTab === tab.key ? "opacity-75" : "opacity-60"}>
                ({tab.count})
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar solicitação..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-8 h-8 text-sm w-52"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 h-8">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filtros
          </Button>
        </div>
      </div>

      {/* ── Cards ── */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="bg-card rounded-xl border border-border p-10 text-center text-sm text-muted-foreground">
            Nenhuma solicitação encontrada.
          </div>
        )}

        {filtered.map((sol) => {
          const Icon = ICON_MAP[sol.iconKey];
          const statusCfg = STATUS_CONFIG[sol.status];
          const catCfg = CATEGORIA_CONFIG[sol.categoria];
          const actionCfg = ACTION_CONFIG[sol.status];

          return (
            <div
              key={sol.id}
              className="bg-card rounded-xl border border-border p-4 flex items-start gap-4 hover:border-ctrl/40 hover:shadow-sm transition-all cursor-pointer"
              onClick={() => navigate(`/controle/solicitacoes/recebidas/${sol.id}`)}
            >
              {/* Icon */}
              <div
                className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${sol.iconBg}`}
              >
                <Icon className="h-5 w-5" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground leading-tight">
                  <span className="text-muted-foreground font-normal">{sol.numero} — </span>
                  {sol.titulo}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Área: {sol.area} · Solicitante: {sol.solicitante} · Enviado: {sol.enviado} · Prioridade:{" "}
                  <span className={PRIORIDADE_STYLE[sol.prioridade]}>{sol.prioridade}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  <span className="text-foreground/70">{sol.subtipo}</span> · {sol.detalhe}
                </p>
              </div>

              {/* Right side */}
              <div
                className="flex flex-col items-end gap-1.5 shrink-0 ml-2"
                onClick={(e) => e.stopPropagation()}
              >
                <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${statusCfg.className}`}>
                  {statusCfg.label}
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${catCfg.className}`}>
                  {catCfg.label}
                </span>
                <Button
                  size="sm"
                  variant={actionCfg.isCtrl ? "default" : "outline"}
                  className={`h-7 text-xs px-3 mt-0.5 ${
                    actionCfg.isCtrl
                      ? "bg-ctrl hover:bg-ctrl/90 text-ctrl-foreground border-0"
                      : ""
                  }`}
                  onClick={() => navigate(`/controle/solicitacoes/recebidas/${sol.id}`)}
                >
                  {actionCfg.label}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SolicitacoesRecebidas;
