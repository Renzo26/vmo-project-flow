import { useAuth } from "@/contexts/AuthContext";
import { Star } from "lucide-react";
import EmptyState from "@/components/EmptyState";
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
  ReferenceLine,
} from "recharts";

const kpis = [
  { label: "Gasto TI total (ano)", value: "—", hint: "", accent: "hsl(var(--ctrl))", tone: "text-muted-foreground" },
  { label: "Valor médio R$/PF", value: "—", hint: "", accent: "hsl(var(--primary))", tone: "text-muted-foreground" },
  { label: "Aderência contratual geral", value: "—", hint: "", accent: "hsl(var(--success))", tone: "text-muted-foreground" },
  { label: "Total de PF contratados", value: "—", hint: "", accent: "hsl(var(--primary))", tone: "text-muted-foreground" },
  { label: "Saving acumulado", value: "—", hint: "", accent: "hsl(var(--success))", tone: "text-muted-foreground" },
  { label: "Propostas acima do contrato", value: "—", hint: "", accent: "hsl(var(--warning))", tone: "text-muted-foreground" },
  { label: "Contratos a vencer (90d)", value: "—", hint: "", accent: "hsl(var(--destructive))", tone: "text-muted-foreground" },
  { label: "Metodologia padrão APF", value: "—", hint: "", accent: "hsl(var(--ctrl))", tone: "text-muted-foreground" },
];

const savingData: { mes: string; saving: number; acumulado: number }[] = [];

const gastoMensalData: { mes: string; TechSoft: number; DevBrasil: number; InfoSystems: number; "Soluções Corp": number }[] = [];

const aderenciaData: { fornecedor: string; valor: number }[] = [];

const categoriaData: { fornecedor: string; "Estratégico": number; "Área": number; "Legal/Compliance": number; Outros: number }[] = [];

const scorecard: { fornecedor: string; pf: string; aderencia: number; sla: string; estrat: number; area: number; legais: number; score: number; status: string }[] = [];

const COLORS = {
  ctrl: "hsl(var(--ctrl))",
  primary: "hsl(var(--primary))",
  success: "hsl(var(--success))",
  warning: "hsl(var(--warning))",
  destructive: "hsl(var(--destructive))",
  muted: "hsl(var(--muted-foreground))",
};

const categoriaColors: Record<string, string> = {
  Estratégico: COLORS.primary,
  Área: COLORS.ctrl,
  "Legal/Compliance": COLORS.warning,
  Outros: COLORS.muted,
};

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">{children}</p>
);

