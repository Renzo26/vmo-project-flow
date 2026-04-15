import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { AlertTriangle, TrendingUp, Clock, DollarSign, FolderOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { mockProjects } from "@/data/mockData";

const chartData = [
  { name: "Em andamento", value: 2, color: "#4a9eed" },
  { name: "Concluído", value: 1, color: "#22c55e" },
  { name: "Não iniciado", value: 1, color: "#f59e0b" },
  { name: "Pendente ação", value: 1, color: "#ef4444" },
];

const SolicitanteDashboard = () => {
  const navigate = useNavigate();
  const total = mockProjects.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-xl font-bold text-foreground">Dashboard</h2>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Custo contratado", value: "R$ 284k", icon: DollarSign },
          { label: "Orçamento usado", value: "67%", icon: TrendingUp },
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

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold text-foreground mb-4">Visão geral das requisições</h3>
          <div className="relative mx-auto" style={{ width: 220, height: 220 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={chartData} dataKey="value" cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={3} strokeWidth={0}>
                  {chartData.map((entry, i) => (
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
            {chartData.map(d => (
              <div key={d.name} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: d.color }} />
                <span className="text-muted-foreground">{d.name}</span>
                <span className="font-medium text-foreground ml-auto">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-5 space-y-3">
            <h4 className="font-semibold text-foreground">Alertas</h4>
            <div className="flex items-start gap-2 p-3 bg-warning/10 rounded-lg border border-warning/20">
              <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">Proposta de "Portal Clientes v2" aguardando correção há 3 dias.</p>
            </div>
            <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">Contrato do Fornecedor C expira em 15 dias.</p>
            </div>
          </div>

          <Button className="w-full bg-success hover:bg-success/90 text-success-foreground" onClick={() => navigate("/solicitante/nova-analise")}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Nova Análise
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SolicitanteDashboard;
