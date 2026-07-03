import { useMemo } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, ReferenceLine,
} from "recharts";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  STATUS_LABELS,
  type SolicitacaoDetail,
  type SolicitacaoListItem,
  type SolicitacaoStatus,
} from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import EmptyState from "@/components/EmptyState";

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
} as const;

// Cores (CSS vars do tema) por status de solicitação — usadas no donut.
const STATUS_HEX: Record<SolicitacaoStatus, string> = {
  aguardando_controle: "hsl(var(--muted-foreground))",
  rejeitada_controle: "hsl(var(--destructive))",
  aguardando_proposta: "hsl(var(--warning))",
  proposta_enviada: "hsl(var(--primary))",
  aceita: "hsl(var(--success))",
  recusada: "hsl(var(--destructive))",
};

// Cor por status da análise da proposta (variação PF).
const ANALISE_HEX: Record<string, string> = {
  ok: "hsl(var(--success))",
  atencao: "hsl(var(--warning))",
  divergente: "hsl(var(--destructive))",
};

const numeroCurto = (numero: string) => numero.replace(/^VMO-\d{4}-/, "#");

async function fetchDashboard(): Promise<SolicitacaoDetail[]> {
  const list = await api.get<SolicitacaoListItem[]>("/solicitacoes");
  return Promise.all(list.map((s) => api.get<SolicitacaoDetail>(`/solicitacoes/${s.id}`)));
}

