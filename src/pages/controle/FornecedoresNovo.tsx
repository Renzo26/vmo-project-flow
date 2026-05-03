import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Check, ChevronRight, Search, Upload, X, Paperclip,
  Building2, FileText, Shield, Briefcase, Scale, Cpu,
  ArrowLeft, Plus, CheckCircle2, Clock, AlertCircle,
  Lock, Mail, User, KeyRound,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tipo = "Matriz" | "Filial";
type DocStatus = "pendente" | "anexado" | "aprovado" | "vencido";
type DocCategory = "Fiscal" | "Trabalhista" | "Jurídico" | "Certificação" | "Técnico" | "Contrato";

interface ContactRow {
  cargo: string;
  telefone: string;
  celular: string;
  email: string;
}

interface DocItem {
  id: string;
  nome: string;
  categoria: DocCategory;
  obrigatorio: boolean;
  status: DocStatus;
  arquivo: File | null;
  numero: string;
  emissao: string;
  validade: string;
  observacoes: string;
}

// ─── Mock CNPJ lookup ─────────────────────────────────────────────────────────

const CNPJ_MOCK: Record<string, { razaoSocial: string; nomeFantasia: string }> = {
  "12.345.678/0001-99": { razaoSocial: "TechSoft Serviços de TI Ltda", nomeFantasia: "TechSoft" },
  "98.765.432/0001-10": { razaoSocial: "DevBrasil Soluções S.A.", nomeFantasia: "DevBrasil" },
  "11.222.333/0001-44": { razaoSocial: "InfoSystems Microempresa", nomeFantasia: "InfoSystems ME" },
};

const DOCS_INICIAIS: DocItem[] = [
  { id: "d1",  nome: "CND Federal (Receita Federal)",         categoria: "Fiscal",       obrigatorio: true,  status: "pendente", arquivo: null, numero: "", emissao: "", validade: "", observacoes: "" },
  { id: "d2",  nome: "CND Estadual",                          categoria: "Fiscal",       obrigatorio: true,  status: "pendente", arquivo: null, numero: "", emissao: "", validade: "", observacoes: "" },
  { id: "d3",  nome: "CND Municipal (ISS)",                   categoria: "Fiscal",       obrigatorio: true,  status: "pendente", arquivo: null, numero: "", emissao: "", validade: "", observacoes: "" },
  { id: "d4",  nome: "CNDT — Tribunal Superior do Trabalho",  categoria: "Trabalhista",  obrigatorio: true,  status: "pendente", arquivo: null, numero: "", emissao: "", validade: "", observacoes: "" },
  { id: "d5",  nome: "Certificado de Regularidade FGTS",      categoria: "Trabalhista",  obrigatorio: true,  status: "pendente", arquivo: null, numero: "", emissao: "", validade: "", observacoes: "" },
  { id: "d6",  nome: "Contrato Social / Estatuto",            categoria: "Jurídico",     obrigatorio: true,  status: "pendente", arquivo: null, numero: "", emissao: "", validade: "", observacoes: "" },
  { id: "d7",  nome: "Procuração (se aplicável)",             categoria: "Jurídico",     obrigatorio: false, status: "pendente", arquivo: null, numero: "", emissao: "", validade: "", observacoes: "" },
  { id: "d8",  nome: "ISO 9001 — Qualidade",                  categoria: "Certificação", obrigatorio: false, status: "pendente", arquivo: null, numero: "", emissao: "", validade: "", observacoes: "" },
  { id: "d9",  nome: "ISO 27001 — Segurança da Informação",   categoria: "Certificação", obrigatorio: false, status: "pendente", arquivo: null, numero: "", emissao: "", validade: "", observacoes: "" },
  { id: "d10", nome: "Atestado de Capacidade Técnica",        categoria: "Técnico",      obrigatorio: true,  status: "pendente", arquivo: null, numero: "", emissao: "", validade: "", observacoes: "" },
  { id: "d11", nome: "Proposta Comercial / Contrato Vigente", categoria: "Contrato",     obrigatorio: false, status: "pendente", arquivo: null, numero: "", emissao: "", validade: "", observacoes: "" },
];

