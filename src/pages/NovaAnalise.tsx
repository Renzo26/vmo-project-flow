import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import type { SolicitacaoDetail } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Check, Upload, AlertTriangle, Code, TestTube, Zap,
  ClipboardList, Wrench, Lock, BarChart3, Settings as SettingsIcon, Headphones, ShoppingCart,
  FileSpreadsheet, Download, FileText, Sparkles, Loader2, CheckCircle2, XCircle, Building2,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

const steps = ["Identificação", "Tipo de Serviço", "Detalhes e Escopo", "Classificação", "Padrão de Entrada PF", "Revisão"];

type PfMethodology = "apf" | "nesma" | "sfp";

const pfMethodologies: { id: PfMethodology; label: string; code: string; description: string; recommended?: boolean }[] = [
  { id: "sfp", label: "SFP — Simple Function Point", code: "SFP", description: "Recomendado pela equipe: fácil de medir comparado ao PF clássico do IFPUG.", recommended: true },
  { id: "nesma", label: "NESMA Estimada", code: "NESMA", description: "Contagem estimada baseada em requisitos ou histórias do repositório." },
  { id: "apf", label: "APF IFPUG (Detalhada)", code: "APF", description: "Contagem detalhada de pontos de função com DER e ALR/RLR." },
];

interface PfFieldResult {
  campo: string;
  preenchido: boolean;
  valor: string | null;
  observacao: string | null;
}

interface PfAnalysisResult {
  metodologia: PfMethodology;
  aba: string;
  arquivo: string;
  total_campos: number;
  total_preenchidos: number;
  total_pendentes: number;
  completo: boolean;
  campos: PfFieldResult[];
  pendentes: string[];
  resumo: string | null;
}

const pfRequiredFields = [
  "Código Projeto/Iniciativa",
  "Nome do Projeto/Iniciativa",
  "Aplicação/Sistema",
  "Código da funcionalidade/serviço",
  "Nome da funcionalidade/serviço",
  "Comportamento atual",
  "Melhoria proposta",
  "Comportamento esperado após a melhoria",
  "Medição para contratação? (Sim/Não)",
  "Entidades de dados acionadas antes da melhoria",
  "Entidades de dados acionadas após a melhoria",
  "Layout de campos da funcionalidade/serviço (antes e após)",
  "Possui entidade de dados nova ou alterada em razão da funcionalidade?",
  "Entidade de dados alterada é mantida nesta aplicação ou é externa?",
  "Nome e layout das entidades de dados criadas/alteradas pela funcionalidade",
];

