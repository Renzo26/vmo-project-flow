import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockSuppliers } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Check, Upload, AlertTriangle, Code, Search, TestTube, Layers,
  GitBranch, Network, Server, ClipboardList, FileCode,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

const steps = ["Configuração", "Tipo de Serviço", "Detalhes e Escopo", "Classificação", "Fornecedor"];

const serviceTypes = [
  { id: "analise", label: "Análise e Levantamento", code: "ANA", icon: Search, badge: null },
  { id: "mapeamento", label: "Mapeamento de Processos", code: "MAP", icon: GitBranch, badge: null },
  { id: "arquitetura", label: "Arquitetura de Sistemas", code: "ARQ", icon: Network, badge: null },
  { id: "infra", label: "Infraestrutura", code: "INF", icon: Server, badge: null },
  { id: "pmo", label: "Gestão de Projetos e PMO", code: "PMO", icon: ClipboardList, badge: null },
  { id: "dev", label: "Desenvolvimento de Software", code: "DEV", icon: Code, badge: null },
  { id: "testes", label: "Testes e Qualidade", code: "TST", icon: TestTube, badge: null },
  { id: "ciclo", label: "Ciclo Completo", code: "CIC", icon: Layers, badge: "Inclui todas as fases" },
];

const devSubtypes = [
  "Novo desenvolvimento de sistema",
  "Manutenção evolutiva",
  "Manutenção corretiva / bug fix",
  "Manutenção adaptativa",
  "Integração de sistemas / APIs",
  "Migração de sistema legado",
  "Refatoração / modernização",
  "Aplicativo mobile (iOS/Android)",
  "Portal web / front-end",
  "RPA / Automação de processos",
  "Alocação de Recurso Especialista em Desenvolvimento de Software",
];

const pmoSubtypes = [
  "PMO — Escritório de projetos",
  "Gerente de projetos (tradicional / PMI)",
  "Gestão de mudanças (Change Management)",
  "Gestão de riscos",
  "Gestão de portfólio de projetos",
  "Planejamento de capacidade",
  "Consultor PMBOK / PRINCE2 / PMP",
  "Alocação de Recurso Especialista em Gestão de Projetos e PMO",
];

const seniorityLevels = ["Júnior", "Pleno", "Sênior"];

const methodologies = ["Ágil", "Waterfall", "Híbrida", "Kanban", "Outro"];

const initiativeTypes = ["Correção", "Estratégico", "Área", "Melhoria", "Inovação", "Regulatória"];

const NovaAnalise = () => {
  const [step, setStep] = useState(0);

  // Step 0 — Configuração inicial
  const [projectCode, setProjectCode] = useState("");
  const [costCenter, setCostCenter] = useState("");
  const [responsible, setResponsible] = useState("");

  const [serviceType, setServiceType] = useState("");
  const [subtype, setSubtype] = useState("");
  const [seniority, setSeniority] = useState("");
  const [methodology, setMethodology] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("5");
  const [finType, setFinType] = useState<"CAPEX" | "OPEX">("CAPEX");
  const [initiative, setInitiative] = useState("Correção");
  const [urgency, setUrgency] = useState<"normal" | "emergencial">("normal");
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const selectedService = serviceTypes.find(s => s.id === serviceType);
  const needsAttachment = (serviceType === "dev" || serviceType === "testes") && methodology === "Waterfall";

  const toggleSupplier = (id: string) => {
    setSelectedSuppliers(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const handleSubmit = () => {
    setShowModal(true);
  };

  const canAdvance = () => {
    if (step === 0) return projectCode.trim() && costCenter.trim() && responsible.trim();
    if (step === 1) return serviceType && methodology;
    return true;
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
        {/* Step 0 — Configuração */}
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">Configuração inicial</h2>
              <p className="text-sm text-muted-foreground mt-1">Identificação e responsáveis pelo projeto</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Código do projeto *</Label>
                <Input
                  value={projectCode}
                  onChange={e => setProjectCode(e.target.value)}
                  placeholder="Ex: PRJ-2024-001"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Centro de custo *</Label>
                <Input
                  value={costCenter}
                  onChange={e => setCostCenter(e.target.value)}
                  placeholder="Ex: CC-1042"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Responsável pelo projeto *</Label>
              <Input
                value={responsible}
                onChange={e => setResponsible(e.target.value)}
                placeholder="Nome do responsável"
                className="mt-1"
              />
            </div>

            <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <FileCode className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-foreground">
                Cada tipo de serviço possui um código próprio que será associado ao centro de custo informado.
              </p>
            </div>
          </div>
        )}

        {/* Step 1 — Tipo de Serviço */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-foreground">Qual o tipo de serviço a ser contratado?</h2>
            <div className="grid grid-cols-3 gap-3">
              {serviceTypes.map(st => (
                <button
                  key={st.id}
                  onClick={() => { setServiceType(st.id); setSubtype(""); setSeniority(""); }}
                  className={`relative p-4 rounded-xl border text-left transition-all ${
                    serviceType === st.id ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <st.icon className={`h-6 w-6 ${serviceType === st.id ? "text-primary" : "text-muted-foreground"}`} />
                    <Badge variant="outline" className="text-[9px] font-mono bg-muted/50">{st.code}</Badge>
                  </div>
                  <p className="text-sm font-medium text-foreground">{st.label}</p>
                  {st.badge && (
                    <Badge variant="outline" className="mt-2 text-[10px] bg-primary/10 text-primary border-primary/20">
                      {st.badge}
                    </Badge>
                  )}
                </button>
              ))}
            </div>

            {serviceType === "dev" && (
              <div className="rounded-xl border border-border p-4 bg-muted/20 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Desenvolvimento de Software — subtipos disponíveis</h3>
                  <p className="text-xs text-muted-foreground">Selecione o tipo de desenvolvimento</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {devSubtypes.map(s => (
                    <button
                      key={s}
                      onClick={() => setSubtype(s)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-sm transition-colors ${
                        subtype === s ? "border-primary bg-primary/5 text-foreground" : "border-border bg-background hover:border-primary/40 text-muted-foreground"
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${subtype === s ? "bg-primary" : "bg-muted-foreground/30"}`} />
                      <span className="flex-1">{s}</span>
                    </button>
                  ))}
                </div>
                <div>
                  <Label className="text-xs font-medium text-foreground mb-2 block">Nível de senioridade</Label>
                  <div className="flex gap-2">
                    {seniorityLevels.map(l => (
                      <button
                        key={l}
                        onClick={() => setSeniority(l)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          seniority === l ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {serviceType === "pmo" && (
              <div className="rounded-xl border border-border p-4 bg-muted/20 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Gestão de Projetos e PMO — subtipos disponíveis</h3>
                  <p className="text-xs text-muted-foreground">Selecione o serviço de gestão</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {pmoSubtypes.map(s => (
                    <button
                      key={s}
                      onClick={() => setSubtype(s)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-sm transition-colors ${
                        subtype === s ? "border-primary bg-primary/5 text-foreground" : "border-border bg-background hover:border-primary/40 text-muted-foreground"
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${subtype === s ? "bg-primary" : "bg-muted-foreground/30"}`} />
                      <span className="flex-1">{s}</span>
                    </button>
                  ))}
                </div>
                <div>
                  <Label className="text-xs font-medium text-foreground mb-2 block">Nível de senioridade</Label>
                  <div className="flex gap-2">
                    {seniorityLevels.map(l => (
                      <button
                        key={l}
                        onClick={() => setSeniority(l)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          seniority === l ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Metodologia</Label>
              <div className="flex gap-2 flex-wrap">
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

        {/* Step 2 — Detalhes */}
        {step === 2 && (
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

        {/* Step 3 — Classificação */}
        {step === 3 && (
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
              <div className="flex gap-2 flex-wrap">
                {initiativeTypes.map(i => (
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
          </div>
        )}

        {/* Step 4 — Fornecedor */}
        {step === 4 && (
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
              <p><span className="text-muted-foreground">Código projeto:</span> {projectCode || "—"}</p>
              <p><span className="text-muted-foreground">Centro de custo:</span> {costCenter || "—"}</p>
              <p><span className="text-muted-foreground">Responsável:</span> {responsible || "—"}</p>
              <p><span className="text-muted-foreground">Serviço:</span> {selectedService ? `${selectedService.code} · ${selectedService.label}` : "—"}</p>
              <p><span className="text-muted-foreground">Metodologia:</span> {methodology || "—"}</p>
              <p><span className="text-muted-foreground">Classificação:</span> {finType} · {initiative}</p>
              <p><span className="text-muted-foreground">Urgência:</span> {urgency === "emergencial" ? "Emergencial" : "Normal"}</p>
              <p><span className="text-muted-foreground">Prazo proposta:</span> {deadline} dias</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={() => step > 0 ? setStep(step - 1) : navigate("/solicitante/projetos")} className="text-sm">
            Voltar
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canAdvance()} className="text-sm">Próximo</Button>
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
