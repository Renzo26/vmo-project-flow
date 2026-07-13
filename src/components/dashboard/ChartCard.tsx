import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  /** Selo pill à direita do cabeçalho — ex.: "6 meses", "12 projetos". */
  chip?: string;
  className?: string;
  children: ReactNode;
}

/** Card-contêiner de gráficos e tabelas dos dashboards. */
const ChartCard = ({ title, subtitle, chip, className, children }: ChartCardProps) => (
  <section
    className={cn(
      "rounded-2xl border border-border/70 bg-card p-6 shadow-sm",
      "dark:border-white/10 dark:bg-card/70 dark:backdrop-blur-xl",
      className,
    )}
  >
    <header className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {chip && (
        <span className="shrink-0 rounded-full bg-muted/80 px-3 py-1 text-[11px] font-medium text-muted-foreground">
          {chip}
        </span>
      )}
    </header>
    {children}
  </section>
);

/** Valor central de um gráfico donut (total + rótulo). */
export const DonutCenter = ({ value, label }: { value: ReactNode; label?: string }) => (
  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
    <p className="font-display text-xl font-bold tabular-nums text-foreground">{value}</p>
    {label && <p className="text-[11px] text-muted-foreground">{label}</p>}
  </div>
);

export default ChartCard;
