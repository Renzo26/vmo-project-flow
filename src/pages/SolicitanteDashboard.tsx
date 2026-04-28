import {
  PieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const kpis = [
  { label: "Projetos ativos", value: "3", hint: "de 5 projetos no total", accent: "bg-primary" },
  { label: "Aguardando minha ação", value: "2", hint: "▼ requer atenção imediata", accent: "bg-warning", hintClass: "text-destructive" },
  { label: "Custo contratado", value: "R$ 284k", hint: "67% do orçamento anual", accent: "bg-success" },
  { label: "Horas contratadas", value: "1.420h", hint: "▲ +12% vs mês anterior", accent: "bg-success", hintClass: "text-success" },
  { label: "Propostas para corrigir", value: "1", hint: "Portal Clientes v2 · há 3d", accent: "bg-destructive", hintClass: "text-destructive" },
  { label: "Contratos próx. vencimento", value: "1", hint: "Fornecedor C · em 15 dias", accent: "bg-warning", hintClass: "text-warning" },
  { label: "SLA médio de resposta", value: "4,2d", hint: "▲ meta: 5 dias — OK", accent: "bg-success", hintClass: "text-success" },
  { label: "Taxa de aprovação", value: "80%", hint: "▲ 4 de 5 projetos aprovados", accent: "bg-success", hintClass: "text-success" },
];

const statusChart = [
  { name: "Em andamento", value: 2, color: "hsl(var(--primary))" },
  { name: "Concluído", value: 1, color: "hsl(var(--success))" },
  { name: "Não iniciado", value: 1, color: "hsl(var(--warning))" },
  { name: "Pendente ação", value: 1, color: "hsl(var(--destructive))" },
];

const serviceCostChart = [
  { name: "Desenvolvimento", value: 58, color: "hsl(var(--primary))" },
  { name: "Ciclo Completo", value: 22, color: "hsl(262 70% 60%)" },
  { name: "Testes", value: 12, color: "hsl(var(--success))" },
  { name: "Gestão", value: 8, color: "hsl(var(--muted-foreground))" },
];

const costEvolution = [
  { month: "Nov", value: 40 },
  { month: "Dez", value: 75 },
  { month: "Jan", value: 130 },
  { month: "Fev", value: 175 },
  { month: "Mar", value: 230 },
  { month: "Abr", value: 284 },
];

const alerts = [
  { type: "destructive", title: "Ação necessária:", text: 'Proposta "Portal Clientes v2" aguardando sua correção há 3 dias.' },
  { type: "warning", title: "Atenção:", text: "Contrato do Fornecedor C vence em 15 dias — providencie renovação." },
];

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

        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold text-foreground">Custo por tipo de serviço</h3>
          <p className="text-xs text-muted-foreground mb-3">Distribuição do orçamento contratado</p>
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
        </div>
      </div>

      {/* Evolução do custo */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold text-foreground">Evolução do custo contratado</h3>
        <p className="text-xs text-muted-foreground mb-4">Acumulado mensal em R$ mil — últimos 6 meses</p>
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
      </div>
    </div>
  );
};

export default SolicitanteDashboard;