const CAT_CONFIG: Record<DocCategory, { icon: typeof FileText; color: string; bg: string; pill: string }> = {
  Fiscal:       { icon: Building2, color: "text-yellow-700", bg: "bg-yellow-50",  pill: "bg-yellow-100 text-yellow-700" },
  Trabalhista:  { icon: Briefcase, color: "text-orange-700", bg: "bg-orange-50",  pill: "bg-orange-100 text-orange-700" },
  Jurídico:     { icon: Scale,     color: "text-blue-700",   bg: "bg-blue-50",    pill: "bg-blue-100 text-blue-700" },
  Certificação: { icon: Shield,    color: "text-purple-700", bg: "bg-purple-50",  pill: "bg-purple-100 text-purple-700" },
  Técnico:      { icon: Cpu,       color: "text-cyan-700",   bg: "bg-cyan-50",    pill: "bg-cyan-100 text-cyan-700" },
  Contrato:     { icon: FileText,  color: "text-green-700",  bg: "bg-green-50",   pill: "bg-green-100 text-green-700" },
};

const STATUS_CONFIG: Record<DocStatus, { label: string; className: string; icon: typeof Check }> = {
  pendente: { label: "Pendente",  className: "bg-gray-100 text-gray-600",   icon: Clock },
  anexado:  { label: "Anexado",   className: "bg-blue-100 text-blue-700",   icon: Paperclip },
  aprovado: { label: "Aprovado",  className: "bg-green-100 text-green-700", icon: CheckCircle2 },
  vencido:  { label: "Vencido",   className: "bg-red-100 text-red-700",     icon: AlertCircle },
};

const UFs = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
const STEPS = ["Dados Cadastrais", "Documentos", "Revisão e Filtros"];

// ─── Step Indicator ────────────────────────────────────────────────────────────

const StepIndicator = ({ current }: { current: number }) => (
  <div className="flex items-center justify-center gap-0 mb-8">
    {STEPS.map((label, i) => {
      const done = i < current;
      const active = i === current;
      return (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              done ? "bg-green-500 text-white" : active ? "bg-ctrl text-white" : "bg-muted text-muted-foreground"
            }`}>
              {done ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-xs whitespace-nowrap ${active ? "text-ctrl font-semibold" : done ? "text-green-600" : "text-muted-foreground"}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-28 h-0.5 mx-2 mb-4 transition-all ${done ? "bg-green-400" : "bg-border"}`} />
          )}
        </div>
      );
    })}
  </div>
);

// ─── Step 1: Dados Cadastrais + Login ─────────────────────────────────────────

interface Step1Data {
  cnpj: string; tipo: Tipo; razaoSocial: string; nomeFantasia: string;
  pais: string; cep: string; logradouro: string; numero: string;
  complemento: string; bairro: string; uf: string; cidade: string; site: string;
  contatos: ContactRow[];
  loginEmail: string; loginNome: string;
}

const EMPTY_STEP1: Step1Data = {
  cnpj: "", tipo: "Matriz", razaoSocial: "", nomeFantasia: "",
  pais: "Brasil", cep: "", logradouro: "", numero: "", complemento: "",
  bairro: "", uf: "", cidade: "", site: "",
  contatos: [
    { cargo: "Preposto", telefone: "", celular: "", email: "" },
    { cargo: "Comercial 1", telefone: "", celular: "", email: "" },
    { cargo: "Comercial 2", telefone: "", celular: "", email: "" },
    { cargo: "Financeiro", telefone: "", celular: "", email: "" },
    { cargo: "Técnico de Segurança", telefone: "", celular: "", email: "" },
  ],
  loginEmail: "", loginNome: "",
};

