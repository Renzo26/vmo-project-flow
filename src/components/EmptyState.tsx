import { Inbox, LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  className?: string;
  /** Altura mínima da área. Útil para ocupar o espaço de um gráfico. */
  minHeight?: number;
}

/**
 * Estado vazio padrão do sistema — exibido quando ainda não há dados.
 * Usado em listas, tabelas e no lugar de gráficos sem informação.
 */
const EmptyState = ({
  icon: Icon = Inbox,
  title = "Nenhum dado ainda",
  description,
  className = "",
  minHeight,
}: EmptyStateProps) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center px-6 py-10 ${className}`}
      style={minHeight ? { minHeight } : undefined}
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
};

export default EmptyState;
