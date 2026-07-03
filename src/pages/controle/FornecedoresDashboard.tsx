import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { api } from "@/lib/api";
import type { FornecedorOut, SolicitacaoListItem } from "@/lib/types";
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

const PALETTE = [
  "hsl(var(--primary))",
  "hsl(var(--ctrl))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--muted-foreground))",
  "hsl(var(--destructive))",
];

const tooltipStyle = { background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 } as const;

async function fetchData(): Promise<{ fornecedores: FornecedorOut[]; solicitacoes: SolicitacaoListItem[] }> {
  const [fornecedores, solicitacoes] = await Promise.all([
    api.get<FornecedorOut[]>("/fornecedores"),
    api.get<SolicitacaoListItem[]>("/solicitacoes"),
  ]);
  return { fornecedores, solicitacoes };
}

const FornecedoresDashboard = () => {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["fornecedores-dashboard"],
    queryFn: fetchData,
  });

  const m = useMemo(() => {
    const fornecedores = data?.fornecedores ?? [];
    const solicitacoes = data?.solicitacoes ?? [];

    // Projetos por fornecedor (id → contagem)
    const projPorId = new Map<string, number>();
    for (const s of solicitacoes) {
      if (s.fornecedor_id) projPorId.set(s.fornecedor_id, (projPorId.get(s.fornecedor_id) ?? 0) + 1);
    }

    const total = fornecedores.length;
    const comProjetos = fornecedores.filter((f) => (projPorId.get(f.id) ?? 0) > 0).length;
    const semProjetos = total - comProjetos;

    // Categorias TI declaradas (campo categorias = lista separada por vírgula)
    const catCount = new Map<string, number>();
    for (const f of fornecedores) {
      const tokens = (f.categorias ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      for (const t of new Set(tokens)) catCount.set(t, (catCount.get(t) ?? 0) + 1);
    }
    const categoriasCobertas = catCount.size;

    // Pie: distribuição de projetos por fornecedor
    const projetosChart = fornecedores
      .map((f, i) => ({ name: f.nome, value: projPorId.get(f.id) ?? 0, color: PALETTE[i % PALETTE.length] }))
      .filter((d) => d.value > 0);

    // Bar: fornecedores por categoria TI
    const categorias = [...catCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, totalCat], i) => ({ name, total: totalCat, color: PALETTE[i % PALETTE.length] }));

    return { total, comProjetos, semProjetos, categoriasCobertas, projetosChart, categorias };
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const cards = [
    { label: "Total de fornecedores", value: m.total, hint: "cadastrados", accent: "bg-primary" },
    { label: "Com projetos atribuídos", value: m.comProjetos, hint: "do total", accent: "bg-success" },
    { label: "Sem projetos", value: m.semProjetos, hint: "ainda não atribuídos", accent: "bg-warning" },
    { label: "Categorias TI cobertas", value: m.categoriasCobertas, hint: "áreas de atuação", accent: "bg-ctrl" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-foreground">Dashboard — Fornecedores</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/controle/fornecedores/base")} className="text-sm text-primary hover:underline px-3 py-2">
            Base de fornecedores
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-card rounded-xl border border-border overflow-hidden">
            <div className={`h-1 ${c.accent}`} />
            <div className="p-4">
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className="text-3xl font-bold text-foreground mt-1">{c.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{c.hint}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Distribuição de projetos por fornecedor</h3>
          <div className="h-[280px]">
            {m.projetosChart.length === 0 ? (
              <EmptyState className="h-full" description="Nenhum projeto atribuído a fornecedores." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={m.projetosChart} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={2}>
                    {m.projetosChart.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v} projeto(s)`, ""]} />
                  <Legend verticalAlign="bottom" iconType="square" wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Fornecedores por categoria TI</h3>
          <div className="h-[280px]">
            {m.categorias.length === 0 ? (
              <EmptyState className="h-full" description="Sem categorias declaradas pelos fornecedores." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={m.categorias} margin={{ bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-12} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v} fornecedor(es)`, ""]} />
                  <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                    {m.categorias.map((entry) => (
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
