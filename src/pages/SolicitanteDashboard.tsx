import { useState, useMemo } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line,
} from "recharts";
import {
  AlertTriangle, TrendingUp, Clock, DollarSign, FolderOpen, Plus, Trophy, PiggyBank, Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { mockProjects } from "@/data/mockData";

type Period = "mensal" | "trimestral" | "consolidada";

// Mock dataset — saving por período
const monthlyData = [
  { period: "Jan", initial: 48, final: 45, requests: 6, saving: 3 },
  { period: "Fev", initial: 52, final: 50, requests: 7, saving: 2 },
  { period: "Mar", initial: 55, final: 52, requests: 8, saving: 3 },
  { period: "Abr", initial: 60, final: 56, requests: 9, saving: 4 },
  { period: "Mai", initial: 70, final: 62, requests: 11, saving: 8 },
  { period: "Jun", initial: 72, final: 64, requests: 10, saving: 8 },
];

const quarterlyData = [
  { period: "Q1", initial: 155, final: 147, requests: 21, saving: 8 },
  { period: "Q2", initial: 202, final: 182, requests: 30, saving: 20 },
];

const supplierRanking = [
  { name: "TechSoft", projects: 12, score: 4.8, saving: 18 },
  { name: "DevBrasil", projects: 9, score: 4.5, saving: 14 },
  { name: "InfoSystems", projects: 7, score: 4.3, saving: 9 },
  { name: "CodeWorks", projects: 5, score: 4.0, saving: 6 },
  { name: "DataLab", projects: 3, score: 3.7, saving: 2 },
];

const openDemands = [
  { id: "VMO-2024-042", name: "Módulo Relatórios RH", days: 3, urgency: "alta" },
  { id: "VMO-2024-039", name: "Portal Clientes v2", days: 6, urgency: "alta" },
  { id: "VMO-2024-035", name: "Migração Cloud BD", days: 2, urgency: "media" },
];

const statusChart = [
  { name: "Em andamento", value: 2, color: "hsl(var(--primary))" },
  { name: "Concluído", value: 1, color: "hsl(var(--success))" },
  { name: "Não iniciado", value: 1, color: "hsl(var(--warning))" },
  { name: "Pendente ação", value: 1, color: "hsl(var(--destructive))" },
];

const SolicitanteDashboard = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>("mensal");
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState("2024-06-30");

  const total = mockProjects.length;

  const periodData = useMemo(() => {
    if (period === "trimestral") return quarterlyData;
    if (period === "consolidada") {
      const totalInitial = monthlyData.reduce((a, b) => a + b.initial, 0);
      const totalFinal = monthlyData.reduce((a, b) => a + b.final, 0);
      const totalRequests = monthlyData.reduce((a, b) => a + b.requests, 0);
      return [{ period: "Total", initial: totalInitial, final: totalFinal, requests: totalRequests, saving: totalInitial - totalFinal }];
    }
    return monthlyData;
  }, [period]);

  const totalSaving = periodData.reduce((acc, p) => acc + p.saving, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Dashboard</h2>
        <Button onClick={() => navigate("/solicitante/nova-analise")} className="gap-1">
          <Plus className="h-4 w-4" /> Nova Solicitação
        </Button>
      </div>

      {/* Filtros de período */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-end gap-4 flex-wrap">
          <div className="flex-1 min-w-[160px]">
            <Label className="text-xs text-muted-foreground mb-1 block">Período do relatório</Label>
            <Select value={period} onValueChange={(v: Period) => setPeriod(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="trimestral">Trimestral</SelectItem>
                <SelectItem value="consolidada">Consolidada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">De</Label>
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-[160px]" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Até</Label>
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-[160px]" />
          </div>
          <Button variant="outline">Gerar relatório</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Custo contratado", value: "R$ 284k", icon: DollarSign },
          { label: "Saving acumulado", value: `R$ ${totalSaving}k`, icon: PiggyBank },
          { label: "Horas contratadas", value: "1.420h", icon: Clock },
          { label: "Projetos ativos", value: "3", icon: FolderOpen },
        ].map(kpi => (
          <div key={kpi.label} className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-2">
              <kpi.icon className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">{kpi.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Saving (Custo inicial - Custo total) */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="h-4 w-4 text-success" />
          <h3 className="font-semibold text-foreground">Saving por período</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Saving = Custo inicial − Custo total (em R$ mil)
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={periodData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="initial" fill="hsl(var(--muted-foreground))" name="Custo inicial" radius={[4, 4, 0, 0]} />
            <Bar dataKey="final" fill="hsl(var(--primary))" name="Custo total" radius={[4, 4, 0, 0]} />
            <Bar dataKey="saving" fill="hsl(var(--success))" name="Saving" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Visão geral das requisições por período - barras */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold text-foreground mb-1">Visão geral das requisições</h3>
          <p className="text-xs text-muted-foreground mb-4">Volume de pedidos por período</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={periodData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="requests" fill="hsl(var(--primary))" name="Requisições" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status pie */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold text-foreground mb-1">Status dos projetos</h3>
          <p className="text-xs text-muted-foreground mb-4">Distribuição atual</p>
          <div className="relative mx-auto" style={{ width: 220, height: 220 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={statusChart} dataKey="value" cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={3} strokeWidth={0}>
                  {statusChart.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {statusChart.map(d => (
              <div key={d.name} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: d.color }} />
                <span className="text-muted-foreground">{d.name}</span>
                <span className="font-medium text-foreground ml-auto">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Ranking de fornecedores */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="h-4 w-4 text-warning" />
            <h3 className="font-semibold text-foreground">Ranking de fornecedores</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Por projetos entregues e saving gerado</p>
          <div className="space-y-2">
            {supplierRanking.map((s, i) => (
              <div key={s.name} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  i === 0 ? "bg-warning text-warning-foreground" :
                  i === 1 ? "bg-muted-foreground/30 text-foreground" :
                  i === 2 ? "bg-warning/40 text-foreground" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.projects} projetos · ⭐ {s.score}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-success">R$ {s.saving}k</p>
                  <p className="text-[10px] text-muted-foreground">saving</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demandas em aberto sem tratamento */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-1">
            <Inbox className="h-4 w-4 text-destructive" />
            <h3 className="font-semibold text-foreground">Demandas abertas sem tratamento</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Aguardando ação há mais de 24h</p>
          <div className="space-y-2">
            {openDemands.map(d => (
              <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                <AlertTriangle className={`h-4 w-4 shrink-0 ${d.urgency === "alta" ? "text-destructive" : "text-warning"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{d.name}</p>
                  <p className="text-xs text-muted-foreground">{d.id}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${d.urgency === "alta" ? "text-destructive" : "text-warning"}`}>{d.days}d</p>
                  <p className="text-[10px] text-muted-foreground">parado</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolicitanteDashboard;
