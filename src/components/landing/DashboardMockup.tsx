import type { ReactNode } from "react";
import { Bell, Moon } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import StatCard, { HeroChip } from "@/components/dashboard/StatCard";
import ChartCard from "@/components/dashboard/ChartCard";
import { useEhDesktop } from "@/hooks/useMediaQuery";

/* ─────────────────────────────────────────────────────────────
   Mockup do dashboard de Governança para a landing.
   Usa os componentes reais do app (StatCard / ChartCard) e o mesmo
   layout de src/pages/controle/ControleDashboard.tsx, com dados
   estáticos no lugar das chamadas à API.
   ───────────────────────────────────────────────────────────── */

const COLORS = {
  ctrl: "hsl(var(--ctrl))",
  primary: "hsl(var(--primary))",
  warning: "hsl(var(--warning))",
  muted: "hsl(var(--muted-foreground))",
};

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const NAV = ["Dashboard", "Solicitações", "APF", "Contratos"] as const;

// Valor estimado no mês e acumulado (R$ mil) — últimos 6 meses
const SAVING_DATA = [
  { mes: "fev", valor: 412, acumulado: 412 },
  { mes: "mar", valor: 538, acumulado: 950 },
  { mes: "abr", valor: 604, acumulado: 1554 },
  { mes: "mai", valor: 726, acumulado: 2280 },
  { mes: "jun", valor: 891, acumulado: 3171 },
  { mes: "jul", valor: 1641, acumulado: 4812 },
];

// Valor estimado mensal por fornecedor (R$ mil)
const FORNECEDOR_DATA = [
  { mes: "fev", Alfa: 180, Beta: 142, Gama: 90 },
  { mes: "mar", Alfa: 224, Beta: 186, Gama: 128 },
  { mes: "abr", Alfa: 261, Beta: 198, Gama: 145 },
  { mes: "mai", Alfa: 302, Beta: 244, Gama: 180 },
  { mes: "jun", Alfa: 366, Beta: 301, Gama: 224 },
  { mes: "jul", Alfa: 688, Beta: 542, Gama: 411 },
];

const SectionLabel = ({ children }: { children: ReactNode }) => (
  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
    {children}
  </p>
);

