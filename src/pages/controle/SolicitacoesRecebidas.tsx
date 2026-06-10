import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { STATUS_COLORS, STATUS_LABELS, type SolicitacaoListItem, type SolicitacaoStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import EmptyState from "@/components/EmptyState";

type TabKey = "todas" | "aguardando" | "andamento" | "concluidas";

const filterMap: Record<TabKey, SolicitacaoStatus[]> = {
  todas: ["aguardando_controle", "rejeitada_controle", "aguardando_proposta", "proposta_enviada", "aceita", "recusada"],
  aguardando: ["aguardando_controle"],
  andamento: ["aguardando_proposta", "proposta_enviada"],
  concluidas: ["aceita", "recusada", "rejeitada_controle"],
};

const SolicitacoesRecebidas = () => {
  const [tab, setTab] = useState<TabKey>("todas");
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["solicitacoes", "controle"],
    queryFn: () => api.get<SolicitacaoListItem[]>("/solicitacoes"),
  });

  const lista = (data ?? []).filter(s => filterMap[tab].includes(s.status));

  const tabs: { key: TabKey; label: string }[] = [
    { key: "todas", label: "Todas" },
    { key: "aguardando", label: "Aguardando aval" },
    { key: "andamento", label: "Em andamento" },
    { key: "concluidas", label: "Concluídas" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Solicitações recebidas</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Analise as solicitações, dê o aval e direcione ao fornecedor.</p>
      </div>

      <div className="flex gap-1">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              tab === t.key ? "bg-ctrl text-ctrl-foreground" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Solicitação</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Solicitante</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fornecedor</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ação</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>
            )}
            {!isLoading && lista.map(s => (
              <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{s.titulo}</p>
                  <p className="text-xs text-muted-foreground">{s.numero} · {s.tipo_servico ?? "—"}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{s.solicitante_nome ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.fornecedor_nome ?? "—"}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={`text-xs ${STATUS_COLORS[s.status]}`}>{STATUS_LABELS[s.status]}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant={s.status === "aguardando_controle" ? "default" : "outline"} className="h-7 text-xs"
                    onClick={() => navigate(`/controle/solicitacoes/recebidas/${s.id}`)}>
                    {s.status === "aguardando_controle" ? "Analisar" : "Ver"}
                  </Button>
                </td>
              </tr>
            ))}
            {!isLoading && lista.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <EmptyState
                    title="Nenhuma solicitação recebida"
                    description="As solicitações enviadas pelos solicitantes aparecerão aqui para análise."
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

export default SolicitacoesRecebidas;