const serviceTypes = [
  { id: "dev", label: "Desenvolvimento de Software", description: "Novos sistemas, manutenção, APIs, mobile, web e automação", code: "DEV", icon: Code, badge: null },
  { id: "qa", label: "QA e Testes", description: "Testes funcionais, automação, performance, segurança e UAT", code: "QA", icon: TestTube, badge: null },
  { id: "agilidade", label: "Agilidade & Produto", description: "Scrum Master, PO, Agile Coach, RTE, OKR Coach e transformação ágil organizacional", code: "AGL", icon: Zap, badge: null },
  { id: "pmo", label: "Gestão de Projetos e PMO", description: "PMO, gerente de projetos, gestão de mudanças e portfólio", code: "PMO", icon: ClipboardList, badge: null },
  { id: "infra", label: "Infraestrutura e Cloud", description: "Cloud, redes, servidores, DevOps, monitoramento e sustentação", code: "INF", icon: Wrench, badge: null },
  { id: "seguranca", label: "Segurança da Informação", description: "Pentest, SOC, LGPD, IAM, arquitetura de segurança e resposta a incidentes", code: "SEG", icon: Lock, badge: null },
  { id: "dados", label: "Dados e Analytics", description: "BI, Data Warehouse, engenharia de dados, ML e governança", code: "DAD", icon: BarChart3, badge: null },
  { id: "suporte", label: "Suporte e Service Desk", description: "N1, N2, N3, Help Desk, ITSM, outsourcing e field support", code: "SUP", icon: Headphones, badge: null },
  { id: "processos", label: "Processos e Consultoria", description: "BPM, ERP, arquitetura de soluções, transformação digital e análise de negócios", code: "PRC", icon: SettingsIcon, badge: null },
  { id: "aquisicao", label: "Aquisição de Sistema Novo", description: "Licenciamento de software, implantação de ERP e aquisição de novos sistemas", code: "AQS", icon: ShoppingCart, badge: null },
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

const qaSubtypes = [
  "Testes funcionais (manual)",
  "Automação de testes (Selenium / Cypress / Playwright)",
  "Testes de regressão",
  "Testes de performance e carga (JMeter / k6)",
  "Testes de segurança / Pentest",
  "Testes de API (Postman / Karate)",
  "Testes de aceitação do usuário (UAT)",
  "Testes mobile (iOS / Android)",
  "Fábrica de testes",
  "Consultoria de qualidade / Estratégia QA",
  "Alocação de Recurso Especialista em QA e Testes",
];

const agilidadeSubtypes = [
  "Scrum Master",
  "Product Owner (PO)",
  "Agile Coach",
  "RTE — Release Train Engineer (SAFe)",
  "Chapter Lead / Tech Lead",
  "Business Agility Consultant",
  "OKR Coach",
  "Kanban Lead / Facilitador",
  "Facilitador de cerimônias ágeis",
  "Transformação ágil organizacional",
  "Alocação de Recurso Especialista em Agilidade & Produto",
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

const infraSubtypes = [
  "Cloud computing (AWS / Azure / GCP)",
  "Migração para nuvem",
  "Administração de redes",
  "Servidores e datacenter",
  "Backup e recuperação de desastres (DR)",
  "Monitoramento e observabilidade",
  "DevOps / CI-CD / Pipeline",
  "Virtualização e containerização",
  "Sustentação de infraestrutura",
  "Compra de Equipamentos",
  "Uso de Equipamentos (Leasing)",
  "Alocação de Recurso Especialista em Infraestrutura e Cloud",
];

const aquisicaoSubtypes = [
  "Sistema Novo",
  "Licença de Software",
  "Implantação de ERP",
];

const segurancaSubtypes = [
  "Pentest / Teste de invasão",
  "Análise de vulnerabilidades",
  "SOC — Monitoramento contínuo de segurança",
  "Adequação LGPD",
  "Gestão de identidade e acesso (IAM)",
  "Arquitetura de segurança",
  "Resposta a incidentes (IR)",
  "Security awareness / Treinamento corporativo",
  "Alocação de Recurso Especialista em Segurança da Informação",
];

const dadosSubtypes = [
  "Business Intelligence (BI)",
  "Engenharia de dados / Data pipeline",
  "Data Warehouse / Data Lake",
  "Dashboards e relatórios gerenciais",
  "Ciência de dados / Machine Learning",
  "ETL / Integração de dados",
  "Governança de dados",
  "Alocação de Recurso Especialista em Dados e Analytics",
];

const suporteSubtypes = [
  "Suporte N1 — Usuário final",
  "Suporte N2 — Sistemas e aplicações",
  "Suporte N3 — Especialista técnico",
  "Help Desk / ITSM",
  "Field support / suporte presencial",
  "Outsourcing de TI",
  "Alocação de Recurso Especialista em Suporte e Service Desk",
];

const processosSubtypes = [
  "Mapeamento de processos (BPM)",
  "Implantação de ERP (SAP / TOTVS)",
  "Consultoria estratégica de TI",
  "Arquitetura de soluções",
  "Levantamento de requisitos / Análise de negócios (BA)",
  "Transformação digital",
  "Alocação de Recurso Especialista em Processos e Consultoria",
];

const subtypeMap: Record<string, { label: string; subtitle: string; items: string[] } | undefined> = {
  dev: { label: "Desenvolvimento de Software — subtipos disponíveis", subtitle: "Selecione o tipo de desenvolvimento", items: devSubtypes },
  qa: { label: "QA e Testes — subtipos disponíveis", subtitle: "Selecione o tipo de serviço de qualidade", items: qaSubtypes },
  agilidade: { label: "Agilidade & Produto — subtipos disponíveis", subtitle: "Selecione o papel ágil ou serviço de transformação", items: agilidadeSubtypes },
  pmo: { label: "Gestão de Projetos e PMO — subtipos disponíveis", subtitle: "Selecione o serviço de gestão", items: pmoSubtypes },
  infra: { label: "Infraestrutura e Cloud — subtipos disponíveis", subtitle: "Selecione o serviço de infraestrutura", items: infraSubtypes },
  seguranca: { label: "Segurança da Informação — subtipos disponíveis", subtitle: "Selecione o serviço de segurança", items: segurancaSubtypes },
  dados: { label: "Dados e Analytics — subtipos disponíveis", subtitle: "Selecione o serviço de dados", items: dadosSubtypes },
  suporte: { label: "Suporte e Service Desk — subtipos disponíveis", subtitle: "Selecione o tipo de suporte", items: suporteSubtypes },
  processos: { label: "Processos e Consultoria — subtipos disponíveis", subtitle: "Selecione o tipo de consultoria", items: processosSubtypes },
  aquisicao: { label: "Aquisição de Sistema Novo — subtipos disponíveis", subtitle: "Selecione o tipo de aquisição", items: aquisicaoSubtypes },
};

const seniorityLevels = ["Júnior", "Pleno", "Sênior"];

const methodologies = ["Ágil", "Waterfall", "Híbrida", "Kanban", "SAFe", "Outro"];

const initiativeTypes = ["Correção", "Estratégico", "Área", "Melhoria", "Inovação", "Regulatória"];

const priorityOptions = ["Baixa", "Normal", "Alta", "Crítica"];
const projectCategories = ["Estratégico", "De área / departamento", "Legal / Compliance", "Infraestrutura", "Melhoria operacional"];
const complexityLevels = ["Baixa", "Média", "Alta"];
const environmentOptions = ["Produção", "Homologação", "Desenvolvimento", "Múltiplos ambientes"];
const contractModalities = ["Ponto de Função (PF)", "Hora trabalhada (H/H)", "Escopo fechado", "Sprint / iteração", "Mensalidade (alocação)"];
const enabledSuppliers = ["Selecionar automaticamente por tipo de serviço", "TechSoft Ltda", "DevBrasil S.A.", "InfoSystems ME", "Soluções Corp"];

const NovaAnalise = () => {
  const [step, setStep] = useState(0);

  // Step 0 — Identificação (Bloco 1, 2, 3)
  // Bloco 1 — Identificação da solicitação
  const [projectTitle, setProjectTitle] = useState("");
  const requestNumber = "VMO-2024-043";
  const [requestArea, setRequestArea] = useState("");
  const [requestResponsible, setRequestResponsible] = useState("Carlos Mendes");
  const requestDate = new Date().toLocaleDateString("pt-BR");
  const [priority, setPriority] = useState("Normal");
  const [projectCategory, setProjectCategory] = useState("");

  // Bloco 2 — Escopo e detalhamento
  const [scopeDescription, setScopeDescription] = useState("");
  const [impactedSystems, setImpactedSystems] = useState("");
  const [expectedDeliverables, setExpectedDeliverables] = useState("");
  const [complexity, setComplexity] = useState("Média");
  const [environment, setEnvironment] = useState("Produção");

  // Bloco 3 — Fornecedor e prazo
  const [deliveryDeadline, setDeliveryDeadline] = useState("");
  const [supplierResponseDeadline, setSupplierResponseDeadline] = useState("");
  const [contractModality, setContractModality] = useState("Ponto de Função (PF)");
  const [enabledSupplier, setEnabledSupplier] = useState("Selecionar automaticamente por tipo de serviço");
  const [supplierObservations, setSupplierObservations] = useState("");

  const [serviceType, setServiceType] = useState("");
  const [subtype, setSubtype] = useState("");
  const [seniority, setSeniority] = useState("");
  const [methodology, setMethodology] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("5");
  const [finType, setFinType] = useState<"CAPEX" | "OPEX">("CAPEX");
  const [initiative, setInitiative] = useState("Correção");
  const [urgency, setUrgency] = useState<"normal" | "emergencial">("normal");
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [pfMethodology, setPfMethodology] = useState<PfMethodology>("sfp");
  const [pfAttachments, setPfAttachments] = useState<File[]>([]);
  const [pfRepositoryUrl, setPfRepositoryUrl] = useState("");
  const [pfCutoffDate, setPfCutoffDate] = useState("");
  const [pfObservations, setPfObservations] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [pfAnalyzing, setPfAnalyzing] = useState(false);
  const [pfAnalysis, setPfAnalysis] = useState<PfAnalysisResult | null>(null);
  const [pfError, setPfError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [justificativaFornecedor, setJustificativaFornecedor] = useState("");
  const [docAprovacao, setDocAprovacao] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdNumero, setCreatedNumero] = useState<string>("");
  const navigate = useNavigate();

  const { data: fornecedoresList, isLoading: fornLoading, isError: fornError } = useQuery<{ id: string; nome: string }[]>({
    queryKey: ["fornecedores-lista"],
    queryFn: () => api.get("/fornecedores/lista"),
    enabled: step === 5,
    retry: 1,
  });

  const selectedService = serviceTypes.find(s => s.id === serviceType);
  const currentSubtypePanel = subtypeMap[serviceType];
  const needsAttachment = (serviceType === "dev" || serviceType === "qa") && methodology.includes("Waterfall");

  const toggleMethodology = (m: string) => {
    setMethodology(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  const toggleSupplier = (id: string) => {
    setSelectedSuppliers(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (pfAttachments.length === 0) {
      setSubmitError("Anexe o modelo Excel preenchido na etapa Padrão de Entrada PF antes de enviar.");
      setStep(4);
      return;
    }
    if (selectedSuppliers.length < 3) {
      if (!justificativaFornecedor.trim()) {
        setSubmitError("Com menos de 3 fornecedores selecionados, a justificativa é obrigatória.");
        return;
      }
      if (!docAprovacao) {
        setSubmitError("Com menos de 3 fornecedores selecionados, anexe o documento de aprovação do superior.");
        return;
      }
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const fd = new FormData();
      fd.append("titulo", projectTitle);
      fd.append("area", requestArea);
      fd.append("prioridade", priority);
      fd.append("categoria", projectCategory);
      fd.append("descricao", scopeDescription);
      fd.append("sistemas_impactados", impactedSystems);
      fd.append("entregaveis", expectedDeliverables);
      fd.append("complexidade", complexity);
      fd.append("ambiente", environment);
      fd.append("prazo_entrega", deliveryDeadline);
      fd.append("prazo_resposta", supplierResponseDeadline);
      fd.append("modalidade", contractModality);
      fd.append("tipo_servico", selectedService ? selectedService.label : "");
      fd.append("subtipo", subtype);
      fd.append("senioridade", seniority);
      fd.append("fin_type", finType);
      fd.append("iniciativa", initiative);
      fd.append("urgencia", urgency);
      fd.append("metodologia_pf", pfMethodology);
      fd.append(
        "form_json",
        JSON.stringify({
          responsavel: requestResponsible,
          metodologia_servico: methodology,
          observacoes_fornecedor: supplierObservations,
          repositorio_url: pfRepositoryUrl,
          data_corte: pfCutoffDate,
          observacoes_pf: pfObservations,
          fornecedores_indicados: selectedSuppliers,
          ...(justificativaFornecedor.trim() && { justificativa_fornecedores: justificativaFornecedor }),
        }),
      );
      fd.append("arquivo", pfAttachments[0]);
      if (docAprovacao) fd.append("doc_aprovacao", docAprovacao);
      // Reaproveita a pré-análise da IA para o controle ver o MESMO resultado.
      if (pfAnalysis) fd.append("analise_json", JSON.stringify(pfAnalysis));

      const res = await api.upload<SolicitacaoDetail>("/solicitacoes", fd);
      setCreatedNumero(res.numero);
      setShowModal(true);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Falha ao enviar a solicitação.");
    } finally {
      setSubmitting(false);
    }
  };

  const canAdvance = () => {
    if (step === 0) return !!(projectTitle.trim() && requestArea.trim() && requestResponsible.trim());
    if (step === 1) {
      if (!serviceType || methodology.length === 0) return false;
      if (currentSubtypePanel && !subtype) return false;
      if (subtype.startsWith("Alocação de Recurso Especialista") && !seniority) return false;
      return true;
    }
    if (step === 2) return scopeDescription.trim() && deliveryDeadline;
    if (step === 4) return pfMethodology && (pfAttachments.length > 0 || pfRepositoryUrl.trim());
    return true;
  };

  const handlePfFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setPfAnalysis(null);
    setPfError(null);
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setPfAttachments([]);
      setPfError("Envie apenas o modelo Excel (.xlsx). Baixe o modelo em \"Baixar modelo\", preencha e anexe.");
      return;
    }
    setPfAttachments([file]);
  };

  const removePfAttachment = (idx: number) => {
    setPfAttachments(prev => prev.filter((_, i) => i !== idx));
    setPfAnalysis(null);
  };

  const analyzePfDocument = async () => {
    if (pfAttachments.length === 0) return;
    setPfAnalyzing(true);
    setPfError(null);
    setPfAnalysis(null);
    try {
      const formData = new FormData();
      formData.append("metodologia", pfMethodology);
      formData.append("arquivo", pfAttachments[0]);
      const res = await fetch("/api/entrada-pf/analisar", { method: "POST", body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail || `Erro ${res.status} ao analisar o documento.`);
      }
      const data: PfAnalysisResult = await res.json();
      setPfAnalysis(data);
    } catch (err) {
      setPfError(err instanceof Error ? err.message : "Falha ao analisar o documento.");
    } finally {
      setPfAnalyzing(false);
    }
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
          <div className="space-y-8">
            {/* Bloco 1 — Identificação da solicitação */}
            <section className="space-y-4">
              <div className="border-b border-border pb-2">
                <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Bloco 1 — Identificação da solicitação</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label>Título do projeto *</Label>
                  <Input value={projectTitle} onChange={e => setProjectTitle(e.target.value)} placeholder="Ex: Sistema de controle de estoque mobile" className="mt-1" />
                </div>
                <div>
                  <Label>Número da solicitação</Label>
                  <Input value={requestNumber} disabled className="mt-1 bg-muted/50" />
                  <p className="text-[11px] text-muted-foreground mt-1">Gerado automaticamente pelo sistema</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Área solicitante *</Label>
                  <Input value={requestArea} onChange={e => setRequestArea(e.target.value)} placeholder="Ex: Logística e Operações" className="mt-1" />
                </div>
                <div>
                  <Label>Solicitante responsável *</Label>
                  <Input value={requestResponsible} onChange={e => setRequestResponsible(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Data da solicitação</Label>
                  <Input value={requestDate} disabled className="mt-1 bg-muted/50" />
                  <p className="text-[11px] text-muted-foreground mt-1">Preenchida automaticamente</p>
                </div>
              </div>
            </section>

          </div>
        )}

        {/* Step 1 — Tipo de Serviço */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-foreground">Qual o tipo de serviço a ser contratado?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                  {st.description && (
                    <p className="text-xs text-muted-foreground mt-1 leading-snug">{st.description}</p>
                  )}
                  {st.badge && (
                    <Badge variant="outline" className="mt-2 text-[10px] bg-primary/10 text-primary border-primary/20">
                      {st.badge}
                    </Badge>
                  )}
                </button>
              ))}
            </div>

            {currentSubtypePanel && (
              <div className="rounded-xl border border-border p-4 bg-muted/20 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground">{currentSubtypePanel.label}</h3>
                  <p className="text-xs text-muted-foreground">{currentSubtypePanel.subtitle}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {currentSubtypePanel.items.map(s => (
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
                {subtype.startsWith("Alocação de Recurso Especialista") && (
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
                )}
              </div>
            )}

            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">
                Metodologia <span className="text-xs text-muted-foreground font-normal">(selecione uma ou mais)</span>
              </Label>
              <div className="flex gap-2 flex-wrap">
                {methodologies.map(m => (
                  <button
                    key={m}
                    onClick={() => toggleMethodology(m)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      methodology.includes(m) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
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
          <div className="space-y-8">
            {/* Bloco 2 — Escopo e detalhamento */}
            <section className="space-y-4">
              <div className="border-b border-border pb-2">
                <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Bloco 2 — Escopo e detalhamento</h3>
              </div>
              <div>
                <Label>Descrição / escopo do serviço *</Label>
                <Textarea
                  value={scopeDescription}
                  onChange={e => setScopeDescription(e.target.value)}
                  placeholder="Descreva os objetivos, sistemas impactados e entregáveis esperados..."
                  className="mt-1 min-h-[100px]"
                />
                <p className="text-[11px] text-muted-foreground mt-1">A planilha de escopo detalhado deverá ser anexada ao final deste formulário</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Sistemas impactados / integrações</Label>
                  <Input value={impactedSystems} onChange={e => setImpactedSystems(e.target.value)} placeholder="Ex: ERP Totvs, CRM Salesforce, Portal RH" className="mt-1" />
                </div>
                <div>
                  <Label>Entregáveis esperados</Label>
                  <Input value={expectedDeliverables} onChange={e => setExpectedDeliverables(e.target.value)} placeholder="Ex: Código-fonte, documentação técnica, treinamento" className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Nível de complexidade</Label>
                <select value={complexity} onChange={e => setComplexity(e.target.value)} className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  {complexityLevels.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label>Planilhas (anexar) *</Label>
                  <Badge variant="outline" className="text-[10px] bg-destructive/15 text-destructive border-destructive/30">
                    Obrigatório
                  </Badge>
                </div>
                <label className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/40 transition-colors cursor-pointer flex flex-col items-center">
                  <input type="file" multiple className="hidden" />
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Arraste arquivos ou clique para enviar</p>
                </label>
              </div>
            </section>

            {/* Bloco 3 — Fornecedor e prazo */}
            <section className="space-y-4">
              <div className="border-b border-border pb-2">
                <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Bloco 3 — Fornecedor e prazo</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Prazo desejado de entrega * <span className="font-normal text-muted-foreground text-[11px]">(data prevista de entrega do projeto)</span></Label>
                  <Input type="date" value={deliveryDeadline} onChange={e => setDeliveryDeadline(e.target.value)} className="mt-1" min={new Date().toISOString().split("T")[0]} />
                </div>
                <div>
                  <Label>Prazo para resposta dos fornecedores</Label>
                  <Input type="date" value={supplierResponseDeadline} onChange={e => setSupplierResponseDeadline(e.target.value)} className="mt-1" />
                  <p className="text-[11px] text-muted-foreground mt-1">Padrão: 5 dias úteis configurado pelo sistema</p>
                </div>
                <div>
                  <Label>Modalidade de contratação</Label>
                  <select value={contractModality} onChange={e => setContractModality(e.target.value)} className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    {contractModalities.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <Label>Outros documentos</Label>
                <Input type="file" className="mt-1" />
              </div>
              <div>
                <Label>Observações para o fornecedor</Label>
                <Textarea
                  value={supplierObservations}
                  onChange={e => setSupplierObservations(e.target.value)}
                  placeholder="Informações adicionais, restrições técnicas, preferências de tecnologia..."
                  className="mt-1 min-h-[80px]"
                />
              </div>
            </section>
          </div>
        )}

        {/* Step 3 — Classificação */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-foreground">Classificação da iniciativa</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Prioridade *</Label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                  className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {priorityOptions.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <Label>Categoria do projeto *</Label>
                <select
                  value={projectCategory}
                  onChange={e => setProjectCategory(e.target.value)}
                  className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Selecione...</option>
                  {projectCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <p className="text-[11px] text-muted-foreground mt-1">Alimenta o scorecard de fornecedores e os gráficos do Controle Econômico</p>
              </div>
            </div>
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
          </div>
        )}

        {/* Step 4 — Padrão de Entrada PF */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                Padrão de Entrada PF
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Selecione a metodologia de contagem, baixe o modelo <span className="font-medium text-foreground">Padrão de Entrada PF.xlsx</span>, preencha a aba correspondente e anexe o arquivo Excel para a análise.
              </p>
            </div>

            <div>
              <Label className="mb-2 block">Métrica de contagem *</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {pfMethodologies.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPfMethodology(m.id)}
                    className={`relative p-4 rounded-xl border text-left transition-all ${
                      pfMethodology === m.id ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="text-[9px] font-mono bg-muted/50">{m.code}</Badge>
                      {m.recommended && (
                        <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">Recomendado</Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium text-foreground">{m.label}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-snug">{m.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Campos obrigatórios do documento
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Estes são os campos esperados na aba <span className="font-medium text-foreground">{pfMethodologies.find(m => m.id === pfMethodology)?.code}</span> da planilha modelo.
                  </p>
                </div>
                <a
                  href="/Documentos_regras/Padrão de Entrada PF.xlsx"
                  download
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-background hover:border-primary/40 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Baixar modelo
                </a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                {pfRequiredFields.map(f => (
                  <div key={f} className="flex items-start gap-2 text-xs text-foreground">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                    <span className="leading-snug">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label>Anexar modelo Excel preenchido (.xlsx) *</Label>
                <Badge variant="outline" className="text-[10px] bg-destructive/15 text-destructive border-destructive/30">Obrigatório</Badge>
              </div>
              <label
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer flex flex-col items-center ${
                  isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                }`}
                onDrop={e => { e.preventDefault(); setIsDragging(false); handlePfFiles(e.dataTransfer.files); }}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
              >
                <input
                  type="file"
                  accept=".xlsx"
                  className="hidden"
                  onChange={e => handlePfFiles(e.target.files)}
                />
                <Upload className={`h-8 w-8 mb-2 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                <p className="text-sm text-muted-foreground">Arraste o modelo preenchido aqui</p>
                <p className="text-[11px] text-muted-foreground mt-1">ou clique para selecionar · apenas .xlsx</p>
              </label>
              {pfAttachments.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {pfAttachments.map((f, i) => (
                    <li key={`${f.name}-${i}`} className="flex items-center justify-between text-xs px-3 py-2 rounded-lg border border-border bg-background">
                      <span className="flex items-center gap-2 text-foreground truncate">
                        <FileSpreadsheet className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate">{f.name}</span>
                        <span className="text-muted-foreground shrink-0">({(f.size / 1024).toFixed(1)} KB)</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => removePfAttachment(i)}
                        className="text-muted-foreground hover:text-destructive ml-2 shrink-0"
                      >
                        Remover
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {pfAttachments.length > 0 && (
                <div className="mt-3">
                  <Button
                    type="button"
                    onClick={analyzePfDocument}
                    disabled={pfAnalyzing}
                    className="text-sm"
                  >
                    {pfAnalyzing ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analisando documento...</>
                    ) : (
                      <><Sparkles className="h-4 w-4 mr-2" /> Analisar documento com IA</>
                    )}
                  </Button>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    A IA organiza as informações do documento e verifica os campos exigidos pela metodologia <span className="font-medium text-foreground">{pfMethodologies.find(m => m.id === pfMethodology)?.code}</span>.
                  </p>
                </div>
              )}

              {pfError && (
                <div className="mt-3 flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-xs text-foreground">{pfError}</p>
                </div>
              )}
            </div>

            {pfAnalysis && (
              <div className="rounded-xl border border-border overflow-hidden">
                <div className={`p-4 flex items-start gap-3 ${pfAnalysis.completo ? "bg-success/10" : "bg-amber-500/10"}`}>
                  {pfAnalysis.completo ? (
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {pfAnalysis.completo
                        ? "Todos os campos foram identificados no documento"
                        : `${pfAnalysis.total_pendentes} campo(s) pendente(s) por falta de informação`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {pfAnalysis.total_preenchidos} de {pfAnalysis.total_campos} campos preenchidos · aba {pfAnalysis.aba}
                    </p>
                    {pfAnalysis.resumo && (
                      <p className="text-xs text-foreground mt-2">{pfAnalysis.resumo}</p>
                    )}
                  </div>
                </div>

                {pfAnalysis.pendentes.length > 0 && (
                  <div className="p-4 border-t border-border bg-amber-500/5">
                    <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                      <XCircle className="h-3.5 w-3.5 text-amber-600" />
                      Informações pendentes
                    </h4>
                    <ul className="space-y-1">
                      {pfAnalysis.campos.filter(c => !c.preenchido).map(c => (
                        <li key={c.campo} className="text-xs text-foreground">
                          <span className="font-medium">{c.campo}</span>
                          {c.observacao && <span className="text-muted-foreground"> — {c.observacao}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="p-4 border-t border-border">
                  <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                    Campos identificados
                  </h4>
                  <div className="space-y-2">
                    {pfAnalysis.campos.filter(c => c.preenchido).map(c => (
                      <div key={c.campo} className="text-xs">
                        <p className="font-medium text-foreground">{c.campo}</p>
                        <p className="text-muted-foreground leading-snug">{c.valor}</p>
                      </div>
                    ))}
                    {pfAnalysis.total_preenchidos === 0 && (
                      <p className="text-xs text-muted-foreground">Nenhum campo pôde ser preenchido a partir do documento.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

{/* Repositório de requisitos oculto intencionalmente */}

            <div>
              <Label>Observações para a medição</Label>
              <Textarea
                value={pfObservations}
                onChange={e => setPfObservations(e.target.value)}
                placeholder="Premissas, padrões de ID, particularidades da contagem..."
                className="mt-1 min-h-[80px]"
              />
            </div>

            {pfMethodology === "apf" && (
              <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-foreground">
                  Contagem APF detalhada: os campos DER (padrão 20) e ALR/RLR (padrão 1) serão abertos para edição pelo solicitante e fornecedor após o importe.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 5 — Revisão e envio */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">Revisão e envio</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Confira os dados e selecione os fornecedores que participarão do processo.
              </p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4 text-sm space-y-1">
              <h4 className="font-semibold text-foreground mb-2">Resumo do pedido</h4>
              <p><span className="text-muted-foreground">Título do projeto:</span> {projectTitle || "—"}</p>
              <p><span className="text-muted-foreground">Área solicitante:</span> {requestArea || "—"}</p>
              <p><span className="text-muted-foreground">Solicitante:</span> {requestResponsible || "—"}</p>
              <p><span className="text-muted-foreground">Prioridade:</span> {priority} · <span className="text-muted-foreground">Categoria:</span> {projectCategory || "—"}</p>
              <p><span className="text-muted-foreground">Serviço:</span> {selectedService ? `${selectedService.code} · ${selectedService.label}` : "—"}</p>
              {subtype && <p><span className="text-muted-foreground">Subtipo:</span> {subtype}{seniority ? ` · ${seniority}` : ""}</p>}
              <p><span className="text-muted-foreground">Metodologia (serviço):</span> {methodology.length > 0 ? methodology.join(", ") : "—"}</p>
              <p><span className="text-muted-foreground">Classificação:</span> {finType} · {initiative}</p>
              <p><span className="text-muted-foreground">Métrica PF:</span> {pfMethodologies.find(m => m.id === pfMethodology)?.code} · <span className="text-muted-foreground">Documento:</span> {pfAttachments[0]?.name ?? "—"}</p>
              {pfAnalysis && (
                <p><span className="text-muted-foreground">Análise IA:</span> {pfAnalysis.total_preenchidos}/{pfAnalysis.total_campos} campos · {pfAnalysis.total_pendentes} pendente(s)</p>
              )}
            </div>

            {/* Seleção de fornecedores — mínimo 3 */}
            <div className="rounded-xl border border-border p-4 space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-foreground">Fornecedores habilitados</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Selecione no mínimo 3 fornecedores para garantir concorrência. Caso não seja possível, justificativa e aprovação de superior serão obrigatórias.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(fornecedoresList ?? []).map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => toggleSupplier(f.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all ${
                      selectedSuppliers.includes(f.id)
                        ? "border-success bg-success/5 ring-2 ring-success/20"
                        : "border-border hover:border-success/30"
                    }`}
                  >
                    <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-4 w-4 text-success" />
                    </div>
                    <p className="text-sm font-medium text-foreground truncate flex-1">{f.nome}</p>
                    {selectedSuppliers.includes(f.id) && <Check className="h-4 w-4 text-success ml-auto shrink-0" />}
                  </button>
                ))}

                {fornLoading && (
                  <p className="text-xs text-muted-foreground col-span-2 flex items-center gap-1.5">
                    <Loader2 className="h-3 w-3 animate-spin" /> Carregando fornecedores...
                  </p>
                )}
                {fornError && (
                  <p className="text-xs text-muted-foreground col-span-2 italic">
                    Não foi possível carregar a lista de fornecedores. Faça login com credenciais reais.
                  </p>
                )}
              </div>
              <p className={`text-xs font-medium ${selectedSuppliers.length >= 3 ? "text-success" : "text-amber-600 dark:text-amber-400"}`}>
                {selectedSuppliers.length === 0
                  ? "Nenhum fornecedor selecionado · mínimo 3"
                  : `${selectedSuppliers.length} fornecedor(es) selecionado(s)${selectedSuppliers.length >= 3 ? " · mínimo atingido ✓" : ` · faltam ${3 - selectedSuppliers.length} para o mínimo`}`}
              </p>
            </div>

            {/* Justificativa obrigatória quando < 3 fornecedores */}
            {selectedSuppliers.length < 3 && (
              <div className="space-y-3 border border-amber-400/40 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl p-4">
                <p className="text-xs font-medium flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  {selectedSuppliers.length === 0
                    ? "Nenhum fornecedor selecionado — justificativa e aprovação de superior são obrigatórias."
                    : selectedSuppliers.length === 1
                    ? "Apenas 1 fornecedor selecionado — justificativa e aprovação de superior são obrigatórias."
                    : "Apenas 2 fornecedores selecionados — justificativa e aprovação de superior são obrigatórias."}
                </p>
                <div>
                  <Label htmlFor="just-forn" className="text-sm">Justificativa *</Label>
                  <Textarea
                    id="just-forn"
                    value={justificativaFornecedor}
                    onChange={e => setJustificativaFornecedor(e.target.value)}
                    placeholder="Explique o motivo de indicar menos de 3 fornecedores..."
                    className="mt-1 text-sm"
                    rows={3}
                  />
                </div>
                <div>
                  <Label className="text-sm">Documento / e-mail de aprovação do superior *</Label>
                  <label className="mt-1 flex items-center gap-3 border-2 border-dashed rounded-lg p-4 cursor-pointer hover:border-primary/40 transition-colors">
                    <input
                      type="file"
                      className="hidden"
                      onChange={e => setDocAprovacao(e.target.files?.[0] ?? null)}
                    />
                    <Upload className="h-5 w-5 text-muted-foreground shrink-0" />
                    {docAprovacao ? (
                      <p className="text-sm text-foreground font-medium truncate">{docAprovacao.name}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Clique para selecionar o arquivo de aprovação</p>
                    )}
                  </label>
                </div>
              </div>
            )}

            {submitError && (
              <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-xs text-foreground">{submitError}</p>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={() => step > 0 ? setStep(step - 1) : navigate("/solicitante/projetos")} className="text-sm" disabled={submitting}>
            Voltar
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canAdvance()} className="text-sm">Próximo</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting} className="bg-success hover:bg-success/90 text-success-foreground text-sm">
              {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando...</> : "Enviar Pedido"}
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
              Protocolo: <span className="font-bold text-foreground">{createdNumero}</span>
              <br />
              Sua solicitação foi enviada ao Controle Econômico para análise.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => { setShowModal(false); navigate("/solicitante/projetos"); }} className="w-full">
            Ver em Meus Projetos
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NovaAnalise;