export default function DashboardMockup() {
  const ehDesktop = useEhDesktop();

  // Eixos e barras encolhem no mobile para os rótulos não se atropelarem.
  const alturaGrafico = ehDesktop ? 190 : 165;
  const fonteEixo = ehDesktop ? 11 : 9;
  const larguraEixoY = ehDesktop ? 46 : 34;

  return (
    <div className="dark w-full overflow-hidden rounded-2xl border border-border bg-background shadow-2xl shadow-black/60">
      {/* ── Navbar do app (design system §5.1) ── */}
      <div className="flex items-center justify-between gap-3 px-3 py-3 sm:px-4">
        <div className="flex h-11 items-center gap-2.5 rounded-full border border-border bg-card px-2.5 pr-4">
          <img
            src="/logo-metri-mark.png"
            alt=""
            className="h-7 w-7 rounded-full bg-white object-contain p-0.5"
          />
          <div className="leading-none">
            <p className="text-xs font-semibold text-foreground">Metri</p>
            <p className="mt-0.5 text-[9px] text-muted-foreground">Vendor Management System</p>
          </div>
        </div>

        {/* Navegação — item ativo é a pill invertida */}
        <div className="hidden h-11 items-center gap-1 rounded-full border border-border bg-card px-1.5 md:flex">
          {NAV.map((item, i) => (
            <span
              key={item}
              className={`flex h-8 items-center rounded-full px-3.5 text-[11px] ${
                i === 0
                  ? "bg-foreground font-medium text-background"
                  : "text-muted-foreground"
              }`}
            >
              {item}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
            <Moon className="h-3.5 w-3.5" />
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
            <Bell className="h-3.5 w-3.5" />
          </span>
          <span className="hidden h-9 items-center rounded-full bg-primary px-4 text-[11px] font-medium text-white sm:flex">
            Sair
          </span>
        </div>
      </div>

      {/* ── Conteúdo do dashboard ── */}
      <div className="space-y-5 px-3 pb-5 sm:px-4">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">
            Dashboard de Governança
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Gestão de Suprimentos TI</p>
        </div>

        {/* Visão financeira consolidada — grid bento: hero 2×2 + 6 cards + 1 wide */}
        <SectionLabel>Visão financeira consolidada</SectionLabel>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            variant="hero"
            className="sm:col-span-2 xl:row-span-2"
            label="Gasto TI estimado (ano)"
            value={brl.format(4812000)}
            hint="portfólio com contagem"
            footer={
              <div className="flex flex-wrap gap-2">
                <HeroChip>12 fornecedores</HeroChip>
                <HeroChip>5.868 PF</HeroChip>
              </div>
            }
          />
          <StatCard
            label="Valor médio R$/PF"
            value={brl.format(820)}
            hint="configuração vigente"
            tone="primary"
          />
          <StatCard
            label="Aderência contratual geral"
            value="94%"
            hint="propostas dentro da tolerância"
            tone="success"
            badge={{ label: "meta atingida", tone: "success", direction: "up" }}
          />
          <StatCard
            label="Total de PF no portfólio"
            value="5.868"
            hint="todos os projetos contados"
            tone="primary"
          />
          <StatCard
            label="Saving acumulado"
            value={brl.format(1284500)}
            hint="economia vs. estimativa"
            tone="success"
            badge={{ label: "economia", tone: "success", direction: "up" }}
          />
          <StatCard
            label="Propostas acima do contrato"
            value={3}
            hint="variação além da tolerância"
            tone="warning"
            badge={{ label: "atenção", tone: "destructive" }}
          />
          <StatCard
            label="Contratos a vencer (90d)"
            value={5}
            hint="renovação em análise"
            tone="destructive"
          />
          <StatCard
            className="sm:col-span-2"
            label="Metodologia padrão APF"
            value="NESMA"
            hint="mais usada no portfólio"
            tone="neutral"
          />
        </div>

        {/* Valor estimado e custo */}
        <SectionLabel>Valor estimado e custo</SectionLabel>
        <div className="grid gap-3 lg:grid-cols-2">
          <ChartCard
            title="Valor estimado por período"
            subtitle="Valor estimado dos projetos contados e acumulado (R$ mil)"
            chip="6 meses"
          >
            <ResponsiveContainer width="100%" height={alturaGrafico}>
              <ComposedChart data={SAVING_DATA}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={fonteEixo} />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={fonteEixo}
                  width={larguraEixoY}
                  tickFormatter={(v) => `R$${v}k`}
                />
                <Legend wrapperStyle={{ fontSize: fonteEixo }} />
                <Bar
                  dataKey="valor"
                  name="Estimado no mês"
                  fill={COLORS.ctrl}
                  radius={[4, 4, 0, 0]}
                  barSize={ehDesktop ? 22 : 14}
                  isAnimationActive={false}
                />
                <Line
                  dataKey="acumulado"
                  name="Acumulado"
                  stroke={COLORS.primary}
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Valor estimado mensal por fornecedor"
            subtitle="R$ mil, últimos 6 meses"
            chip="3 fornecedores"
          >
            <ResponsiveContainer width="100%" height={alturaGrafico}>
              <BarChart data={FORNECEDOR_DATA}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={fonteEixo} />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={fonteEixo}
                  width={larguraEixoY}
                  tickFormatter={(v) => `R$${v}k`}
                />
                <Legend wrapperStyle={{ fontSize: fonteEixo }} />
                <Bar dataKey="Alfa" stackId="a" fill={COLORS.primary} isAnimationActive={false} />
                <Bar dataKey="Beta" stackId="a" fill={COLORS.ctrl} isAnimationActive={false} />
                <Bar
                  dataKey="Gama"
                  stackId="a"
                  fill={COLORS.warning}
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
