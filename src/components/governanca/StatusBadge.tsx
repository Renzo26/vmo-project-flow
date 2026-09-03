const statusStyles: Record<string, string> = {
  conciliada: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  divergente: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  pendente: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  recebida: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

const dotStyles: Record<string, string> = {
  conciliada: "bg-green-500",
  divergente: "bg-amber-500",
  pendente: "bg-red-500",
  recebida: "bg-slate-400",
};

export function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[status] ?? "bg-muted text-muted-foreground"}`}
    >
      <span className={`size-1.5 rounded-full ${dotStyles[status] ?? "bg-muted-foreground"}`} />
      {label}
    </span>
  );
}
