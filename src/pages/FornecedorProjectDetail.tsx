import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockProjects, statusLabels, statusColors } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Check, ArrowLeft, FileText, Calendar, User, Tag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ActivityRow {
  name: string;
  hours: number;
  rate: number;
}

const FornecedorProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = mockProjects.find(p => p.id === id);

  const [activities, setActivities] = useState<ActivityRow[]>([
    { name: "Análise", hours: 0, rate: 160 },
    { name: "Codificação", hours: 0, rate: 200 },
    { name: "Testes", hours: 0, rate: 180 },
  ]);
  const [observation, setObservation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resultModal, setResultModal] = useState<"success" | "error" | null>(null);

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Projeto não encontrado.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/fornecedor/projetos")}>Voltar</Button>
      </div>
    );
  }

  const isActionable = project.status === "aguardando" || project.status === "corrigir";

  const updateHours = (index: number, hours: number) => {
    setActivities(prev => prev.map((a, i) => i === index ? { ...a, hours } : a));
  };

  const totalCost = activities.reduce((sum, a) => sum + a.hours * a.rate, 0);

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      const codHours = activities.find(a => a.name === "Codificação")?.hours || 0;
      if (codHours > 40) {
        setResultModal("error");
      } else {
        setResultModal("success");
      }
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Button variant="ghost" className="mb-4 gap-2 text-muted-foreground hover:text-foreground" onClick={() => navigate("/fornecedor/projetos")}>
        <ArrowLeft className="h-4 w-4" /> Voltar aos Projetos
      </Button>

      {/* Header */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-foreground">{project.name}</h2>
              <Badge variant="outline" className={`text-xs ${statusColors[project.status]}`}>
                {statusLabels[project.status]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{project.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Tag className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tipo</p>
              <p className="text-sm font-medium text-foreground">{project.type}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Solicitante</p>
              <p className="text-sm font-medium text-foreground">Carlos Mendes</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Prazo proposta</p>
              <p className="text-sm font-medium text-foreground">5 dias úteis</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Classificação</p>
              <p className="text-sm font-medium text-foreground">{project.capex ? "CAPEX" : "OPEX"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left: Project Details */}
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-semibold text-foreground mb-3">Escopo do Projeto</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {project.type === "Desenvolvimento"
                ? "Desenvolvimento de módulo completo incluindo análise de requisitos, codificação, testes unitários e integração com sistemas existentes. O projeto deve seguir as diretrizes de arquitetura da empresa e padrões de qualidade estabelecidos."
                : project.type === "Ciclo Completo"
                ? "Projeto ciclo completo envolvendo todas as fases do desenvolvimento: levantamento de requisitos, análise, design, codificação, testes, homologação e deploy em produção."
                : "Execução de atividades conforme especificação técnica fornecida, incluindo documentação e entrega de artefatos definidos no escopo."}
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-semibold text-foreground mb-3">Metodologia</h3>
            <p className="text-sm text-muted-foreground">Ágil (Scrum) · Sprints de 2 semanas</p>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-semibold text-foreground mb-3">Histórico</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm text-foreground">Pedido criado pelo solicitante</p>
                  <p className="text-xs text-muted-foreground">10/04/2026 às 14:32</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-warning mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm text-foreground">Aguardando proposta do fornecedor</p>
                  <p className="text-xs text-muted-foreground">10/04/2026 às 14:32</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Response Form */}
        <div className="space-y-4">
          {isActionable ? (
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <h3 className="font-bold text-foreground">
                {project.status === "corrigir" ? "Corrigir Proposta" : "Elaborar Proposta"}
              </h3>
              <p className="text-xs text-muted-foreground">{project.type} · Metodologia Ágil</p>

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
                <Textarea value={observation} onChange={e => setObservation(e.target.value)} placeholder="Adicione uma observação..." className="min-h-[80px] text-sm" />
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
          ) : (
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-semibold text-foreground mb-3">Detalhes da Proposta</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Análise</span>
                  <span className="text-foreground font-medium">20h · R$ 3.200,00</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Codificação</span>
                  <span className="text-foreground font-medium">30h · R$ 6.000,00</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Testes</span>
                  <span className="text-foreground font-medium">15h · R$ 2.700,00</span>
                </div>
                <div className="flex justify-between py-2 font-bold">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">R$ 11.900,00</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Result Modals */}
      <Dialog open={resultModal === "success"} onOpenChange={() => setResultModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-success">
              <Check className="h-5 w-5" /> Proposta enviada com sucesso!
            </DialogTitle>
            <DialogDescription>Sua proposta foi registrada e o solicitante será notificado.</DialogDescription>
          </DialogHeader>
          <Button onClick={() => { setResultModal(null); navigate("/fornecedor/projetos"); }} className="w-full">Fechar</Button>
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

export default FornecedorProjectDetail;
