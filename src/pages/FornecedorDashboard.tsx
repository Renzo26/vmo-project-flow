import {
  PieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, ReferenceLine, Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import EmptyState from "@/components/EmptyState";

const kpis = [
  { label: "Propostas pendentes de envio", value: "—", hint: "", accent: "bg-warning" },
  { label: "Propostas para corrigir", value: "—", hint: "", accent: "bg-destructive" },
  { label: "Projetos contratados", value: "—", hint: "", accent: "bg-primary" },
  { label: "Taxa de aprovação", value: "—", hint: "", accent: "bg-success" },
  { label: "Aderência contratual R$/PF", value: "—", hint: "", accent: "bg-muted-foreground" },
  { label: "Tempo médio para proposta", value: "—", hint: "", accent: "bg-muted-foreground" },
  { label: "Propostas rejeitadas p/ preço", value: "—", hint: "", accent: "bg-destructive" },
  { label: "Projetos concluídos", value: "—", hint: "", accent: "bg-success" },
];

const statusChart: { name: string; value: number; color: string }[] = [];

const proposalCeiling: { name: string; proposto: number; teto: number }[] = [];

const adherenceHistory: { month: string; value: number }[] = [];

const alerts: { type: string; title: string; text: string }[] = [];

const FornecedorDashboard = () => {
  const navigate = useNavigate();
  const { userName, userTeam } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Dashboard — Fornecedor</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {userTeam || userName || "TechSoft Soluções"}
          </span>
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
                : "border-primary bg-primary/10 text-primary"
            }`}
          >
            <span className="font-semibold">{a.title}</span> <span className="text-foreground/80">{a.text}</span>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Status donut */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold text-foreground">Status dos projetos atribuídos</h3>
          <p className="text-xs text-muted-foreground mb-3">5 projetos no ciclo atual</p>
          {statusChart.length === 0 ? (
            <EmptyState minHeight={240} description="Sem projetos atribuídos para exibir." />
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

        {/* Bar chart proposto vs teto */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold text-foreground">Valor proposto vs. teto contratual</h3>
          <p className="text-xs text-muted-foreground mb-3">R$/PF por projeto — linha vermelha = limite R$ 820</p>
          {proposalCeiling.length === 0 ? (
            <EmptyState minHeight={240} description="Sem propostas para exibir." />
          ) : (
            <>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2 text-xs">
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-primary" /><span className="text-muted-foreground">Valor proposto</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-destructive" /><span className="text-muted-foreground">Acima do teto</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-success" /><span className="text-muted-foreground">Teto contratual</span></div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={proposalCeiling} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[760, 940]} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <ReferenceLine y={820} stroke="hsl(var(--success))" strokeDasharray="4 4" />
                  <Bar dataKey="proposto" radius={[4, 4, 0, 0]}>
                    {proposalCeiling.map((e, i) => (
                      <Cell key={i} fill={e.proposto > e.teto ? "hsl(var(--destructive))" : "hsl(var(--primary))"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      </div>

      {/* Adherence history */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold text-foreground">Histórico de aderência mensal</h3>
        <p className="text-xs text-muted-foreground mb-4">% de propostas dentro do valor contratado — últimos 6 meses</p>
        {adherenceHistory.length === 0 ? (
          <EmptyState minHeight={260} description="Sem histórico de aderência para exibir." />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={adherenceHistory} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[78, 105]} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [`${v}%`, "Aderência"]}
              />
              <Line type="monotone" dataKey="value" stroke="hsl(var(--success))" strokeWidth={2.5} fill="hsl(var(--success) / 0.15)" dot={{ r: 4, fill: "hsl(var(--success))" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default FornecedorDashboard;