import {
  PieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import EmptyState from "@/components/EmptyState";

const kpis = [
  { label: "Projetos ativos", value: "—", hint: "", accent: "bg-primary" },
  { label: "Aguardando minha ação", value: "—", hint: "", accent: "bg-warning" },
  { label: "Custo contratado", value: "—", hint: "", accent: "bg-success" },
  { label: "Horas contratadas", value: "—", hint: "", accent: "bg-success" },
  { label: "Propostas para corrigir", value: "—", hint: "", accent: "bg-destructive" },
  { label: "Contratos próx. vencimento", value: "—", hint: "", accent: "bg-warning" },
  { label: "SLA médio de resposta", value: "—", hint: "", accent: "bg-success" },
  { label: "Taxa de aprovação", value: "—", hint: "", accent: "bg-success" },
];

const statusChart: { name: string; value: number; color: string }[] = [];

const serviceCostChart: { name: string; value: number; color: string }[] = [];

const costEvolution: { month: string; value: number }[] = [];

const alerts: { type: string; title: string; text: string }[] = [];

const SolicitanteDashboard = () => {
  const navigate = useNavigate();
  const { userName, userTeam } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Dashboard — Solicitante</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {userName || "Carlos Mendes"} · {userTeam || "Equipe Digital"}
          </span>
          <Button onClick={() => navigate("/solicitante/nova-analise")} className="gap-1 rounded-full">
            <Plus className="h-4 w-4" /> Nova Análise
          </Button>
        </div>
      </div>

      {/* Visão geral */}
      <div>
        <p className="text-[11px] font-semibold tracking-widest text-muted-foreground mb-3">VISÃO GERAL</p>
        <div className="grid grid-cols-4 gap-4">
          {kpis.map(kpi => (
            <div key={kpi.label} className="bg-card rounded-xl border border-border overflow-hidden">
              <div className={`h-1 w-full ${kpi.accent}`} />
              <div className="p-4">
                <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
                <p className="text-2xl font-bold text-foreground mb-1">{kpi.value}</p>
                <p className="text-[11px] text-muted-foreground">{kpi.hint}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alertas */}
      <div className="space-y-2">
        {alerts.map((a, i) => (
          <div
            key={i}
            className={`rounded-lg border-l-4 px-4 py-3 text-sm ${
              a.type === "destructive"
                ? "border-destructive bg-destructive/10 text-destructive"
                : "border-warning bg-warning/10 text-warning"
            }`}
          >
            <span className="font-semibold">{a.title}</span> <span className="text-foreground/80">{a.text}</span>
          </div>
        ))}
      </div>

      {/* Donut charts */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold text-foreground">Status dos projetos</h3>
          <p className="text-xs text-muted-foreground mb-3">Distribuição por situação atual</p>
          {statusChart.length === 0 ? (
            <EmptyState minHeight={240} description="Sem projetos para exibir." />
          ) : (
            <>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
                {statusChart.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: d.color }} />
                    <span className="text-muted-foreground">{d.name} {d.value}</span>
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={statusChart} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={2} strokeWidth={0}>
                    {statusChart.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </>
          )}
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold text-foreground">Custo por tipo de serviço</h3>
          <p className="text-xs text-muted-foreground mb-3">Distribuição do orçamento contratado</p>
          {serviceCostChart.length === 0 ? (
            <EmptyState minHeight={240} description="Sem custos contratados para exibir." />
          ) : (
            <>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
                {serviceCostChart.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: d.color }} />
                    <span className="text-muted-foreground">{d.name} {d.value}%</span>
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={serviceCostChart} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={2} strokeWidth={0}>
                    {serviceCostChart.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      </div>

      {/* Evolução do custo */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold text-foreground">Evolução do custo contratado</h3>
        <p className="text-xs text-muted-foreground mb-4">Acumulado mensal em R$ mil — últimos 6 meses</p>
        {costEvolution.length === 0 ? (
          <EmptyState minHeight={260} description="Sem histórico de custo para exibir." />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={costEvolution} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${v}k`} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [`R$ ${v}k`, "Custo"]}
              />
              <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--primary))" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default SolicitanteDashboard;