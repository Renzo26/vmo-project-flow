import { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockProjects, statusLabels, statusColors } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle, Check, ArrowLeft, FileText, Calendar, User, Tag,
  Upload, X, Paperclip, RotateCcw, XCircle, SendHorizonal
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type Action = "enviar" | "recusar" | "revisao" | null;

const FornecedorProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = mockProjects.find(p => p.id === id);

  const [arquivo, setArquivo] = useState<File | null>(null);
  const [action, setAction] = useState<Action>(null);
  const [motivo, setMotivo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resultModal, setResultModal] = useState<"success" | "recusado" | "revisao" | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Projeto não encontrado.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/fornecedor/projetos")}>Voltar</Button>
      </div>
    );
  }

  const isActionable = project.status === "aguardando" || project.status === "corrigir";

  const handleFile = (file: File) => setArquivo(file);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleConfirm = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      if (action === "enviar") setResultModal("success");
      else if (action === "recusar") setResultModal("recusado");
      else if (action === "revisao") setResultModal("revisao");
    }, 1200);
  };

  const canConfirm = () => {
    if (action === "enviar") return !!arquivo;
    if (action === "recusar") return motivo.trim().length >= 10;
    if (action === "revisao") return motivo.trim().length >= 10;
    return false;
  };

  const actionLabel: Record<NonNullable<Action>, string> = {
    enviar: "Enviar Proposta",
    recusar: "Confirmar Recusa",
    revisao: "Solicitar Revisão",
  };

  const actionColor: Record<NonNullable<Action>, string> = {
    enviar: "bg-success hover:bg-success/90 text-success-foreground",
    recusar: "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
    revisao: "bg-warning hover:bg-warning/90 text-warning-foreground",
  };

  const selectAction = (a: Action) => {
    setAction(prev => prev === a ? null : a);
    setMotivo("");
  };

  return (
    <div>
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

        {/* Right: Proposta */}
        <div className="space-y-4">
          {isActionable ? (
            <div className="bg-card rounded-xl border border-border p-5 space-y-5">
              <div>
                <h3 className="font-bold text-foreground">
                  {project.status === "corrigir" ? "Corrigir Proposta" : "Elaborar Proposta"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">{project.type} · Metodologia Ágil</p>
              </div>

              {/* Upload zone */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Anexar proposta</p>
                {arquivo ? (
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/40">
                    <Paperclip className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm text-foreground flex-1 truncate">{arquivo.name}</span>
                    <button onClick={() => setArquivo(null)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                    onClick={() => fileRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={e => e.preventDefault()}
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">Arraste ou clique para anexar</p>
                    <p className="text-xs text-muted-foreground">PDF, DOCX ou XLSX</p>
                  </div>
                )}
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
              </div>

              {/* Conditional field */}
              {(action === "recusar" || action === "revisao") && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {action === "recusar" ? "Motivo da recusa" : "O que precisa ser revisado"}
                  </label>
                  <Textarea
                    value={motivo}
                    onChange={e => setMotivo(e.target.value)}
                    placeholder={action === "recusar" ? "Descreva o motivo pelo qual não é possível atender esta solicitação..." : "Descreva o que precisa ser alterado ou esclarecido..."}
                    className="min-h-[90px] text-sm"
                    autoFocus
                  />
                  {motivo.trim().length > 0 && motivo.trim().length < 10 && (
                    <p className="text-xs text-destructive">Mínimo de 10 caracteres</p>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col gap-2 pt-1">
                {action ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => { setAction(null); setMotivo(""); }}
                      disabled={submitting}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className={`flex-1 ${actionColor[action]}`}
                      onClick={handleConfirm}
                      disabled={!canConfirm() || submitting}
                    >
                      {submitting ? "Aguarde..." : actionLabel[action]}
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-success hover:bg-success/90 text-success-foreground gap-1.5"
                      onClick={() => selectAction("enviar")}
                    >
                      <SendHorizonal className="h-4 w-4" />
                      Enviar Proposta
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-warning/40 text-warning hover:bg-warning/10 gap-1.5"
                      onClick={() => selectAction("revisao")}
                    >
                      <RotateCcw className="h-4 w-4" />
                      Revisão
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10 gap-1.5"
                      onClick={() => selectAction("recusar")}
                    >
                      <XCircle className="h-4 w-4" />
                      Recusar
                    </Button>
                  </div>
                )}
              </div>

              {action === "enviar" && !arquivo && (
                <p className="text-xs text-muted-foreground text-center -mt-1">Anexe um arquivo para habilitar o envio</p>
              )}
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

      {/* Success modal */}
      <Dialog open={resultModal === "success"} onOpenChange={() => setResultModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-success">
              <Check className="h-5 w-5" /> Proposta enviada com sucesso!
            </DialogTitle>
            <DialogDescription>Sua proposta foi registrada e o solicitante será notificado para análise.</DialogDescription>
          </DialogHeader>
          <Button onClick={() => { setResultModal(null); navigate("/fornecedor/projetos"); }} className="w-full">Fechar</Button>
        </DialogContent>
      </Dialog>

      {/* Recusado modal */}
      <Dialog open={resultModal === "recusado"} onOpenChange={() => setResultModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" /> Proposta recusada
            </DialogTitle>
            <DialogDescription>O solicitante será notificado sobre a recusa e o motivo registrado.</DialogDescription>
          </DialogHeader>
          <Button variant="outline" onClick={() => { setResultModal(null); navigate("/fornecedor/projetos"); }} className="w-full">Fechar</Button>
        </DialogContent>
      </Dialog>

      {/* Revisão modal */}
      <Dialog open={resultModal === "revisao"} onOpenChange={() => setResultModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-warning">
              <RotateCcw className="h-5 w-5" /> Revisão solicitada
            </DialogTitle>
            <DialogDescription>Seu pedido de revisão foi enviado. O solicitante irá analisar e retornar com as correções.</DialogDescription>
          </DialogHeader>
          <Button variant="outline" onClick={() => { setResultModal(null); navigate("/fornecedor/projetos"); }} className="w-full">Fechar</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FornecedorProjectDetail;
