import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockProjects, statusLabels, statusColors, type ProjectStatus } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

type FornFilter = "todos" | "aguardando" | "andamento" | "concluidos";

const filterMap: Record<FornFilter, ProjectStatus[]> = {
  todos: ["aguardando", "contratado", "corrigir", "concluido", "nao_iniciado"],
  aguardando: ["aguardando", "corrigir"],
  andamento: ["contratado", "nao_iniciado"],
  concluidos: ["concluido"],
};

const FornecedorProjects = () => {
  const [filter, setFilter] = useState<FornFilter>("todos");
  const navigate = useNavigate();

  const filtered = mockProjects.filter(p => filterMap[filter].includes(p.status));
  const hasNew = mockProjects.some(p => p.status === "aguardando");

  const tabs: { key: FornFilter; label: string }[] = [
    { key: "todos", label: "Todos" },
    { key: "aguardando", label: "Aguardando mim" },
    { key: "andamento", label: "Em andamento" },
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
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.id}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.type}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={`text-xs ${statusColors[p.status]}`}>
                    {statusLabels[p.status]}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  {p.status === "aguardando" && (
                    <Button size="sm" className="text-xs h-7 bg-success hover:bg-success/90 text-success-foreground" onClick={() => navigate(`/fornecedor/projeto/${p.id}`)}>Responder</Button>
                  )}
                  {p.status === "corrigir" && (
                    <Button size="sm" variant="destructive" className="text-xs h-7" onClick={() => navigate(`/fornecedor/projeto/${p.id}`)}>Corrigir</Button>
                  )}
                  {(p.status !== "aguardando" && p.status !== "corrigir") && (
                    <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => navigate(`/fornecedor/projeto/${p.id}`)}>Ver</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FornecedorProjects;
