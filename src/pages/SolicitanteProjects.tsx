import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { STATUS_COLORS, STATUS_LABELS, type SolicitacaoListItem, type SolicitacaoStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import EmptyState from "@/components/EmptyState";

type FilterTab = "todos" | "pendentes" | "andamento" | "concluidos";

const filterMap: Record<FilterTab, SolicitacaoStatus[]> = {
  todos: ["aguardando_controle", "rejeitada_controle", "aguardando_proposta", "proposta_enviada", "aceita", "recusada"],
  pendentes: ["aguardando_controle", "proposta_enviada"],
  andamento: ["aguardando_proposta"],
  concluidos: ["aceita", "recusada", "rejeitada_controle"],
};

const SolicitanteProjects = () => {
  const [filter, setFilter] = useState<FilterTab>("todos");
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["solicitacoes", "solicitante"],
    queryFn: () => api.get<SolicitacaoListItem[]>("/solicitacoes"),
  });

  const filtered = (data ?? []).filter(p => filterMap[filter].includes(p.status));

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "todos", label: "Todos" },
    { key: "pendentes", label: "Requer atenção" },
    { key: "andamento", label: "Em andamento" },
    { key: "concluidos", label: "Concluídos" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Minhas Solicitações</h2>
        <Button onClick={() => navigate("/solicitante/nova-analise")} className="text-sm rounded-full">
          + Nova Solicitação
        </Button>
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
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fornecedor</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Ação</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin inline" />
                </td>
              </tr>
            )}
            {!isLoading && filtered.map(p => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{p.titulo}</p>
                  <p className="text-xs text-muted-foreground">{p.numero}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.tipo_servico ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.fornecedor_nome ?? "—"}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={`text-xs ${STATUS_COLORS[p.status]}`}>
                    {STATUS_LABELS[p.status]}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant={p.status === "proposta_enviada" ? "default" : "outline"} className="text-xs h-7" onClick={() => navigate(`/solicitante/projeto/${p.id}`)}>
                    {p.status === "proposta_enviada" ? "Avaliar" : "Ver"}
                  </Button>
                </td>
              </tr>
            ))}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <EmptyState
                    title="Nenhum projeto ainda"
                    description="Crie uma nova solicitação para começar a acompanhar seus projetos aqui."
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

export default SolicitanteProjects;
