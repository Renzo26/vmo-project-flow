import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Star, Loader2 } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import StatCard, { HeroChip } from "@/components/dashboard/StatCard";
import ChartCard from "@/components/dashboard/ChartCard";
import { api } from "@/lib/api";
import type {
  ConfiguracaoAPFOut,
  SolicitacaoDetail,
  SolicitacaoListItem,
} from "@/lib/types";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Cell,
  ReferenceLine,
} from "recharts";

const COLORS = {
  ctrl: "hsl(var(--ctrl))",
  primary: "hsl(var(--primary))",
  success: "hsl(var(--success))",
  warning: "hsl(var(--warning))",
  destructive: "hsl(var(--destructive))",
  muted: "hsl(var(--muted-foreground))",
};

const SUPPLIER_PALETTE = [COLORS.primary, COLORS.ctrl, COLORS.warning, COLORS.muted, COLORS.success];

const categoriaColors: Record<string, string> = {
  Estratégico: COLORS.primary,
  Área: COLORS.ctrl,
  "Legal/Compliance": COLORS.warning,
  Outros: COLORS.muted,
};

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const tooltipStyle = { background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 } as const;

const mesLabel = (d: Date) => d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
const monthKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;

const mapCategoria = (c: string | null): keyof typeof categoriaColors => {
  const v = (c ?? "").toLowerCase();
  if (v.includes("estrat")) return "Estratégico";
  if (v.includes("área") || v.includes("area") || v.includes("departamento")) return "Área";
  if (v.includes("legal") || v.includes("compliance")) return "Legal/Compliance";
  return "Outros";
};

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">{children}</p>
);

interface DashboardData {
  details: SolicitacaoDetail[];
  config: ConfiguracaoAPFOut | null;
}

async function fetchDashboard(): Promise<DashboardData> {
  const [list, config] = await Promise.all([
    api.get<SolicitacaoListItem[]>("/solicitacoes"),
    api.get<ConfiguracaoAPFOut>("/apf-config/atual").catch(() => null),
  ]);
  const details = await Promise.all(list.map((s) => api.get<SolicitacaoDetail>(`/solicitacoes/${s.id}`)));
  return { details, config };
}

