import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockSuppliers } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Check, Upload, AlertTriangle, Code, Search, TestTube, Briefcase, Layers, Puzzle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const steps = ["Tipo de Serviço", "Detalhes e Escopo", "Classificação", "Fornecedor"];

const serviceTypes = [
  { id: "dev", label: "Desenvolvimento de Software", icon: Code, badge: null },
  { id: "analise", label: "Análise e Levantamento", icon: Search, badge: null },
  { id: "testes", label: "Testes e Qualidade", icon: TestTube, badge: null },
  { id: "gestao", label: "Gestão de Projeto", icon: Briefcase, badge: null },
  { id: "ciclo", label: "Ciclo Completo", icon: Layers, badge: "Inclui todas as fases" },
  { id: "custom", label: "Customizar Atividades", icon: Puzzle, badge: "Você define as atividades" },
];

const methodologies = ["Ágil", "Waterfall", "Kanban", "Outro"];

const NovaAnalise = () => {
  const [step, setStep] = useState(0);
  const [serviceType, setServiceType] = useState("");
  const [methodology, setMethodology] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("5");
  const [finType, setFinType] = useState<"CAPEX" | "OPEX">("CAPEX");
  const [initiative, setInitiative] = useState("Melhoria");
  const [urgency, setUrgency] = useState<"normal" | "emergencial">("normal");
  const [projectName, setProjectName] = useState("");
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const needsAttachment = (serviceType === "dev" || serviceType === "testes") && methodology === "Waterfall";

  const toggleSupplier = (id: string) => {
    setSelectedSuppliers(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const handleSubmit = () => {
    setShowModal(true);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-3 ${i < step ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        {/* Step 1 */}
        {step === 0 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-foreground">Qual o tipo de serviço a ser contratado?</h2>
            <div className="grid grid-cols-3 gap-3">
              {serviceTypes.map(st => (
                <button
                  key={st.id}
                  onClick={() => setServiceType(st.id)}
                  className={`relative p-4 rounded-xl border text-left transition-all ${
                    serviceType === st.id ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:border-primary/40"
                  }`}
                >
                  <st.icon className={`h-6 w-6 mb-2 ${serviceType === st.id ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="text-sm font-medium text-foreground">{st.label}</p>
                  {st.badge && (
                    <Badge variant="outline" className={`mt-2 text-[10px] ${st.id === "custom" ? "bg-warning/15 text-warning border-warning/30" : "bg-primary/10 text-primary border-primary/20"}`}>
                      {st.badge}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Metodologia</Label>
              <div className="flex gap-2">
                {methodologies.map(m => (
                  <button
                    key={m}
                    onClick={() => setMethodology(m)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      methodology === m ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-foreground">Descreva o escopo</h2>
            <div>
              <Label>Descrição *</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descreva o escopo do projeto..." className="mt-1 min-h-[120px]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label>Anexos</Label>
                <Badge variant="outline" className={`text-[10px] ${needsAttachment ? "bg-destructive/15 text-destructive border-destructive/30" : "bg-muted text-muted-foreground"}`}>
                  {needsAttachment ? "Obrigatório para escopo fechado" : "Opcional"}
                </Badge>
              </div>
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/40 transition-colors cursor-pointer">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Arraste arquivos ou clique para enviar</p>
              </div>
            </div>
            <div>
              <Label className="mb-2 block">Prazo para proposta</Label>
              <div className="flex gap-2">
                {["3", "5", "7"].map(d => (
                  <button key={d} onClick={() => setDeadline(d)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    deadline === d ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {d} dias
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-foreground">Classificação da iniciativa</h2>
            <div>
              <Label className="mb-2 block">Tipo financeiro</Label>
              <div className="flex gap-2">
                {(["CAPEX", "OPEX"] as const).map(t => (
                  <button key={t} onClick={() => setFinType(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    finType === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <Label className="mb-2 block">Tipo de iniciativa</Label>
              <div className="flex gap-2">
                {["Melhoria", "Inovação", "Regulatória"].map(i => (
                  <button key={i} onClick={() => setInitiative(i)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    initiative === i ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>{i}</button>
                ))}
              </div>
            </div>
            <div>
              <Label className="mb-2 block">Urgência</Label>
              <div className="flex gap-2">
                {([["normal", "Prazo Normal"], ["emergencial", "Emergencial"]] as const).map(([k, l]) => (
                  <button key={k} onClick={() => setUrgency(k)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    urgency === k ? (k === "emergencial" ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground") : "bg-muted text-muted-foreground"
                  }`}>{l}</button>
                ))}
              </div>
              {urgency === "emergencial" && (
                <div className="flex items-start gap-2 mt-3 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                  <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-xs text-foreground">Requer justificativa e aprovação do gestor</p>
                </div>
              )}
            </div>
            <div>
              <Label>Nome do projeto *</Label>
              <Input value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="Ex: Módulo Relatórios RH" className="mt-1" />
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-foreground">Selecione os fornecedores</h2>
            <div className="grid grid-cols-3 gap-3">
              {mockSuppliers.map(s => (
                <button
                  key={s.id}
                  onClick={() => toggleSupplier(s.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedSuppliers.includes(s.id) ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:border-primary/40"
                  }`}
                >
                  <p className="font-medium text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">Homologado desde {s.since}</p>
                  {selectedSuppliers.includes(s.id) && <Check className="h-4 w-4 text-primary mt-2" />}
                </button>
              ))}
            </div>
            <div className="bg-muted/50 rounded-xl p-4 text-sm space-y-1">
              <h4 className="font-semibold text-foreground mb-2">Resumo do pedido</h4>
              <p><span className="text-muted-foreground">Serviço:</span> {serviceTypes.find(s => s.id === serviceType)?.label || "—"}</p>
              <p><span className="text-muted-foreground">Metodologia:</span> {methodology || "—"}</p>
              <p><span className="text-muted-foreground">Classificação:</span> {finType} · {initiative}</p>
              <p><span className="text-muted-foreground">Urgência:</span> {urgency === "emergencial" ? "Emergencial" : "Normal"}</p>
              <p><span className="text-muted-foreground">Projeto:</span> {projectName || "—"}</p>
              <p><span className="text-muted-foreground">Prazo proposta:</span> {deadline} dias</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={() => step > 0 ? setStep(step - 1) : navigate("/solicitante/projetos")} className="text-sm">
            Voltar
          </Button>
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)} className="text-sm">Próximo</Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-success hover:bg-success/90 text-success-foreground text-sm">
              Enviar Pedido
            </Button>
          )}
        </div>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-success">
              <Check className="h-5 w-5" /> Pedido enviado com sucesso!
            </DialogTitle>
            <DialogDescription>
              Protocolo: <span className="font-bold text-foreground">VMO-2024-043</span>
              <br />
              Seu pedido foi enviado aos fornecedores selecionados.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => { setShowModal(false); navigate("/solicitante/projetos"); }} className="w-full">
            Ver no Dashboard
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NovaAnalise;
