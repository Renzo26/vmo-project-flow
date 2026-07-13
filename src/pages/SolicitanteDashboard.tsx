import { useMemo } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
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
import StatCard, { HeroChip } from "@/components/dashboard/StatCard";
import ChartCard, { DonutCenter } from "@/components/dashboard/ChartCard";

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

const STATUS_HEX: Record<SolicitacaoStatus, string> = {
  aguardando_controle: "hsl(var(--muted-foreground))",
  rejeitada_controle: "hsl(var(--destructive))",
  aguardando_proposta: "hsl(var(--warning))",
  proposta_enviada: "hsl(var(--primary))",
  aceita: "hsl(var(--success))",
  recusada: "hsl(var(--destructive))",
};

const PALETTE = [
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--destructive))",
  "hsl(var(--muted-foreground))",
];

const ATIVOS: SolicitacaoStatus[] = ["aguardando_controle", "aguardando_proposta", "proposta_enviada"];

// Custo contratado = valor da proposta analisada; cai para o estimado quando não há análise.
const custoDe = (i: SolicitacaoDetail) => i.analise_proposta?.valor_proposta ?? i.valor_estimado ?? 0;

const mesLabel = (d: Date) =>
  d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");

async function fetchDashboard(): Promise<SolicitacaoDetail[]> {
  const list = await api.get<SolicitacaoListItem[]>("/solicitacoes");
  return Promise.all(list.map((s) => api.get<SolicitacaoDetail>(`/solicitacoes/${s.id}`)));
}