const ControleDashboard = () => {
  const { userTeam } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["controle-dashboard"],
    queryFn: fetchDashboard,
  });

  const m = useMemo(() => {
    const items = data?.details ?? [];
    const config = data?.config ?? null;
    const vpf = config?.valor_pf ?? 820;
    const tolerancia = config?.tolerancia ?? 10;
    const anoAtual = new Date().getFullYear();

    const valorEstimado = (i: SolicitacaoDetail) => i.valor_estimado ?? 0;
    const pf = (i: SolicitacaoDetail) => i.pf_estimado ?? i.analise_proposta?.pf_contagem ?? 0;
    const saving = (i: SolicitacaoDetail) => {
      const est = i.valor_estimado;
      const prop = i.analise_proposta?.valor_proposta;
      return est != null && prop != null ? Math.max(0, est - prop) : 0;
    };

    // ── KPIs ──
    const comContagem = items.filter((i) => i.valor_estimado != null);
    const gastoAno = comContagem
      .filter((i) => new Date(i.created_at).getFullYear() === anoAtual)
      .reduce((acc, i) => acc + valorEstimado(i), 0);
    const totalPF = items.reduce((acc, i) => acc + pf(i), 0);
    const savingAcumulado = items.reduce((acc, i) => acc + saving(i), 0);

    const analises = items.filter((i) => i.analise_proposta);
    const aderenteOk = analises.filter((i) => i.analise_proposta!.status === "ok").length;
    const aderenciaGeral = analises.length ? Math.round((aderenteOk / analises.length) * 100) : null;
    const acimaContrato = items.filter(
      (i) => i.analise_proposta?.variacao_pct != null && i.analise_proposta.variacao_pct > tolerancia,
    ).length;

    const metodCount = new Map<string, number>();
    for (const i of items) {
      if (i.metodologia_pf) metodCount.set(i.metodologia_pf, (metodCount.get(i.metodologia_pf) ?? 0) + 1);
    }
    const metodologiaPadrao = config?.metodologia
      ?? [...metodCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
      ?? "—";

    // ── Fornecedores presentes (com projeto atribuído) ──
    const suppliers = [...new Set(items.map((i) => i.fornecedor_nome).filter((n): n is string => !!n))];
    const supplierColor = new Map(suppliers.map((s, i) => [s, SUPPLIER_PALETTE[i % SUPPLIER_PALETTE.length]]));

    // ── Últimos 6 meses ──
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, k) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - k), 1);
      return { key: monthKey(d), label: mesLabel(d) };
    });

    // Valor estimado por período (barra) + acumulado (linha)
    let acc = 0;
    const savingData = months.map(({ key, label }) => {
      const doMes = comContagem.filter((i) => monthKey(new Date(i.created_at)) === key);
      const valor = doMes.reduce((a, i) => a + valorEstimado(i), 0) / 1000;
      acc += valor;
      return { mes: label, valor: Math.round(valor * 10) / 10, acumulado: Math.round(acc * 10) / 10 };
    });
    const temValorPeriodo = savingData.some((d) => d.valor > 0);

    // Gasto (estimado) mensal por fornecedor
    const gastoMensalData: Record<string, number | string>[] = months.map(({ key, label }) => {
      const row: Record<string, number | string> = { mes: label };
      for (const s of suppliers) {
        const total = comContagem
          .filter((i) => i.fornecedor_nome === s && monthKey(new Date(i.created_at)) === key)
          .reduce((a, i) => a + valorEstimado(i), 0);
        row[s] = Math.round((total / 1000) * 10) / 10;
      }
      return row;
    });
    const temGastoMensal = suppliers.length > 0 && temValorPeriodo;

    // Aderência de preço por fornecedor
    const aderenciaData = suppliers
      .map((s) => {
        const an = analises.filter((i) => i.fornecedor_nome === s);
        const ok = an.filter((i) => i.analise_proposta!.status === "ok").length;
        return { fornecedor: s, valor: an.length ? Math.round((ok / an.length) * 100) : 0, temDados: an.length > 0 };
      })
      .filter((d) => d.temDados);

    // Fornecedores por categoria
    const categoriaData = suppliers.map((s) => {
      const row: Record<string, number | string> = { fornecedor: s, "Estratégico": 0, "Área": 0, "Legal/Compliance": 0, Outros: 0 };
      for (const i of items.filter((x) => x.fornecedor_nome === s)) {
        const cat = mapCategoria(i.categoria);
        row[cat] = (row[cat] as number) + 1;
      }
      return row;
    });
    const temCategoria = categoriaData.length > 0;

    // Scorecard por fornecedor
    const scorecard = suppliers.map((s) => {
      const proj = items.filter((i) => i.fornecedor_nome === s);
      const an = proj.filter((i) => i.analise_proposta);
      const ok = an.filter((i) => i.analise_proposta!.status === "ok").length;
      const aderencia = an.length ? Math.round((ok / an.length) * 100) : 0;
      const comProp = proj.filter((i) => i.proposta?.created_at);
      const slaNum = comProp.length
        ? comProp.reduce((a, i) => {
            const ini = new Date(i.created_at).getTime();
            const fim = new Date(i.proposta!.created_at).getTime();
            return a + Math.max(0, (fim - ini) / 86_400_000);
          }, 0) / comProp.length
        : null;
      const pfTotal = proj.reduce((a, i) => a + pf(i), 0);
      const aceitas = proj.filter((i) => i.status === "aceita").length;
      const score = an.length ? Math.round((aderencia / 100) * 5 * 10) / 10 : 0;
      return {
        fornecedor: s,
        projetos: proj.length,
        propostas: proj.filter((i) => i.status === "proposta_enviada" || i.status === "aceita" || i.status === "recusada").length,
        aceitas,
        pf: pfTotal,
        aderencia,
        sla: slaNum == null ? "—" : `${slaNum.toFixed(1)}d`,
        score,
        status: proj.length > 0 ? "Ativo" : "Inativo",
      };
    });

    return {
      vpf,
      gastoAno,
      totalPF,
      savingAcumulado,
      aderenciaGeral,
      acimaContrato,
      metodologiaPadrao,
      suppliers,
      supplierColor,
      savingData,
      temValorPeriodo,
      gastoMensalData,
      temGastoMensal,
      aderenciaData,
      categoriaData,
      temCategoria,
      scorecard,
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
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-foreground">Dashboard — Governança</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{userTeam || "Gestão de Suprimentos TI"}</p>
        </div>
      </div>

      {/* Visão financeira consolidada — grid bento: hero 2×2 + 6 cards + 1 wide */}
      <SectionLabel>Visão financeira consolidada</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          variant="hero"
          className="sm:col-span-2 xl:row-span-2"
          label="Gasto TI estimado (ano)"
          value={brl.format(m.gastoAno)}
          hint="portfólio com contagem"
          footer={
            <div className="flex flex-wrap gap-2">
              <HeroChip>{m.suppliers.length} {m.suppliers.length === 1 ? "fornecedor" : "fornecedores"}</HeroChip>
              <HeroChip>{Math.round(m.totalPF).toLocaleString("pt-BR")} PF</HeroChip>
            </div>
          }
        />
        <StatCard
          label="Valor médio R$/PF"
          value={brl.format(m.vpf)}
          hint="configuração vigente"
          tone="primary"
        />
        <StatCard
          label="Aderência contratual geral"
          value={m.aderenciaGeral == null ? "—" : `${m.aderenciaGeral}%`}
          hint="propostas dentro da tolerância"
          tone="success"
          badge={
            m.aderenciaGeral == null
              ? undefined
              : m.aderenciaGeral >= 90
                ? { label: "meta atingida", tone: "success", direction: "up" }
                : { label: "abaixo da meta", tone: "warning", direction: "down" }
          }
        />
        <StatCard
          label="Total de PF no portfólio"
          value={Math.round(m.totalPF).toLocaleString("pt-BR")}
          hint="todos os projetos contados"
          tone="primary"
        />
        <StatCard
          label="Saving acumulado"
          value={brl.format(m.savingAcumulado)}
          hint="economia vs. estimativa"
          tone="success"
          badge={m.savingAcumulado > 0 ? { label: "economia", tone: "success", direction: "up" } : undefined}
        />
        <StatCard
          label="Propostas acima do contrato"
          value={m.acimaContrato}
          hint="variação além da tolerância"
          tone="warning"
          badge={
            m.acimaContrato > 0
              ? { label: "atenção", tone: "destructive" }
              : { label: "em dia", tone: "success" }
          }
        />
        <StatCard label="Contratos a vencer (90d)" value="—" hint="sem dado de vigência" tone="destructive" />
        <StatCard
          className="sm:col-span-2"
          label="Metodologia padrão APF"
          value={String(m.metodologiaPadrao).toUpperCase()}
          hint="mais usada no portfólio"
          tone="neutral"
        />
      </div>

      {/* Saving e Custo */}
      <SectionLabel>Valor estimado e custo</SectionLabel>
      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard
          title="Valor estimado por período"
          subtitle="Valor estimado dos projetos contados e acumulado (R$ mil)"
          chip="6 meses"
        >
          {!m.temValorPeriodo ? (
            <EmptyState minHeight={260} description="Sem valores estimados no período." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={m.savingData}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => `R$${v}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `R$ ${v}k`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="valor" name="Estimado no mês" fill={COLORS.ctrl} radius={[4, 4, 0, 0]} barSize={28} />
                <Line dataKey="acumulado" name="Acumulado" stroke={COLORS.primary} strokeWidth={2.5} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Valor estimado mensal por fornecedor"
          subtitle="R$ mil — últimos 6 meses"
          chip={`${m.suppliers.length} ${m.suppliers.length === 1 ? "fornecedor" : "fornecedores"}`}
        >
          {!m.temGastoMensal ? (
            <EmptyState minHeight={260} description="Sem valores por fornecedor para exibir." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={m.gastoMensalData}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => `${v}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `R$ ${v}k`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {m.suppliers.map((s) => (
                  <Bar key={s} dataKey={s} fill={m.supplierColor.get(s)} radius={[3, 3, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Scorecard de fornecedores */}
      <SectionLabel>Scorecard de fornecedores</SectionLabel>
      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard
          title="Aderência de preço por fornecedor"
          subtitle="% de propostas dentro da tolerância"
          chip="meta 90%"
        >
          {m.aderenciaData.length === 0 ? (
            <EmptyState minHeight={260} description="Sem dados de aderência para exibir." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={m.aderenciaData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="fornecedor" stroke="hsl(var(--muted-foreground))" fontSize={11} width={110} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, "Aderência"]} />
                <ReferenceLine x={90} stroke={COLORS.destructive} strokeDasharray="4 4" label={{ value: "Meta 90%", fontSize: 10, fill: "hsl(var(--destructive))", position: "top" }} />
                <Bar dataKey="valor" radius={[0, 4, 4, 0]} barSize={22}>
                  {m.aderenciaData.map((d, i) => (
                    <Cell key={i} fill={d.valor >= 90 ? COLORS.success : COLORS.warning} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Fornecedores por categoria de projeto"
          subtitle="Projetos estratégicos, de área, legais e outros por fornecedor"
          chip="projetos"
        >
          {!m.temCategoria ? (
            <EmptyState minHeight={260} description="Sem projetos por categoria para exibir." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={m.categoriaData}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="fornecedor" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => `${v} proj.`} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Estratégico" stackId="a" fill={categoriaColors["Estratégico"]} />
                <Bar dataKey="Área" stackId="a" fill={categoriaColors["Área"]} />
                <Bar dataKey="Legal/Compliance" stackId="a" fill={categoriaColors["Legal/Compliance"]} />
                <Bar dataKey="Outros" stackId="a" fill={categoriaColors["Outros"]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Scorecard tabela */}
      <ChartCard
        title="Scorecard completo de fornecedores"
        subtitle="Avaliação consolidada por fornecedor com projeto atribuído"
        chip={`${m.scorecard.length} ${m.scorecard.length === 1 ? "fornecedor" : "fornecedores"}`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-3 py-2 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">Fornecedor</th>
                <th className="text-center px-3 py-2 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">Projetos</th>
                <th className="text-center px-3 py-2 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">Propostas</th>
                <th className="text-center px-3 py-2 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">Aceitas</th>
                <th className="text-left px-3 py-2 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">PF portfólio</th>
                <th className="text-left px-3 py-2 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">Aderência</th>
                <th className="text-left px-3 py-2 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">SLA proposta</th>
                <th className="text-center px-3 py-2 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">Score</th>
                <th className="text-center px-3 py-2 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {m.scorecard.map((row) => {
                const okAderencia = row.aderencia >= 90;
                return (
                  <tr key={row.fornecedor} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-3 py-3 font-medium text-foreground">{row.fornecedor}</td>
                    <td className="px-3 py-3 text-center text-muted-foreground">{row.projetos}</td>
                    <td className="px-3 py-3 text-center text-muted-foreground">{row.propostas}</td>
                    <td className="px-3 py-3 text-center text-muted-foreground">{row.aceitas}</td>
                    <td className="px-3 py-3 text-muted-foreground">{Math.round(row.pf).toLocaleString("pt-BR")}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${row.aderencia}%`, background: okAderencia ? COLORS.success : COLORS.warning }} />
                        </div>
                        <span className={`text-xs font-medium ${okAderencia ? "text-success" : "text-warning"}`}>{row.aderencia}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">{row.sla}</span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-foreground">
                        <Star className="h-3 w-3 fill-warning text-warning" />
                        {row.score.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${row.status === "Ativo" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {m.scorecard.length === 0 && (
                <tr>
                  <td colSpan={9}>
                    <EmptyState title="Nenhum fornecedor com projeto" description="O scorecard é preenchido conforme os fornecedores recebem projetos atribuídos." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
};

export default ControleDashboard;