const FornecedorDashboard = () => {
  const { userName, userTeam } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["fornecedor-dashboard"],
    queryFn: fetchDashboard,
  });

  const metrics = useMemo(() => {
    const items = data ?? [];
    const count = (st: SolicitacaoStatus) => items.filter((i) => i.status === st).length;

    const aguardando = count("aguardando_proposta");
    const enviadas = count("proposta_enviada");
    const aceitas = count("aceita");
    const recusadas = count("recusada");
    const decididas = aceitas + recusadas;
    const taxaAprovacao = decididas > 0 ? Math.round((aceitas / decididas) * 100) : null;

    const divergentes = items.filter(
      (i) => i.status === "proposta_enviada" && i.analise_proposta?.status === "divergente",
    ).length;

    // Variação média PF (proposta vs. estimativa) — só onde há análise com variação.
    const comVariacao = items.filter(
      (i) => i.analise_proposta && i.analise_proposta.variacao_pct != null,
    );
    const variacaoMedia = comVariacao.length
      ? comVariacao.reduce((acc, i) => acc + Math.abs(i.analise_proposta!.variacao_pct!), 0) /
        comVariacao.length
      : null;

    // Tempo médio (dias) da criação da solicitação até o envio da proposta.
    const comProposta = items.filter((i) => i.proposta?.created_at);
    const tempoMedio = comProposta.length
      ? comProposta.reduce((acc, i) => {
          const ini = new Date(i.created_at).getTime();
          const fim = new Date(i.proposta!.created_at).getTime();
          return acc + Math.max(0, (fim - ini) / 86_400_000);
        }, 0) / comProposta.length
      : null;

    // Donut: distribuição por status (apenas os relevantes ao fornecedor).
    const statusOrder: SolicitacaoStatus[] = [
      "aguardando_proposta",
      "proposta_enviada",
      "aceita",
      "recusada",
    ];
    const statusChart = statusOrder
      .map((st) => ({ name: STATUS_LABELS[st], value: count(st), color: STATUS_HEX[st] }))
      .filter((d) => d.value > 0);

    // Barras: variação PF (proposta vs. estimativa) por projeto.
    const variacaoChart = items
      .filter((i) => i.analise_proposta && i.analise_proposta.variacao_pct != null)
      .map((i) => ({
        name: numeroCurto(i.numero),
        variacao: Number(i.analise_proposta!.variacao_pct!.toFixed(1)),
        color: ANALISE_HEX[i.analise_proposta!.status] ?? "hsl(var(--muted-foreground))",
      }));

    // Barras: valor estimado vs. valor proposto (R$) por projeto.
    const valorChart = items
      .filter((i) => i.analise_proposta?.valor_estimado != null && i.analise_proposta?.valor_proposta != null)
      .map((i) => ({
        name: numeroCurto(i.numero),
        estimado: i.analise_proposta!.valor_estimado!,
        proposta: i.analise_proposta!.valor_proposta!,
      }));

    return {
      total: items.length,
      aguardando,
      enviadas,
      aceitas,
      recusadas,
      taxaAprovacao,
      divergentes,
      variacaoMedia,
      tempoMedio,
      statusChart,
      variacaoChart,
      valorChart,
    };
  }, [data]);

  const kpis = [
    { label: "Aguardando envio", value: metrics.aguardando, hint: "propostas a enviar", accent: "bg-warning" },
    { label: "Propostas em análise", value: metrics.enviadas, hint: "aguardando decisão", accent: "bg-primary" },
    { label: "Projetos contratados", value: metrics.aceitas, hint: "propostas aceitas", accent: "bg-success" },
    {
      label: "Taxa de aprovação",
      value: metrics.taxaAprovacao == null ? "—" : `${metrics.taxaAprovacao}%`,
      hint: "aceitas vs. decididas",
      accent: "bg-success",
    },
    { label: "Propostas divergentes", value: metrics.divergentes, hint: "acima da tolerância", accent: "bg-destructive" },
    { label: "Propostas recusadas", value: metrics.recusadas, hint: "não contratadas", accent: "bg-destructive" },
    {
      label: "Variação média (PF)",
      value: metrics.variacaoMedia == null ? "—" : `${metrics.variacaoMedia.toFixed(1)}%`,
      hint: "proposta vs. estimativa",
      accent: "bg-muted-foreground",
    },
    {
      label: "Tempo médio p/ proposta",
      value: metrics.tempoMedio == null ? "—" : `${metrics.tempoMedio.toFixed(1)}d`,
      hint: "da atribuição ao envio",
      accent: "bg-muted-foreground",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Dashboard — Fornecedor</h2>
        <span className="text-sm text-muted-foreground">
          {userTeam || userName || "Fornecedor"}
        </span>
      </div>

      {/* Visão geral */}
      <div>
        <p className="text-[11px] font-semibold tracking-widest text-muted-foreground mb-3">VISÃO GERAL</p>
        <div className="grid grid-cols-4 gap-4">
          {kpis.map((kpi) => (
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

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Status donut */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold text-foreground">Status dos projetos atribuídos</h3>
          <p className="text-xs text-muted-foreground mb-3">
            {metrics.total} {metrics.total === 1 ? "projeto atribuído" : "projetos atribuídos"}
          </p>
          {metrics.statusChart.length === 0 ? (
            <EmptyState minHeight={240} description="Sem projetos atribuídos para exibir." />
          ) : (
            <>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
                {metrics.statusChart.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: d.color }} />
                    <span className="text-muted-foreground">{d.name} {d.value}</span>
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={metrics.statusChart} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={2} strokeWidth={0}>
                    {metrics.statusChart.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </>
          )}
        </div>

        {/* Variação PF proposta vs estimativa */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold text-foreground">Variação da proposta vs. estimativa</h3>
          <p className="text-xs text-muted-foreground mb-3">% de desvio dos PF propostos frente à contagem inicial</p>
          {metrics.variacaoChart.length === 0 ? (
            <EmptyState minHeight={240} description="Sem análise de proposta para exibir." />
          ) : (
            <>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2 text-xs">
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-success" /><span className="text-muted-foreground">Dentro da tolerância</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-warning" /><span className="text-muted-foreground">Atenção</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-destructive" /><span className="text-muted-foreground">Divergente</span></div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={metrics.variacaoChart} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${v}%`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, "Variação"]} />
                  <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" />
                  <Bar dataKey="variacao" radius={[4, 4, 0, 0]}>
                    {metrics.variacaoChart.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      </div>

      {/* Valor estimado vs proposto (R$) */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold text-foreground">Valor estimado vs. proposto (R$)</h3>
        <p className="text-xs text-muted-foreground mb-4">Comparação por projeto — base R$/PF da Configuração APF vigente</p>
        {metrics.valorChart.length === 0 ? (
          <EmptyState minHeight={260} description="Sem valores de proposta para exibir." />
        ) : (
          <>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2 text-xs">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-muted-foreground" /><span className="text-muted-foreground">Estimado</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-primary" /><span className="text-muted-foreground">Proposto</span></div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={metrics.valorChart} margin={{ top: 10, right: 20, bottom: 0, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => brl.format(v as number)} width={80} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number, n) => [brl.format(v), n === "estimado" ? "Estimado" : "Proposto"]} />
                <Bar dataKey="estimado" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="proposta" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  );
};

export default FornecedorDashboard;
