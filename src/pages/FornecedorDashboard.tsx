import {
  PieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, ReferenceLine, Legend,
} from "recharts";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const kpis = [
  { label: "Propostas pendentes de envio", value: "1", hint: "Módulo Relatórios RH", accent: "bg-warning", hintClass: "text-warning" },
  { label: "Propostas para corrigir", value: "1", hint: "Portal Clientes v2", accent: "bg-destructive", hintClass: "text-destructive" },
  { label: "Projetos contratados", value: "1", hint: "Automação Fiscal Q3", accent: "bg-primary", hintClass: "text-muted-foreground" },
  { label: "Taxa de aprovação", value: "60%", hint: "3 de 5 propostas aprovadas", accent: "bg-success", hintClass: "text-muted-foreground" },
  { label: "Aderência contratual R$/PF", value: "97%", hint: "▲ dentro do acordado", accent: "bg-muted-foreground", hintClass: "text-success" },
  { label: "Tempo médio para proposta", value: "2,8d", hint: "▲ meta: 5 dias úteis", accent: "bg-muted-foreground", hintClass: "text-success" },
  { label: "Propostas rejeitadas p/ preço", value: "1", hint: "acima do valor contratual", accent: "bg-destructive", hintClass: "text-destructive" },
  { label: "Projetos concluídos", value: "1", hint: "API Integração ERP", accent: "bg-success", hintClass: "text-muted-foreground" },
];

const statusChart = [
  { name: "Contratado", value: 1, color: "hsl(var(--primary))" },
  { name: "Aguard. proposta", value: 1, color: "hsl(var(--warning))" },
  { name: "Corrigir", value: 1, color: "hsl(var(--destructive))" },
  { name: "Concluído", value: 1, color: "hsl(var(--success))" },
  { name: "Não iniciado", value: 1, color: "hsl(var(--muted-foreground))" },
];

const proposalCeiling = [
  { name: "Módulo RH", proposto: 850, teto: 820 },
  { name: "Automação Q3", proposto: 810, teto: 820 },
  { name: "Portal v2", proposto: 920, teto: 820 },
];

const adherenceHistory = [
  { month: "Nov", value: 90 },
  { month: "Dez", value: 95 },
  { month: "Jan", value: 86 },
  { month: "Fev", value: 100 },
  { month: "Mar", value: 94 },
  { month: "Abr", value: 97 },
];

const alerts = [
  { type: "info", title: "Novo pedido recebido:", text: "Módulo Relatórios RH — responda em até 5 dias úteis." },
  { type: "destructive", title: "Corrigir proposta:", text: "Portal Clientes v2 com valor acima do contrato (R$ 920/PF vs R$ 820 acordado)." },
];

const FornecedorDashboard = () => {
  const navigate = useNavigate();
  const { userName, userTeam } = useAuth();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Dashboard — Fornecedor</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {userTeam || userName || "TechSoft Soluções"}
          </span>
          <Button onClick={() => navigate("/fornecedor/projetos")} className="gap-1 rounded-full">
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
                <p className={`text-[11px] ${kpi.hintClass || "text-muted-foreground"}`}>{kpi.hint}</p>
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
        </div>

        {/* Bar chart proposto vs teto */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold text-foreground">Valor proposto vs. teto contratual</h3>
          <p className="text-xs text-muted-foreground mb-3">R$/PF por projeto — linha vermelha = limite R$ 820</p>
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
        </div>
      </div>

      {/* Adherence history */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold text-foreground">Histórico de aderência mensal</h3>
        <p className="text-xs text-muted-foreground mb-4">% de propostas dentro do valor contratado — últimos 6 meses</p>
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
      </div>
    </div>
  );
};

export default FornecedorDashboard;