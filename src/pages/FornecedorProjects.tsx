import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { STATUS_COLORS, STATUS_LABELS, type SolicitacaoListItem, type SolicitacaoStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Loader2 } from "lucide-react";
import EmptyState from "@/components/EmptyState";

type FornFilter = "todos" | "aguardando" | "andamento" | "concluidos";

const FORN_STATUS_LABELS: Partial<Record<SolicitacaoStatus, string>> = {
  proposta_enviada: "Proposta Enviada",
  aguardando_proposta: "Aguardando Proposta",
};

const filterMap: Record<FornFilter, SolicitacaoStatus[]> = {
  todos: ["aguardando_proposta", "proposta_enviada", "aceita", "recusada"],
  aguardando: ["aguardando_proposta"],
  andamento: ["proposta_enviada"],
  concluidos: ["aceita", "recusada"],
};

const FornecedorProjects = () => {
  const [filter, setFilter] = useState<FornFilter>("todos");
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["solicitacoes", "fornecedor"],
    queryFn: () => api.get<SolicitacaoListItem[]>("/solicitacoes"),
  });

  const filtered = (data ?? []).filter(p => filterMap[filter].includes(p.status));
  const hasNew = (data ?? []).some(p => p.status === "aguardando_proposta");

  const tabs: { key: FornFilter; label: string }[] = [
    { key: "todos", label: "Todos" },
    { key: "aguardando", label: "Aguardando proposta" },
    { key: "andamento", label: "Proposta enviada" },
    { key: "concluidos", label: "Concluídos" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Projetos atribuídos a você</h2>
        {hasNew && (
          <Badge className="bg-destructive/15 text-destructive border-destructive/30 gap-1">
            <Bell className="h-3 w-3" /> Novo pedido recebido!
          </Badge>
        )}
      </div>

      <div className="flex gap-1 mb-4">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filter === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Projeto</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tipo</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Ação</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>
            )}
            {!isLoading && filtered.map(p => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{p.titulo}</p>
                  <p className="text-xs text-muted-foreground">{p.numero}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.tipo_servico ?? "—"}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={`text-xs ${STATUS_COLORS[p.status]}`}>{FORN_STATUS_LABELS[p.status] ?? STATUS_LABELS[p.status]}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant={p.status === "aguardando_proposta" ? "default" : "outline"} className="text-xs h-7"
                    onClick={() => navigate(`/fornecedor/projeto/${p.id}`)}>
                    {p.status === "aguardando_proposta" ? "Responder" : "Ver"}
                  </Button>
                </td>
              </tr>
            ))}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={4}>
                  <EmptyState
                    title="Nenhum projeto atribuído"
                    description="Quando a Governança direcionar um pedido a você, ele aparecerá aqui."
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FornecedorProjects;
