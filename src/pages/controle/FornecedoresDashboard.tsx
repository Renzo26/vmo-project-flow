import { useNavigate } from "react-router-dom";
import EmptyState from "@/components/EmptyState";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const homologStatus: { name: string; value: number; color: string }[] = [];

const categorias: { name: string; total: number; color: string }[] = [];

const FornecedoresDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-foreground">Dashboard — Fornecedores</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/controle/fornecedores/base")}
            className="text-sm text-primary hover:underline px-3 py-2"
          >
            Base de fornecedores
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="h-1 bg-primary" />
          <div className="p-4">
            <p className="text-xs text-muted-foreground">Total de fornecedores</p>
            <p className="text-3xl font-bold text-foreground mt-1">—</p>
            <p className="text-xs text-muted-foreground mt-1">cadastrados</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="h-1 bg-success" />
          <div className="p-4">
            <p className="text-xs text-muted-foreground">Homologados ativos</p>
            <p className="text-3xl font-bold text-foreground mt-1">—</p>
            <p className="text-xs text-muted-foreground mt-1">do total</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="h-1 bg-warning" />
          <div className="p-4">
            <p className="text-xs text-muted-foreground">Em qualificação</p>
            <p className="text-3xl font-bold text-foreground mt-1">—</p>
            <p className="text-xs text-muted-foreground mt-1">aguardando análise</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="h-1 bg-destructive" />
          <div className="p-4">
            <p className="text-xs text-muted-foreground">Documentos vencidos</p>
            <p className="text-3xl font-bold text-foreground mt-1">—</p>
            <p className="text-xs text-muted-foreground mt-1">ação necessária</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Status de homologação</h3>
          <div className="h-[280px]">
            {homologStatus.length === 0 ? (
              <EmptyState className="h-full" description="Sem fornecedores cadastrados para exibir." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={homologStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={2}
                  >
                    {homologStatus.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    verticalAlign="bottom"
                    iconType="square"
                    wrapperStyle={{ fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Fornecedores por categoria TI</h3>
          <div className="h-[280px]">
            {categorias.length === 0 ? (
              <EmptyState className="h-full" description="Sem fornecedores por categoria para exibir." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categorias}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                    {categorias.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FornecedoresDashboard;