import { useState } from "react";
import { mockProjects, statusLabels, statusColors, type ProjectStatus } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Check, X, Bell } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type FornFilter = "todos" | "aguardando" | "andamento" | "concluidos";

const filterMap: Record<FornFilter, ProjectStatus[]> = {
  todos: ["aguardando", "contratado", "corrigir", "concluido", "nao_iniciado"],
  aguardando: ["aguardando", "corrigir"],
  andamento: ["contratado", "nao_iniciado"],
  concluidos: ["concluido"],
};

interface ActivityRow {
  name: string;
  hours: number;
  rate: number;
}

const FornecedorProjects = () => {
  const [filter, setFilter] = useState<FornFilter>("todos");
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [activities, setActivities] = useState<ActivityRow[]>([
    { name: "Análise", hours: 0, rate: 160 },
    { name: "Codificação", hours: 0, rate: 200 },
    { name: "Testes", hours: 0, rate: 180 },
  ]);
  const [observation, setObservation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resultModal, setResultModal] = useState<"success" | "error" | null>(null);

  const filtered = mockProjects.filter(p => filterMap[filter].includes(p.status));
  const hasNew = mockProjects.some(p => p.status === "aguardando");

  const tabs: { key: FornFilter; label: string }[] = [
    { key: "todos", label: "Todos" },
    { key: "aguardando", label: "Aguardando mim" },
    { key: "andamento", label: "Em andamento" },
    { key: "concluidos", label: "Concluídos" },
  ];

  const updateHours = (index: number, hours: number) => {
    setActivities(prev => prev.map((a, i) => i === index ? { ...a, hours } : a));
  };

  const totalCost = activities.reduce((sum, a) => sum + a.hours * a.rate, 0);

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      // Simulate: if Codificação hours > 40, show error (exceeds contract)
      const codHours = activities.find(a => a.name === "Codificação")?.hours || 0;
      if (codHours > 40) {
        setResultModal("error");
      } else {
        setResultModal("success");
      }
    }, 1500);
  };

  const openProject = mockProjects.find(p => p.id === selectedProject);

  return (
    <div className="flex gap-6">
      {/* Left Column */}
      <div className={`${selectedProject ? "flex-[55]" : "flex-1"} min-w-0`}>
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
                <tr key={p.id} className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${selectedProject === p.id ? "bg-primary/5" : ""}`}>
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
                      <Button size="sm" className="text-xs h-7 bg-success hover:bg-success/90 text-success-foreground" onClick={() => setSelectedProject(p.id)}>Responder</Button>
                    )}
                    {p.status === "corrigir" && (
                      <Button size="sm" variant="destructive" className="text-xs h-7" onClick={() => setSelectedProject(p.id)}>Corrigir</Button>
                    )}
                    {(p.status !== "aguardando" && p.status !== "corrigir") && (
                      <Button size="sm" variant="outline" className="text-xs h-7">Ver</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Column - Response Panel */}
      {selectedProject && openProject && (
        <div className="flex-[45] min-w-0">
          <div className="bg-card rounded-xl border border-border p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-foreground">Responder Pedido #{openProject.id}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{openProject.type} · Metodologia Ágil</p>
              </div>
              <button onClick={() => setSelectedProject(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs">Atividade</th>
                    <th className="text-center px-3 py-2 font-medium text-muted-foreground text-xs">Horas</th>
                    <th className="text-right px-3 py-2 font-medium text-muted-foreground text-xs">Custo R$</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((a, i) => (
                    <tr key={a.name} className="border-b border-border last:border-0">
                      <td className="px-3 py-2 text-foreground">{a.name}</td>
                      <td className="px-3 py-2 text-center">
                        <Input
                          type="number"
                          min={0}
                          value={a.hours || ""}
                          onChange={e => updateHours(i, Number(e.target.value))}
                          className="w-20 h-7 text-center mx-auto text-sm"
                        />
                      </td>
                      <td className="px-3 py-2 text-right text-foreground font-medium">
                        {(a.hours * a.rate).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/30">
                    <td colSpan={2} className="px-3 py-2 font-bold text-foreground text-sm">Total</td>
                    <td className="px-3 py-2 text-right font-bold text-foreground text-sm">
                      {totalCost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex items-start gap-2 p-2.5 bg-warning/10 rounded-lg border border-warning/20">
              <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
              <p className="text-xs text-foreground">Os valores serão validados automaticamente conforme contrato vigente antes de enviar</p>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Observação / Justificativa</label>
              <Textarea value={observation} onChange={e => setObservation(e.target.value)} placeholder="Adicione uma observação..." className="min-h-[60px] text-sm" />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 text-sm border-warning/40 text-warning hover:bg-warning/10">
                Tenho uma dúvida
              </Button>
              <Button
                className="flex-1 text-sm bg-success hover:bg-success/90 text-success-foreground"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Enviando..." : "Enviar Proposta"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Result Modals */}
      <Dialog open={resultModal === "success"} onOpenChange={() => setResultModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-success">
              <Check className="h-5 w-5" /> Proposta enviada com sucesso!
            </DialogTitle>
            <DialogDescription>Sua proposta foi registrada e o solicitante será notificado.</DialogDescription>
          </DialogHeader>
          <Button onClick={() => { setResultModal(null); setSelectedProject(null); }} className="w-full">Fechar</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={resultModal === "error"} onOpenChange={() => setResultModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Proposta com pendências
            </DialogTitle>
            <DialogDescription>
              Valor de Codificação acima do contrato (R$200/h). Corrija antes de enviar.
            </DialogDescription>
          </DialogHeader>
          <Button variant="destructive" onClick={() => setResultModal(null)} className="w-full">Corrigir valores</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FornecedorProjects;