const SolicitanteDashboard = () => {
  const { userName, userTeam } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["solicitante-dashboard"],
    queryFn: fetchDashboard,
  });

  const metrics = useMemo(() => {
    const items = data ?? [];
    const count = (st: SolicitacaoStatus) => items.filter((i) => i.status === st).length;
    const aceitasArr = items.filter((i) => i.status === "aceita");

    const ativos = items.filter((i) => ATIVOS.includes(i.status)).length;
    const aguardandoAcao = count("proposta_enviada");
    const aceitas = aceitasArr.length;
    const recusadas = count("recusada");
    const decididas = aceitas + recusadas;
    const taxaAprovacao = decididas > 0 ? Math.round((aceitas / decididas) * 100) : null;

    const custoContratado = aceitasArr.reduce((acc, i) => acc + custoDe(i), 0);
    const horasContratadas = aceitasArr.reduce((acc, i) => acc + (i.esforco_horas ?? 0), 0);
    const temHoras = aceitasArr.some((i) => i.esforco_horas != null);

    const paraCorrigir = items.filter(
      (i) => i.status === "proposta_enviada" && i.analise_proposta?.status === "divergente",
    ).length;

    // SLA médio de resposta: dias entre criação e envio da proposta.
    const comProposta = items.filter((i) => i.proposta?.created_at);
    const slaMedio = comProposta.length
      ? comProposta.reduce((acc, i) => {
          const ini = new Date(i.created_at).getTime();
          const fim = new Date(i.proposta!.created_at).getTime();
          return acc + Math.max(0, (fim - ini) / 86_400_000);
        }, 0) / comProposta.length
      : null;

    // Donut de status.
    const statusOrder: SolicitacaoStatus[] = [
      "aguardando_controle",
      "rejeitada_controle",
      "aguardando_proposta",
      "proposta_enviada",
      "aceita",
      "recusada",
    ];
    const statusChart = statusOrder
      .map((st) => ({ name: STATUS_LABELS[st], value: count(st), color: STATUS_HEX[st] }))
      .filter((d) => d.value > 0);

    // Custo por tipo de serviço (projetos contratados).
    const porTipo = new Map<string, number>();
    for (const i of aceitasArr) {
      const key = i.tipo_servico ?? "Outros";
      porTipo.set(key, (porTipo.get(key) ?? 0) + custoDe(i));
    }
    const totalCusto = [...porTipo.values()].reduce((a, b) => a + b, 0);
    const serviceCostChart = [...porTipo.entries()]
      .filter(([, v]) => v > 0)
      .map(([name, valor], i) => ({
        name,
        valor,
        value: totalCusto > 0 ? Math.round((valor / totalCusto) * 100) : 0,
        color: PALETTE[i % PALETTE.length],
      }));

    // Evolução do custo contratado — acumulado nos últimos 6 meses (R$ mil).
    const now = new Date();
    const buckets: { key: string; month: string; value: number }[] = [];
    for (let k = 5; k >= 0; k--) {
      const d = new Date(now.getFullYear(), now.getMonth() - k, 1);
      buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, month: mesLabel(d), value: 0 });
    }
    for (const i of aceitasArr) {
      const d = new Date(i.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const b = buckets.find((x) => x.key === key);
      if (b) b.value += custoDe(i);
    }
    let acc = 0;
    const temCustoNoPeriodo = buckets.some((b) => b.value > 0);
    const costEvolution = temCustoNoPeriodo
      ? buckets.map((b) => {
          acc += b.value;
          return { month: b.month, value: Math.round((acc / 1000) * 10) / 10 };
        })
      : [];

    // Δ% do custo contratado no mês atual vs. mês anterior (selo de tendência).
    const mesAtual = buckets[5]?.value ?? 0;
    const mesAnterior = buckets[4]?.value ?? 0;
    const custoDeltaPct = mesAnterior > 0
      ? Math.round(((mesAtual - mesAnterior) / mesAnterior) * 100)
      : null;

    return {
      total: items.length,
      ativos,
      aguardandoAcao,
      custoContratado,
      horasContratadas,
      temHoras,
      paraCorrigir,
      slaMedio,
      taxaAprovacao,
      custoDeltaPct,
      statusChart,
      serviceCostChart,
      costEvolution,
    };
  }, [data]);

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
        <h2 className="text-xl font-bold text-foreground">Dashboard — Solicitante</h2>
        <span className="text-sm text-muted-foreground">
          {userName || "Solicitante"}{userTeam ? ` · ${userTeam}` : ""}
        </span>
      </div>

      {/* Visão geral — grid bento: hero 2×2 + 6 cards + 1 wide */}
      <div>
        <p className="text-[11px] font-semibold tracking-widest text-muted-foreground mb-3">VISÃO GERAL</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            variant="hero"
            className="sm:col-span-2 xl:row-span-2"
            label="Projetos ativos"
            value={metrics.ativos}
            hint="solicitações em andamento"
            footer={
              <div className="flex flex-wrap gap-2">
                <HeroChip>{metrics.aguardandoAcao} a decidir</HeroChip>
                <HeroChip>{metrics.total} no total</HeroChip>
              </div>
            }
          />
          <StatCard
            label="Aguardando minha ação"
            value={metrics.aguardandoAcao}
            hint="propostas a decidir"
            tone="warning"
            badge={metrics.aguardandoAcao > 0 ? { label: "requer ação", tone: "warning" } : undefined}
          />
          <StatCard
            label="Custo contratado"
            value={brl.format(metrics.custoContratado)}
            hint="projetos aceitos"
            tone="success"
            badge={
              metrics.custoDeltaPct == null
                ? undefined
                : {
                    label: `${metrics.custoDeltaPct > 0 ? "+" : ""}${metrics.custoDeltaPct}%`,
                    tone: metrics.custoDeltaPct > 0 ? "warning" : "success",
                    direction: metrics.custoDeltaPct > 0 ? "up" : "down",
                  }
            }
          />
          <StatCard
            label="Horas contratadas"
            value={metrics.temHoras ? `${Math.round(metrics.horasContratadas)}h` : "—"}
            hint="esforço estimado"
            tone="success"
          />
          <StatCard
            label="Propostas para corrigir"
            value={metrics.paraCorrigir}
            hint="com divergência"
            tone="destructive"
            badge={
              metrics.paraCorrigir > 0
                ? { label: "divergência", tone: "destructive" }
                : { label: "em dia", tone: "success" }
            }
          />
          <StatCard label="Contratos próx. vencimento" value="—" hint="sem dado de vigência" tone="warning" />
          <StatCard
            label="SLA médio de resposta"
            value={metrics.slaMedio == null ? "—" : `${metrics.slaMedio.toFixed(1)}d`}
            hint="criação → proposta"
            tone="success"
          />
          <StatCard
            className="sm:col-span-2"
            label="Taxa de aprovação"
            value={metrics.taxaAprovacao == null ? "—" : `${metrics.taxaAprovacao}%`}
            hint="aceitas vs. decididas"
            tone="success"
            badge={
              metrics.taxaAprovacao == null
                ? undefined
                : metrics.taxaAprovacao >= 50
                  ? { label: "saudável", tone: "success", direction: "up" }
                  : { label: "abaixo de 50%", tone: "warning", direction: "down" }
            }
          />
        </div>
      </div>

      {/* Donut charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Status dos projetos"
          subtitle="Distribuição por situação atual"
          chip={`${metrics.total} ${metrics.total === 1 ? "projeto" : "projetos"}`}
        >
          {metrics.statusChart.length === 0 ? (
            <EmptyState minHeight={240} description="Sem projetos para exibir." />
          ) : (
            <>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
                {metrics.statusChart.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="text-muted-foreground">{d.name} {d.value}</span>
                  </div>
                ))}
              </div>
              <div className="relative">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={metrics.statusChart} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={2} strokeWidth={0}>
                      {metrics.statusChart.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <DonutCenter value={metrics.total} label="projetos" />
              </div>
            </>
          )}
        </ChartCard>

        <ChartCard
          title="Custo por tipo de serviço"
          subtitle="Distribuição do orçamento contratado"
          chip="contratado"
        >
          {metrics.serviceCostChart.length === 0 ? (
            <EmptyState minHeight={240} description="Sem custos contratados para exibir." />
          ) : (
            <>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
                {metrics.serviceCostChart.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="text-muted-foreground">{d.name} {d.value}%</span>
                  </div>
                ))}
              </div>
              <div className="relative">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={metrics.serviceCostChart} dataKey="valor" cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={2} strokeWidth={0}>
                      {metrics.serviceCostChart.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number, n) => [brl.format(v), n]} />
                  </PieChart>
                </ResponsiveContainer>
                <DonutCenter value={brl.format(metrics.custoContratado)} label="total" />
              </div>
            </>
          )}
        </ChartCard>
      </div>

      {/* Evolução do custo */}
      <ChartCard
        title="Evolução do custo contratado"
        subtitle="Acumulado mensal em R$ mil"
        chip="6 meses"
      >
        {metrics.costEvolution.length === 0 ? (
          <EmptyState minHeight={260} description="Sem histórico de custo para exibir." />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={metrics.costEvolution} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${v}k`} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [`R$ ${v}k`, "Custo acumulado"]}
              />
              <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--primary))" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
};

export default SolicitanteDashboard;
