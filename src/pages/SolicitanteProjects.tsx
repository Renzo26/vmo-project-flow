import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockProjects, statusLabels, statusColors, type ProjectStatus } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type FilterTab = "todos" | "pendentes" | "andamento" | "concluidos" | "cancelados";

const filterMap: Record<FilterTab, ProjectStatus[]> = {
  todos: ["aguardando", "contratado", "corrigir", "concluido", "nao_iniciado", "cancelado"],
  pendentes: ["aguardando", "corrigir"],
  andamento: ["contratado", "nao_iniciado"],
  concluidos: ["concluido"],
  cancelados: ["cancelado"],
};

const SolicitanteProjects = () => {
  const [filter, setFilter] = useState<FilterTab>("todos");
  const [view, setView] = useState<"individual" | "equipe">("individual");
  const navigate = useNavigate();

  const filtered = mockProjects.filter(p => filterMap[filter].includes(p.status));

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "todos", label: "Todos" },
    { key: "pendentes", label: "Pendentes" },
    { key: "andamento", label: "Em andamento" },
    { key: "concluidos", label: "Concluídos" },
    { key: "cancelados", label: "Cancelados" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Meus Projetos</h2>
        <div className="flex bg-muted rounded-lg p-0.5">
          {(["individual", "equipe"] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                view === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {v === "individual" ? "Individual" : "Equipe"}
            </button>
          ))}
        </div>
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
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.id}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.type}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.supplier}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={`text-xs ${statusColors[p.status]}`}>
                    {statusLabels[p.status]}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant={p.status === "aguardando" || p.status === "corrigir" ? "default" : "outline"} className="text-xs h-7" onClick={() => navigate(`/solicitante/projeto/${p.id}`)}>
                    {p.status === "aguardando" || p.status === "corrigir" ? "Abrir" : "Ver"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SolicitanteProjects;