const Step1Form = ({ data, onChange }: { data: Step1Data; onChange: (d: Step1Data) => void }) => {
  const [searching, setSearching] = useState(false);
  const [cnpjError, setCnpjError] = useState("");

  const set = (field: keyof Step1Data, val: string) => onChange({ ...data, [field]: val });

  const handleCnpjSearch = () => {
    const found = CNPJ_MOCK[data.cnpj];
    setSearching(true);
    setCnpjError("");
    setTimeout(() => {
      setSearching(false);
      if (found) {
        onChange({ ...data, razaoSocial: found.razaoSocial, nomeFantasia: found.nomeFantasia });
      } else {
        setCnpjError("CNPJ não encontrado na base. Preencha manualmente.");
      }
    }, 800);
  };

  const setContato = (i: number, field: keyof ContactRow, val: string) => {
    const next = data.contatos.map((c, idx) => idx === i ? { ...c, [field]: val } : c);
    onChange({ ...data, contatos: next });
  };

  return (
    <div className="grid grid-cols-5 gap-6">
      {/* Coluna esquerda: Identificação + Endereço */}
      <div className="col-span-3 space-y-5">
        {/* Identificação */}
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Identificação</p>

          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block">CNPJ *</Label>
              <Input value={data.cnpj} onChange={e => set("cnpj", e.target.value)} placeholder="00.000.000/0000-00" className="font-mono" />
            </div>
            <Button type="button" onClick={handleCnpjSearch} disabled={!data.cnpj || searching}
              className="gap-2 bg-ctrl hover:bg-ctrl/90 text-white border-0 shrink-0">
              <Search className="h-4 w-4" />
              {searching ? "Buscando..." : "Buscar"}
            </Button>
          </div>
          {cnpjError && <p className="text-xs text-orange-600">{cnpjError}</p>}

          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-2 block">TIPO *</Label>
            <div className="flex gap-5">
              {(["Matriz", "Filial"] as Tipo[]).map(t => (
                <label key={t} className="flex items-center gap-2 cursor-pointer" onClick={() => onChange({ ...data, tipo: t })}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                    data.tipo === t ? "border-ctrl bg-ctrl" : "border-muted-foreground"
                  }`}>
                    {data.tipo === t && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm">{t}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block">RAZÃO SOCIAL *</Label>
              <Input value={data.razaoSocial} onChange={e => set("razaoSocial", e.target.value)} placeholder="Razão social completa" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block">NOME FANTASIA</Label>
              <Input value={data.nomeFantasia} onChange={e => set("nomeFantasia", e.target.value)} placeholder="Nome fantasia" />
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Endereço</p>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block">PAÍS *</Label>
              <Input value={data.pais} onChange={e => set("pais", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block">CEP *</Label>
              <Input value={data.cep} onChange={e => set("cep", e.target.value)} placeholder="00000-000" />
            </div>
            <div />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3">
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block">LOGRADOURO *</Label>
              <Input value={data.logradouro} onChange={e => set("logradouro", e.target.value)} placeholder="Rua / Av. / Alameda" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block">NÚMERO *</Label>
              <Input value={data.numero} onChange={e => set("numero", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-2">
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block">COMPLEMENTO</Label>
              <Input value={data.complemento} onChange={e => set("complemento", e.target.value)} placeholder="Andar, sala..." />
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block">BAIRRO *</Label>
              <Input value={data.bairro} onChange={e => set("bairro", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block">UF *</Label>
              <select value={data.uf} onChange={e => set("uf", e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">UF</option>
                {UFs.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block">CIDADE *</Label>
              <Input value={data.cidade} onChange={e => set("cidade", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block">SITE / EMPRESA</Label>
              <Input value={data.site} onChange={e => set("site", e.target.value)} placeholder="www.empresa.com.br" />
            </div>
          </div>
        </div>
      </div>

      {/* Coluna direita: Contatos + Login */}
      <div className="col-span-2 space-y-5">
        {/* Contatos */}
        <div className="bg-card rounded-xl border border-border p-5 space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Contatos</p>

          {data.contatos.map((c, i) => (
            <div key={c.cargo} className="space-y-2 pb-3 border-b border-border last:border-0 last:pb-0">
              <p className="text-xs font-semibold text-foreground">{c.cargo}</p>
              <div className="grid grid-cols-2 gap-2">
                <Input value={c.telefone} onChange={e => setContato(i, "telefone", e.target.value)} placeholder="Telefone" className="h-8 text-xs" />
                <Input value={c.celular}  onChange={e => setContato(i, "celular",  e.target.value)} placeholder="Celular"   className="h-8 text-xs" />
              </div>
              <Input value={c.email} onChange={e => setContato(i, "email", e.target.value)} placeholder="email@empresa.com" className="h-8 text-xs" />
            </div>
          ))}
        </div>

        {/* Login do Fornecedor */}
        <div className="bg-card rounded-xl border border-ctrl/30 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-ctrl/10 flex items-center justify-center shrink-0">
              <KeyRound className="h-3.5 w-3.5 text-ctrl" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Acesso ao Portal</p>
              <p className="text-[11px] text-muted-foreground">Credenciais de acesso do fornecedor</p>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block">
              <User className="h-3 w-3 inline mr-1" />NOME DO USUÁRIO *
            </Label>
            <Input value={data.loginNome} onChange={e => set("loginNome", e.target.value)} placeholder="Nome completo do responsável" />
          </div>

          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block">
              <Mail className="h-3 w-3 inline mr-1" />E-MAIL DE ACESSO *
            </Label>
            <Input type="email" value={data.loginEmail} onChange={e => set("loginEmail", e.target.value)} placeholder="login@empresa.com" />
            <p className="text-[11px] text-muted-foreground mt-1">Este e-mail será o login de acesso ao portal.</p>
          </div>

          {/* Senha padrão — gerada automaticamente */}
          <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <p className="text-xs font-semibold text-foreground">Senha padrão gerada automaticamente</p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              O sistema irá gerar uma <strong className="text-foreground">senha temporária</strong> e enviá-la ao e-mail do fornecedor.
              No <strong className="text-foreground">primeiro acesso</strong>, o fornecedor será obrigatoriamente redirecionado para
              criar sua própria senha antes de usar o portal.
            </p>
          </div>

          {/* Fluxo visual */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Fluxo de primeiro acesso</p>
            <div className="flex flex-col gap-1.5">
              {[
                { step: "1", text: "Fornecedor recebe e-mail com senha temporária" },
                { step: "2", text: "Acessa o portal com e-mail + senha temporária" },
                { step: "3", text: "Sistema exige criação de nova senha pessoal" },
                { step: "4", text: "Acesso liberado ao Portal do Fornecedor" },
              ].map(item => (
                <div key={item.step} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-ctrl/15 text-ctrl text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {item.step}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Step 2: Documentos ────────────────────────────────────────────────────────

const DocRow = ({ doc, onUpdate }: { doc: DocItem; onUpdate: (d: DocItem) => void }) => {
  const [expanded, setExpanded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cfg = CAT_CONFIG[doc.categoria];
  const CatIcon = cfg.icon;
  const stCfg = STATUS_CONFIG[doc.status];
  const StIcon = stCfg.icon;

  const handleFile = (file: File) => onUpdate({ ...doc, arquivo: file, status: "anexado" });
  const removeFile = () => onUpdate({ ...doc, arquivo: null, status: "pendente" });

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${expanded ? "border-ctrl/30 shadow-sm" : "border-border"}`}>
      <div className="flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-muted/20 transition-colors"
        onClick={() => setExpanded(v => !v)}>
        <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
          <CatIcon className={`h-4 w-4 ${cfg.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{doc.nome}</p>
          <p className={`text-xs ${cfg.color}`}>{doc.categoria}</p>
        </div>
        {doc.obrigatorio && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-destructive bg-destructive/10 px-2 py-0.5 rounded-full shrink-0">
            Obrigatório
          </span>
        )}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${stCfg.className} shrink-0`}>
          <StIcon className="h-3 w-3" /> {stCfg.label}
        </div>
        <div className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${expanded ? "rotate-90" : ""}`}>
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border px-5 py-4 bg-muted/10 grid grid-cols-2 gap-5">
          {/* Upload */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Arquivo</p>
            {doc.arquivo ? (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                <Paperclip className="h-4 w-4 text-ctrl shrink-0" />
                <span className="text-sm flex-1 truncate">{doc.arquivo.name}</span>
                <button onClick={removeFile} className="text-muted-foreground hover:text-destructive transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-lg p-4 flex items-center gap-3 cursor-pointer hover:border-ctrl/50 hover:bg-ctrl/5 transition-colors"
                onClick={() => fileRef.current?.click()}>
                <Upload className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Clique para anexar</p>
                  <p className="text-xs text-muted-foreground">PDF, DOCX, XLSX — máx. 10MB</p>
                </div>
              </div>
            )}
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" className="hidden"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block">OBSERVAÇÕES</Label>
              <Textarea value={doc.observacoes} onChange={e => onUpdate({ ...doc, observacoes: e.target.value })}
                placeholder="Informações adicionais..." className="min-h-[64px] text-sm" />
            </div>
          </div>

          {/* Campos */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dados do documento</p>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block">Nº DO DOCUMENTO</Label>
              <Input value={doc.numero} onChange={e => onUpdate({ ...doc, numero: e.target.value })}
                placeholder="Número / código" className="h-9 text-sm" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block">DATA DE EMISSÃO</Label>
              <Input type="date" value={doc.emissao} onChange={e => onUpdate({ ...doc, emissao: e.target.value })} className="h-9 text-sm" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block">DATA DE VALIDADE</Label>
              <Input type="date" value={doc.validade} onChange={e => onUpdate({ ...doc, validade: e.target.value })} className="h-9 text-sm" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Step 3: Revisão + Filtros ─────────────────────────────────────────────────

const Step3Review = ({ step1, docs }: { step1: Step1Data; docs: DocItem[] }) => {
  const [catFilter, setCatFilter]       = useState<DocCategory | "Todos">("Todos");
  const [statusFilter, setStatusFilter] = useState<DocStatus | "Todos">("Todos");

  const countByCat = (cat: DocCategory) => docs.filter(d => d.categoria === cat).length;
  const countBySt  = (s: DocStatus)     => docs.filter(d => d.status === s).length;

  const filtered = docs.filter(d =>
    (catFilter === "Todos" || d.categoria === catFilter) &&
    (statusFilter === "Todos" || d.status === statusFilter)
  );

  const catCards = [
    { label: "Todos" as const,        count: docs.length,               icon: FileText,  topColor: "border-t-gray-400",   active: "bg-gray-50 text-gray-700" },
    { label: "Fiscal" as const,       count: countByCat("Fiscal"),       icon: Building2, topColor: "border-t-yellow-500", active: "bg-yellow-50 text-yellow-700" },
    { label: "Trabalhista" as const,  count: countByCat("Trabalhista"),  icon: Briefcase, topColor: "border-t-orange-500", active: "bg-orange-50 text-orange-700" },
    { label: "Jurídico" as const,     count: countByCat("Jurídico"),     icon: Scale,     topColor: "border-t-blue-500",   active: "bg-blue-50 text-blue-700" },
    { label: "Certificação" as const, count: countByCat("Certificação"), icon: Shield,    topColor: "border-t-purple-500", active: "bg-purple-50 text-purple-700" },
    { label: "Técnico" as const,      count: countByCat("Técnico"),      icon: Cpu,       topColor: "border-t-cyan-500",   active: "bg-cyan-50 text-cyan-700" },
    { label: "Contrato" as const,     count: countByCat("Contrato"),     icon: FileText,  topColor: "border-t-green-500",  active: "bg-green-50 text-green-700" },
  ];

  const statusCards = [
    { label: "Todos",    value: "Todos" as const,    count: docs.length,           topColor: "border-t-gray-400" },
    { label: "Anexado",  value: "anexado" as const,  count: countBySt("anexado"),  topColor: "border-t-blue-500" },
    { label: "Aprovado", value: "aprovado" as const, count: countBySt("aprovado"), topColor: "border-t-green-500" },
    { label: "Pendente", value: "pendente" as const, count: countBySt("pendente"), topColor: "border-t-gray-400" },
    { label: "Vencido",  value: "vencido" as const,  count: countBySt("vencido"),  topColor: "border-t-red-500" },
  ];

  return (
    <div className="space-y-5">
      {/* Resumo em 2 colunas */}
      <div className="grid grid-cols-2 gap-5">
        {/* Dados do fornecedor */}
        <div className="bg-card rounded-xl border border-border p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Fornecedor</p>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-ctrl/10 flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5 text-ctrl" />
            </div>
            <div>
              <p className="font-bold text-foreground">{step1.razaoSocial || "—"}</p>
              <p className="text-xs text-muted-foreground">{step1.nomeFantasia || "—"}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">CNPJ</p>
              <p className="font-mono font-medium text-foreground">{step1.cnpj || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tipo</p>
              <p className="font-medium text-foreground">{step1.tipo}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">Endereço</p>
              <p className="text-foreground">
                {step1.logradouro || "—"}{step1.numero ? `, ${step1.numero}` : ""}
                {step1.cidade ? ` · ${step1.cidade}` : ""}{step1.uf ? `/${step1.uf}` : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Acesso criado */}
        <div className="bg-card rounded-xl border border-ctrl/30 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Acesso ao Portal</p>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-ctrl/10 flex items-center justify-center shrink-0">
              <KeyRound className="h-5 w-5 text-ctrl" />
            </div>
            <div>
              <p className="font-bold text-foreground">{step1.loginNome || "—"}</p>
              <p className="text-xs text-muted-foreground">{step1.loginEmail || "—"}</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
            step1.loginEmail && step1.loginNome
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-yellow-50 text-yellow-700 border border-yellow-200"
          }`}>
            {step1.loginEmail && step1.loginNome
              ? <><CheckCircle2 className="h-3.5 w-3.5" /> Acesso configurado — senha temporária será enviada por e-mail</>
              : <><AlertCircle className="h-3.5 w-3.5" /> Login incompleto — informe nome e e-mail do usuário</>
            }
          </div>
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            <p className="font-medium text-foreground text-[11px] uppercase tracking-wider">Primeiro acesso</p>
            <p>O fornecedor receberá uma <strong>senha temporária</strong> por e-mail e será obrigado a criar uma senha pessoal antes de usar o portal.</p>
          </div>
        </div>
      </div>

      {/* Filtros por categoria */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Filtrar por categoria</p>
        <div className="flex flex-wrap gap-2">
          {catCards.map(card => {
            const Icon = card.icon;
            const isActive = catFilter === card.label;
            return (
              <button key={card.label}
                onClick={() => setCatFilter(card.label)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border-t-2 border border-border text-sm font-medium transition-all ${
                  isActive ? `${card.active} ${card.topColor} ring-2 ring-ctrl/20 shadow-sm` : "bg-card text-muted-foreground hover:bg-muted/50"
                }`}>
                <Icon className="h-3.5 w-3.5" />
                {card.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${isActive ? "bg-white/70" : "bg-muted text-muted-foreground"}`}>
                  {card.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtros por status */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Filtrar por status</p>
        <div className="flex flex-wrap gap-2">
          {statusCards.map(card => {
            const isActive = statusFilter === card.value;
            return (
              <button key={card.label}
                onClick={() => setStatusFilter(card.value)}
                className={`px-3.5 py-2 rounded-lg border-t-2 border border-border text-sm font-medium transition-all ${
                  isActive ? `${card.topColor} bg-muted/60 text-foreground ring-2 ring-ctrl/20 shadow-sm` : "bg-card text-muted-foreground hover:bg-muted/50"
                }`}>
                {card.label}
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-semibold ${isActive ? "bg-white/70 text-foreground" : "bg-muted text-muted-foreground"}`}>
                  {card.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">
            {filtered.length} documento{filtered.length !== 1 ? "s" : ""}
            {catFilter !== "Todos" ? ` · ${catFilter}` : ""}
            {statusFilter !== "Todos" ? ` · ${statusFilter}` : ""}
          </p>
          <button className="flex items-center gap-1.5 text-xs text-ctrl hover:underline">
            <Plus className="h-3.5 w-3.5" /> Adicionar documento
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Documento</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Categoria</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Validade</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Arquivo</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ação</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-muted-foreground">Nenhum documento para este filtro.</td></tr>
            )}
            {filtered.map(doc => {
              const cfg = CAT_CONFIG[doc.categoria];
              const CatIcon = cfg.icon;
              const stCfg = STATUS_CONFIG[doc.status];
              const StIcon = stCfg.icon;
              return (
                <tr key={doc.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium text-foreground">{doc.nome}</p>
                    {doc.obrigatorio && <p className="text-[10px] text-destructive">Obrigatório</p>}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.pill}`}>
                      <CatIcon className="h-3 w-3" /> {doc.categoria}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{doc.validade || "—"}</td>
                  <td className="px-5 py-3 text-sm max-w-[160px] truncate">
                    {doc.arquivo
                      ? <span className="flex items-center gap-1.5 text-foreground"><Paperclip className="h-3.5 w-3.5 text-ctrl shrink-0" />{doc.arquivo.name}</span>
                      : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${stCfg.className}`}>
                      <StIcon className="h-3 w-3" /> {stCfg.label}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Main ──────────────────────────────────────────────────────────────────────

const FornecedoresNovo = () => {
  const navigate = useNavigate();
  const [step, setStep]       = useState(0);
  const [step1, setStep1]     = useState<Step1Data>(EMPTY_STEP1);
  const [docs, setDocs]       = useState<DocItem[]>(DOCS_INICIAIS);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]       = useState(false);

  const updateDoc = (updated: DocItem) =>
    setDocs(prev => prev.map(d => d.id === updated.id ? updated : d));

  const canAdvance = () => {
    if (step === 0) return !!(
      step1.cnpj && step1.razaoSocial && step1.logradouro && step1.cidade &&
      step1.loginEmail && step1.loginNome
    );
    return true;
  };

  const obligatoryPending = docs.filter(d => d.obrigatorio && d.status === "pendente").length;

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setDone(true); }, 1400);
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Fornecedor cadastrado!</h2>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          O cadastro de <strong>{step1.nomeFantasia || step1.razaoSocial}</strong> foi registrado com sucesso.
          Uma <strong>senha temporária</strong> foi enviada para <strong>{step1.loginEmail}</strong>.
          No primeiro acesso, o fornecedor será solicitado a criar sua própria senha.
        </p>
        <div className="flex gap-3 mt-4">
          <Button variant="outline" onClick={() => navigate("/controle/fornecedores/base")}>
            Ver base de fornecedores
          </Button>
          <Button onClick={() => navigate("/controle/fornecedores/homologacao")} className="bg-ctrl hover:bg-ctrl/90 text-white border-0">
            Ir para homologação
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground -ml-2"
            onClick={() => navigate("/controle/fornecedores/base")}>
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
          <div>
            <h2 className="text-xl font-bold text-foreground">Novo Cadastro de Fornecedor</h2>
            <p className="text-sm text-muted-foreground">Preencha as informações do fornecedor em 3 etapas</p>
          </div>
        </div>
      </div>

      <StepIndicator current={step} />

      {/* Step content */}
      {step === 0 && <Step1Form data={step1} onChange={setStep1} />}

      {step === 1 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="font-semibold text-foreground">Documentos e Certidões</h3>
              <p className="text-xs text-muted-foreground">Expanda cada item para anexar o arquivo e preencher as datas</p>
            </div>
            {obligatoryPending > 0 && (
              <span className="text-xs text-destructive bg-destructive/10 px-3 py-1 rounded-full font-medium">
                {obligatoryPending} obrigatório{obligatoryPending > 1 ? "s" : ""} pendente{obligatoryPending > 1 ? "s" : ""}
              </span>
            )}
          </div>
          {docs.map(doc => <DocRow key={doc.id} doc={doc} onUpdate={updateDoc} />)}
        </div>
      )}

      {step === 2 && <Step3Review step1={step1} docs={docs} />}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
        <Button variant="outline"
          onClick={() => step > 0 ? setStep(s => s - 1) : navigate("/controle/fornecedores/base")}>
          {step === 0 ? "Cancelar" : "Voltar"}
        </Button>

        {step < 2 ? (
          <Button onClick={() => setStep(s => s + 1)} disabled={!canAdvance()}
            className="gap-2 bg-ctrl hover:bg-ctrl/90 text-white border-0">
            Próxima etapa <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting}
            className="gap-2 bg-green-600 hover:bg-green-700 text-white border-0">
            {submitting ? "Salvando..." : <><Check className="h-4 w-4" /> Finalizar Cadastro</>}
          </Button>
        )}
      </div>
    </div>
  );
};

export default FornecedoresNovo;
