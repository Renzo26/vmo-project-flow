import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockProjects, statusLabels, statusColors, type ProjectStatus } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { AlertTriangle, TrendingUp, Clock, DollarSign, FolderOpen, Plus } from "lucide-react";

type FilterTab = "todos" | "pendentes" | "andamento" | "concluidos" | "cancelados";

const filterMap: Record<FilterTab, ProjectStatus[]> = {
  todos: ["aguardando", "contratado", "corrigir", "concluido", "nao_iniciado", "cancelado"],
  pendentes: ["aguardando", "corrigir"],
  andamento: ["contratado", "nao_iniciado"],
  concluidos: ["concluido"],
  cancelados: ["cancelado"],
};

const chartData = [
  { name: "Em andamento", value: 2, color: "#4a9eed" },
  { name: "Concluído", value: 1, color: "#22c55e" },
  { name: "Não iniciado", value: 1, color: "#f59e0b" },
  { name: "Pendente ação", value: 1, color: "#ef4444" },
];

const SolicitanteProjects = () => {
  const [filter, setFilter] = useState<FilterTab>("todos");
  const [view, setView] = useState<"individual" | "equipe">("individual");
  const navigate = useNavigate();

  const filtered = mockProjects.filter(p => filterMap[filter].includes(p.status));
  const total = mockProjects.length;

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "todos", label: "Todos" },
    { key: "pendentes", label: "Pendentes" },
    { key: "andamento", label: "Em andamento" },
    { key: "concluidos", label: "Concluídos" },
    { key: "cancelados", label: "Cancelados" },
  ];

  return (
    <div className="flex gap-6">
      {/* Left Column */}
      <div className="flex-[3] min-w-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Meus Projetos</h2>
          <div className="flex bg-muted rounded-lg p-0.5">
            {(["individual", "equipe"] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  view === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                {v === "individual" ? "Individual" : "Equipe"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-1 mb-4">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filter === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Projeto</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tipo</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fornecedor</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Ação</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.id}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.type}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.supplier}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={`text-xs ${statusColors[p.status]}`}>
                      {statusLabels[p.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant={p.status === "aguardando" || p.status === "corrigir" ? "default" : "outline"} className="text-xs h-7">
                      {p.status === "aguardando" || p.status === "corrigir" ? "Abrir" : "Ver"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Column */}
      <div className="flex-[2] space-y-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Visão geral das requisições</h3>
          <div className="relative mx-auto" style={{ width: 180, height: 180 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={chartData} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} strokeWidth={0}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {chartData.map(d => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                <span className="text-muted-foreground">{d.name}</span>
                <span className="font-medium text-foreground ml-auto">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Custo contratado", value: "R$ 284k", icon: DollarSign },
            { label: "Orçamento usado", value: "67%", icon: TrendingUp },
            { label: "Horas contratadas", value: "1.420h", icon: Clock },
            { label: "Projetos ativos", value: "3", icon: FolderOpen },
          ].map(kpi => (
            <div key={kpi.label} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-1">
                <kpi.icon className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">{kpi.label}</span>
              </div>
              <p className="text-lg font-bold text-foreground">{kpi.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-xl border border-border p-4 space-y-2">
          <h4 className="font-semibold text-foreground text-sm">Alertas</h4>
          <div className="flex items-start gap-2 p-2.5 bg-warning/10 rounded-lg border border-warning/20">
            <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
            <p className="text-xs text-foreground">Proposta de "Portal Clientes v2" aguardando correção há 3 dias.</p>
          </div>
          <div className="flex items-start gap-2 p-2.5 bg-destructive/10 rounded-lg border border-destructive/20">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-xs text-foreground">Contrato do Fornecedor C expira em 15 dias.</p>
          </div>
        </div>

        <Button className="w-full bg-success hover:bg-success/90 text-success-foreground" onClick={() => navigate("/solicitante/nova-analise")}>
          <Plus className="h-4 w-4 mr-2" />
          Criar Nova Análise
        </Button>
      </div>
    </div>
  );
};

export default SolicitanteProjects;