const ControleDashboard = () => {
  const { userTeam } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-foreground">Dashboard — Controle Econômico</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{userTeam || "Gestão de Suprimentos TI"}</p>
        </div>
      </div>

      {/* Visão financeira consolidada */}
      <SectionLabel>Visão financeira consolidada</SectionLabel>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map(k => (
          <div
            key={k.label}
            className="bg-card rounded-xl border border-border p-4 border-t-[3px]"
            style={{ borderTopColor: k.accent }}
          >
            <p className="text-xs text-muted-foreground mb-1">{k.label}</p>
            <p className="text-2xl font-bold text-foreground leading-tight">{k.value}</p>
            <p className={`text-[11px] mt-1 ${k.tone}`}>{k.hint}</p>
          </div>
        ))}
      </div>

      {/* Saving e Custo */}
      <SectionLabel>Saving e custo</SectionLabel>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground text-sm">Saving por período</h3>
          <p className="text-xs text-muted-foreground mb-4">Economia gerada via negociação automática de preços (R$ mil)</p>
          {savingData.length === 0 ? (
            <EmptyState minHeight={260} description="Sem saving registrado para exibir." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={savingData}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={v => `R$${v}k`} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="saving" name="Saving mensal" fill={COLORS.success} radius={[4, 4, 0, 0]} barSize={28} />
                <Line dataKey="acumulado" name="Acumulado" stroke={COLORS.primary} strokeWidth={2.5} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground text-sm">Gasto mensal por fornecedor</h3>
          <p className="text-xs text-muted-foreground mb-4">R$ mil — últimos 6 meses</p>
          {gastoMensalData.length === 0 ? (
            <EmptyState minHeight={260} description="Sem gastos registrados para exibir." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={gastoMensalData}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={v => `${v}k`} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="TechSoft" fill={COLORS.primary} radius={[3, 3, 0, 0]} />
                <Bar dataKey="DevBrasil" fill={COLORS.ctrl} radius={[3, 3, 0, 0]} />
                <Bar dataKey="InfoSystems" fill={COLORS.warning} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Soluções Corp" fill={COLORS.muted} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Scorecard de fornecedores */}
      <SectionLabel>Scorecard de fornecedores</SectionLabel>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground text-sm">Aderência de preço por fornecedor</h3>
          <p className="text-xs text-muted-foreground mb-4">% de propostas dentro do valor contratado (meta: 90%)</p>
          {aderenciaData.length === 0 ? (
            <EmptyState minHeight={260} description="Sem dados de aderência para exibir." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={aderenciaData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={v => `${v}%`} />
                <YAxis type="category" dataKey="fornecedor" stroke="hsl(var(--muted-foreground))" fontSize={11} width={90} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <ReferenceLine x={90} stroke={COLORS.destructive} strokeDasharray="4 4" label={{ value: "Meta 90%", fontSize: 10, fill: "hsl(var(--destructive))", position: "top" }} />
                <Bar dataKey="valor" radius={[0, 4, 4, 0]} barSize={22}>
                  {aderenciaData.map((d, i) => (
                    <Bar key={i} dataKey="valor" fill={d.valor >= 90 ? COLORS.success : COLORS.warning} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground text-sm">Fornecedores por categoria de projeto</h3>
          <p className="text-xs text-muted-foreground mb-4">Projetos estratégicos, de área, legais e outros por fornecedor</p>
          {categoriaData.length === 0 ? (
            <EmptyState minHeight={260} description="Sem projetos por categoria para exibir." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categoriaData}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="fornecedor" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={v => `${v} proj.`} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Estratégico" stackId="a" fill={categoriaColors["Estratégico"]} />
                <Bar dataKey="Área" stackId="a" fill={categoriaColors["Área"]} />
                <Bar dataKey="Legal/Compliance" stackId="a" fill={categoriaColors["Legal/Compliance"]} />
                <Bar dataKey="Outros" stackId="a" fill={categoriaColors["Outros"]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Scorecard tabela */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold text-foreground text-sm">Scorecard completo de fornecedores</h3>
        <p className="text-xs text-muted-foreground mb-4">Avaliação consolidada por critério — ciclo 2024</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-3 py-2 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">Fornecedor</th>
                <th className="text-left px-3 py-2 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">PF contratados</th>
                <th className="text-left px-3 py-2 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">Aderência preço</th>
                <th className="text-left px-3 py-2 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">SLA proposta</th>
                <th className="text-center px-3 py-2 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">Estratégicos</th>
                <th className="text-center px-3 py-2 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">Área</th>
                <th className="text-center px-3 py-2 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">Legais</th>
                <th className="text-center px-3 py-2 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">Score</th>
                <th className="text-center px-3 py-2 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {scorecard.map(row => {
                const okAderencia = row.aderencia >= 90;
                const okSla = parseFloat(row.sla.replace(",", ".")) <= 3;
                return (
                  <tr key={row.fornecedor} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-3 py-3 font-medium text-foreground">{row.fornecedor}</td>
                    <td className="px-3 py-3 text-muted-foreground">{row.pf}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${row.aderencia}%`, background: okAderencia ? COLORS.success : COLORS.warning }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${okAderencia ? "text-success" : "text-warning"}`}>{row.aderencia}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${okSla ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>{row.sla}</span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">{row.estrat}</span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-ctrl/10 text-ctrl text-xs font-medium">{row.area}</span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-warning/10 text-warning text-xs font-medium">{row.legais}</span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-foreground">
                        <Star className="h-3 w-3 fill-warning text-warning" />
                        {row.score.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${row.status === "Ativo" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {scorecard.length === 0 && (
                <tr>
                  <td colSpan={9}>
                    <EmptyState
                      title="Nenhum fornecedor avaliado"
                      description="O scorecard será preenchido conforme os fornecedores forem contratados e avaliados."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ControleDashboard;