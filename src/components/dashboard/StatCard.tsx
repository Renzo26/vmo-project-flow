import type { ReactNode } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatTone = "primary" | "success" | "warning" | "destructive" | "neutral";

export interface StatBadge {
  /** Texto curto do selo — ex.: "+15.7%", "requer ação". */
  label: string;
  tone?: StatTone;
  /** Seta de tendência opcional. */
  direction?: "up" | "down";
}

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  /** Cor semântica do indicador (ponto ao lado do rótulo). */
  tone?: StatTone;
  /** Selo pill exibido na base do card (tendência ou estado). */
  badge?: StatBadge;
  /** "hero" = card de destaque com gradiente da marca. */
  variant?: "default" | "hero";
  /** Conteúdo extra na base do card hero (chips, mini-stats). */
  footer?: ReactNode;
  className?: string;
}

const DOT: Record<StatTone, string> = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  neutral: "bg-muted-foreground/60",
};

const BADGE: Record<StatTone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  neutral: "bg-muted text-muted-foreground",
};

const Pill = ({ badge, hero }: { badge: StatBadge; hero?: boolean }) => (
  <span
    className={cn(
      "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold leading-4",
      hero ? "bg-black/10 text-current" : BADGE[badge.tone ?? "neutral"],
    )}
  >
    {badge.direction === "up" && <TrendingUp className="h-3 w-3" />}
    {badge.direction === "down" && <TrendingDown className="h-3 w-3" />}
    {badge.label}
  </span>
);

/** Chip para o rodapé do card hero. */
export const HeroChip = ({ children }: { children: ReactNode }) => (
  <span className="inline-flex items-center rounded-full bg-black/10 px-2.5 py-1 text-[11px] font-semibold">
    {children}
  </span>
);

/**
 * Card de indicador (KPI) do design system dos dashboards.
 * A variante "hero" destaca a métrica principal com o gradiente da marca.
 */
const StatCard = ({
  label,
  value,
  hint,
  tone = "neutral",
  badge,
  variant = "default",
  footer,
  className,
}: StatCardProps) => {
  if (variant === "hero") {
    return (
      <div
        className={cn(
          "stat-hero-gradient group relative flex flex-col overflow-hidden rounded-2xl p-6",
          "shadow-lg shadow-primary/20 transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/30",
          className,
        )}
      >
        {/* Brilhos decorativos */}
        <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-white/30 blur-3xl transition-transform duration-500 group-hover:scale-125" />
        <div className="pointer-events-none absolute -bottom-24 -left-12 h-56 w-56 rounded-full bg-black/10 blur-3xl" />

        <div className="relative flex items-center justify-between gap-2">
          <p className="text-sm font-medium opacity-80">{label}</p>
          {badge && <Pill badge={badge} hero />}
        </div>
        <p className="relative mt-4 font-display text-4xl font-bold tracking-tight tabular-nums xl:text-5xl">
          {value}
        </p>
        {hint && <p className="relative mt-2 text-xs font-medium opacity-70">{hint}</p>}
        {footer && <div className="relative mt-auto pt-6">{footer}</div>}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-sm",
        "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md",
        "dark:border-white/10 dark:bg-card/70 dark:backdrop-blur-xl",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", DOT[tone])} />
        <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      <p className="mt-3 font-display text-[1.7rem] font-bold leading-none tracking-tight text-foreground tabular-nums">
        {value}
      </p>
      <div className="mt-auto flex items-end justify-between gap-2 pt-3">
        <p className="text-[11px] text-muted-foreground">{hint}</p>
        {badge && <Pill badge={badge} />}
      </div>
    </div>
  );
};

export default StatCard;
