import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, PlusCircle, X, Building2, MapPin, Phone, Mail,
  FileText, ShieldCheck, AlertTriangle, Star, Calendar, ExternalLink,
} from "lucide-react";

type StatusForn = "Homologado" | "Qualificação" | "Pré-cadastro" | "Bloqueado";
type Risco = "Baixo" | "Médio" | "Alto";
type TabDetalhe = "dados" | "documentos" | "score" | "contratos";

interface Contato {
  tipo: string;
  nome: string;
  telefone: string;
  email: string;
}

interface Documento {
  nome: string;
  tipo: string;
  validade: string;
  status: "Válido" | "Vencendo" | "Vencido" | "Pendente";
}

interface Contrato {
  numero: string;
  objeto: string;
  vigencia: string;
  valor: string;
  status: "Ativo" | "Encerrado";
}

interface ScoreItem {
  criterio: string;
  nota: number;
  peso: number;
}

interface Fornecedor {
  id: string;
  nome: string;
  nomeFantasia: string;
  cnpj: string;
  categorias: string[];
  score: number | null;
  risco: Risco;
  status: StatusForn;
  // detalhes
  endereco: string;
  cidade: string;
  uf: string;
  site: string;
  contatos: Contato[];
  documentos: Documento[];
  contratos: Contrato[];
  scoreItens: ScoreItem[];
  homologadoEm: string;
}

const FORNECEDORES: Fornecedor[] = [
  {
    id: "1", nome: "TechSoft Ltda", nomeFantasia: "TechSoft Soluções",
    cnpj: "12.345.678/0001-99", categorias: ["Dev", "QA"], score: 92, risco: "Baixo", status: "Homologado",
    endereco: "Av. Paulista, 1000", cidade: "São Paulo", uf: "SP", site: "techsoft.com.br", homologadoEm: "15/03/2025",
    contatos: [
      { tipo: "Preposto", nome: "Carlos Silva", telefone: "(11) 98765-4321", email: "carlos@techsoft.com.br" },
      { tipo: "Comercial", nome: "Ana Lima", telefone: "(11) 3456-7890", email: "comercial@techsoft.com.br" },
    ],
    documentos: [
      { nome: "CND Federal", tipo: "Fiscal", validade: "08/04/2026", status: "Vencendo" },
      { nome: "CNDT — TST", tipo: "Trabalhista", validade: "30/06/2026", status: "Válido" },
      { nome: "ISO 27001", tipo: "Certificação", validade: "20/11/2026", status: "Válido" },
      { nome: "Contrato Social", tipo: "Jurídico", validade: "31/12/2029", status: "Válido" },
    ],
    contratos: [
      { numero: "CT-2025-042", objeto: "Desenvolvimento de sistemas web", vigencia: "Jan/2025 – Dez/2026", valor: "R$ 480.000", status: "Ativo" },
      { numero: "CT-2023-018", objeto: "Manutenção de aplicações", vigencia: "Jan/2023 – Dez/2024", valor: "R$ 220.000", status: "Encerrado" },
    ],
    scoreItens: [
      { criterio: "Qualidade técnica", nota: 95, peso: 30 },
      { criterio: "Cumprimento de prazos", nota: 90, peso: 25 },
      { criterio: "Documentação", nota: 92, peso: 20 },
      { criterio: "Suporte e comunicação", nota: 89, peso: 15 },
      { criterio: "Conformidade legal", nota: 95, peso: 10 },
    ],
  },
  {
    id: "2", nome: "DevBrasil S.A.", nomeFantasia: "DevBrasil S.A.",
    cnpj: "98.765.432/0001-10", categorias: ["Dev", "Infra"], score: 85, risco: "Baixo", status: "Homologado",
    endereco: "Rua Augusta, 500", cidade: "São Paulo", uf: "SP", site: "devbrasil.com.br", homologadoEm: "20/06/2024",
    contatos: [
      { tipo: "Preposto", nome: "Roberto Costa", telefone: "(11) 97654-3210", email: "roberto@devbrasil.com.br" },
      { tipo: "Financeiro", nome: "Mariana Souza", telefone: "(11) 3321-0987", email: "financeiro@devbrasil.com.br" },
    ],
    documentos: [
      { nome: "CND Federal", tipo: "Fiscal", validade: "30/09/2026", status: "Válido" },
      { nome: "FGTS", tipo: "Trabalhista", validade: "01/07/2026", status: "Válido" },
      { nome: "Contrato Social", tipo: "Jurídico", validade: "31/12/2029", status: "Válido" },
    ],
    contratos: [
      { numero: "CT-2026-007", objeto: "Infraestrutura cloud e DevOps", vigencia: "Fev/2026 – Jan/2027", valor: "R$ 310.000", status: "Ativo" },
    ],
    scoreItens: [
      { criterio: "Qualidade técnica", nota: 88, peso: 30 },
      { criterio: "Cumprimento de prazos", nota: 82, peso: 25 },
      { criterio: "Documentação", nota: 85, peso: 20 },
      { criterio: "Suporte e comunicação", nota: 83, peso: 15 },
      { criterio: "Conformidade legal", nota: 90, peso: 10 },
    ],
  },
  {
    id: "3", nome: "InfoTech Brasil ME", nomeFantasia: "InfoTech Brasil ME",
    cnpj: "55.123.456/0001-78", categorias: ["Dev"], score: null, risco: "Médio", status: "Qualificação",
    endereco: "Rua Vergueiro, 200", cidade: "São Paulo", uf: "SP", site: "—", homologadoEm: "—",
    contatos: [
      { tipo: "Preposto", nome: "Fernanda Alves", telefone: "(11) 96543-2109", email: "fernanda@infotech.com.br" },
    ],
    documentos: [
      { nome: "CND Federal", tipo: "Fiscal", validade: "—", status: "Pendente" },
      { nome: "CNDT — TST", tipo: "Trabalhista", validade: "—", status: "Pendente" },
      { nome: "ISO 27001", tipo: "Certificação", validade: "—", status: "Pendente" },
    ],
    contratos: [],
    scoreItens: [],
  },
  {
    id: "4", nome: "CyberSec Ltda", nomeFantasia: "CyberSec",
    cnpj: "33.987.654/0001-22", categorias: ["Seg"], score: 78, risco: "Baixo", status: "Homologado",
    endereco: "Al. Santos, 1200", cidade: "São Paulo", uf: "SP", site: "cybersec.com.br", homologadoEm: "10/09/2024",
    contatos: [
      { tipo: "Preposto", nome: "Lucas Mendes", telefone: "(11) 95432-1098", email: "lucas@cybersec.com.br" },
      { tipo: "Técnico de Seg.", nome: "Rafael Torres", telefone: "(11) 3210-9876", email: "seguranca@cybersec.com.br" },
    ],
    documentos: [
      { nome: "CND Estadual", tipo: "Fiscal", validade: "15/05/2026", status: "Vencendo" },
      { nome: "FGTS", tipo: "Trabalhista", validade: "01/03/2026", status: "Vencido" },
      { nome: "ISO 27001", tipo: "Certificação", validade: "30/06/2026", status: "Válido" },
    ],
    contratos: [
      { numero: "CT-2025-055", objeto: "Segurança da informação e pentest", vigencia: "Mar/2025 – Fev/2026", valor: "R$ 180.000", status: "Encerrado" },
    ],
    scoreItens: [
      { criterio: "Qualidade técnica", nota: 80, peso: 30 },
      { criterio: "Cumprimento de prazos", nota: 75, peso: 25 },
      { criterio: "Documentação", nota: 78, peso: 20 },
      { criterio: "Suporte e comunicação", nota: 80, peso: 15 },
      { criterio: "Conformidade legal", nota: 72, peso: 10 },
    ],
  },
  {
    id: "5", nome: "DataMind S.A.", nomeFantasia: "DataMind Analytics",
    cnpj: "44.123.789/0001-55", categorias: ["Dados", "Dev"], score: 88, risco: "Baixo", status: "Homologado",
    endereco: "Rua Bela Cintra, 900", cidade: "São Paulo", uf: "SP", site: "datamind.io", homologadoEm: "05/01/2025",
    contatos: [
      { tipo: "Preposto", nome: "Patricia Rocha", telefone: "(11) 94321-0987", email: "patricia@datamind.io" },
    ],
    documentos: [
      { nome: "CND Federal", tipo: "Fiscal", validade: "31/12/2026", status: "Válido" },
      { nome: "Contrato Social", tipo: "Jurídico", validade: "31/12/2029", status: "Válido" },
    ],
    contratos: [
      { numero: "CT-2025-031", objeto: "Analytics e BI corporativo", vigencia: "Abr/2025 – Mar/2027", valor: "R$ 560.000", status: "Ativo" },
    ],
    scoreItens: [
      { criterio: "Qualidade técnica", nota: 92, peso: 30 },
      { criterio: "Cumprimento de prazos", nota: 85, peso: 25 },
      { criterio: "Documentação", nota: 88, peso: 20 },
      { criterio: "Suporte e comunicação", nota: 86, peso: 15 },
      { criterio: "Conformidade legal", nota: 90, peso: 10 },
    ],
  },
  {
    id: "6", nome: "CloudBase ME", nomeFantasia: "CloudBase",
    cnpj: "77.654.321/0001-11", categorias: ["Infra"], score: null, risco: "Médio", status: "Pré-cadastro",
    endereco: "Av. Rebouças, 300", cidade: "São Paulo", uf: "SP", site: "cloudbase.tech", homologadoEm: "—",
    contatos: [
      { tipo: "Preposto", nome: "Bruno Faria", telefone: "(11) 93210-9876", email: "bruno@cloudbase.tech" },
    ],
    documentos: [
      { nome: "CND Federal", tipo: "Fiscal", validade: "—", status: "Pendente" },
      { nome: "CNDT — TST", tipo: "Trabalhista", validade: "—", status: "Pendente" },
    ],
    contratos: [],
    scoreItens: [],
  },
  {
    id: "7", nome: "AgileWorks Ltda", nomeFantasia: "AgileWorks",
    cnpj: "22.333.444/0001-66", categorias: ["AGL", "PMO"], score: 91, risco: "Baixo", status: "Homologado",
    endereco: "Rua Consolação, 1500", cidade: "São Paulo", uf: "SP", site: "agileworks.com.br", homologadoEm: "18/02/2025",
    contatos: [
      { tipo: "Preposto", nome: "Juliana Castro", telefone: "(11) 92109-8765", email: "juliana@agileworks.com.br" },
      { tipo: "PMO", nome: "Thiago Neves", telefone: "(11) 3098-7654", email: "pmo@agileworks.com.br" },
    ],
    documentos: [
      { nome: "CND Federal", tipo: "Fiscal", validade: "20/05/2026", status: "Vencendo" },
      { nome: "ISO 9001", tipo: "Certificação", validade: "20/05/2026", status: "Vencendo" },
      { nome: "Contrato Social", tipo: "Jurídico", validade: "31/12/2029", status: "Válido" },
    ],
    contratos: [
      { numero: "CT-2026-003", objeto: "Gestão ágil e PMO", vigencia: "Jan/2026 – Dez/2027", valor: "R$ 390.000", status: "Ativo" },
    ],
    scoreItens: [
      { criterio: "Qualidade técnica", nota: 93, peso: 30 },
      { criterio: "Cumprimento de prazos", nota: 90, peso: 25 },
      { criterio: "Documentação", nota: 91, peso: 20 },
      { criterio: "Suporte e comunicação", nota: 92, peso: 15 },
      { criterio: "Conformidade legal", nota: 88, peso: 10 },
    ],
  },
  {
    id: "8", nome: "SupportHub S.A.", nomeFantasia: "SupportHub",
    cnpj: "11.222.333/0001-44", categorias: ["SUP"], score: null, risco: "Alto", status: "Bloqueado",
    endereco: "Rua da Mooca, 400", cidade: "São Paulo", uf: "SP", site: "supporthub.com.br", homologadoEm: "—",
    contatos: [
      { tipo: "Preposto", nome: "Marcos Pinto", telefone: "(11) 91098-7654", email: "marcos@supporthub.com.br" },
    ],
    documentos: [
      { nome: "CND Federal", tipo: "Fiscal", validade: "10/02/2026", status: "Vencido" },
      { nome: "FGTS", tipo: "Trabalhista", validade: "01/03/2026", status: "Vencido" },
      { nome: "Contrato Social", tipo: "Jurídico", validade: "31/12/2029", status: "Válido" },
    ],
    contratos: [
      { numero: "CT-2024-009", objeto: "Suporte técnico N1/N2", vigencia: "Jul/2024 – Jun/2025", valor: "R$ 95.000", status: "Encerrado" },
    ],
    scoreItens: [],
  },
];

const STATUS_CONFIG: Record<StatusForn, { dot: string; text: string; badgeBg: string }> = {
  Homologado:      { dot: "bg-green-500",  text: "text-green-700",  badgeBg: "bg-green-100" },
  Qualificação:    { dot: "bg-yellow-500", text: "text-yellow-700", badgeBg: "bg-yellow-100" },
  "Pré-cadastro":  { dot: "bg-blue-500",   text: "text-blue-700",   badgeBg: "bg-blue-100" },
  Bloqueado:       { dot: "bg-red-500",    text: "text-red-700",    badgeBg: "bg-red-100" },
};

const RISCO_CONFIG: Record<Risco, string> = {
  Baixo: "bg-green-100 text-green-700",
  Médio: "bg-yellow-100 text-yellow-700",
  Alto:  "bg-red-100 text-red-700",
};

const CAT_COLORS: Record<string, string> = {
  Dev:   "bg-blue-100 text-blue-700",
  QA:    "bg-purple-100 text-purple-700",
  Infra: "bg-cyan-100 text-cyan-700",
  Seg:   "bg-red-100 text-red-700",
  Dados: "bg-orange-100 text-orange-700",
  AGL:   "bg-indigo-100 text-indigo-700",
  PMO:   "bg-teal-100 text-teal-700",
  SUP:   "bg-gray-100 text-gray-600",
};

const DOC_STATUS_CONFIG: Record<Documento["status"], string> = {
  Válido:   "bg-green-100 text-green-700",
  Vencendo: "bg-yellow-100 text-yellow-700",
  Vencido:  "bg-red-100 text-red-700",
  Pendente: "bg-gray-100 text-gray-500",
};

type Filtro = "Todos" | StatusForn;

// ── Modal de detalhe ──────────────────────────────────────────────────────────
const FornecedorModal = ({
  fornecedor,
  onClose,
}: {
  fornecedor: Fornecedor;
  onClose: () => void;
}) => {
  const [tab, setTab] = useState<TabDetalhe>("dados");
  const st = STATUS_CONFIG[fornecedor.status];

  const scoreTotal = fornecedor.scoreItens.length
    ? Math.round(
        fornecedor.scoreItens.reduce((acc, i) => acc + (i.nota * i.peso) / 100, 0)
      )
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 border-b border-border">
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 rounded-xl bg-ctrl/10 flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5 text-ctrl" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground leading-tight">{fornecedor.nome}</h3>
              {fornecedor.nomeFantasia !== fornecedor.nome && (
                <p className="text-sm text-muted-foreground">{fornecedor.nomeFantasia}</p>
              )}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${st.badgeBg} ${st.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                  {fornecedor.status}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${RISCO_CONFIG[fornecedor.risco]}`}>
                  Risco {fornecedor.risco}
                </span>
                {fornecedor.categorias.map(c => (
                  <span key={c} className={`px-2 py-0.5 rounded text-[11px] font-medium ${CAT_COLORS[c] ?? "bg-muted text-muted-foreground"}`}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-border px-6">
          {(
            [
              { key: "dados",      label: "Dados gerais" },
              { key: "documentos", label: "Documentos" },
              { key: "score",      label: "Score" },
              { key: "contratos",  label: "Contratos" },
            ] as { key: TabDetalhe; label: string }[]
          ).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                tab === t.key
                  ? "border-ctrl text-ctrl"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {/* ── Dados gerais ── */}
          {tab === "dados" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <InfoBox icon={<FileText className="h-3.5 w-3.5" />} label="CNPJ" value={fornecedor.cnpj} mono />
                <InfoBox icon={<Calendar className="h-3.5 w-3.5" />} label="Homologado em" value={fornecedor.homologadoEm} />
                <InfoBox
                  icon={<MapPin className="h-3.5 w-3.5" />}
                  label="Endereço"
                  value={`${fornecedor.endereco} — ${fornecedor.cidade}/${fornecedor.uf}`}
                />
                <InfoBox icon={<ExternalLink className="h-3.5 w-3.5" />} label="Site" value={fornecedor.site} />
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Contatos</p>
                <div className="space-y-2">
                  {fornecedor.contatos.map((c, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                      <div className="h-8 w-8 rounded-full bg-ctrl/10 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-ctrl">
                          {c.nome.split(" ").map(n => n[0]).slice(0, 2).join("")}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{c.nome}</p>
                        <p className="text-xs text-muted-foreground">{c.tipo}</p>
                      </div>
                      <div className="text-right space-y-0.5">
                        <div className="flex items-center gap-1 justify-end text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />{c.telefone}
                        </div>
                        <div className="flex items-center gap-1 justify-end text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />{c.email}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Documentos ── */}
          {tab === "documentos" && (
            <div className="space-y-2">
              {fornecedor.documentos.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum documento registrado.</p>
              )}
              {fornecedor.documentos.map((d, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{d.nome}</p>
                    <p className="text-xs text-muted-foreground">{d.tipo}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {d.validade !== "—" && (
                      <span className="text-xs text-muted-foreground">Válido até {d.validade}</span>
                    )}
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${DOC_STATUS_CONFIG[d.status]}`}>
                      {d.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Score ── */}
          {tab === "score" && (
            <div className="space-y-4">
              {fornecedor.scoreItens.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">Score ainda não calculado para este fornecedor.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-ctrl/20 bg-ctrl/5">
                    <Star className="h-6 w-6 text-ctrl" />
                    <div>
                      <p className="text-2xl font-bold text-ctrl">{scoreTotal}/100</p>
                      <p className="text-xs text-muted-foreground">Score consolidado ponderado</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {fornecedor.scoreItens.map((s, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-foreground">{s.criterio}</span>
                          <span className="text-muted-foreground">{s.nota}/100 · peso {s.peso}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${s.nota >= 90 ? "bg-green-500" : s.nota >= 75 ? "bg-yellow-500" : "bg-red-500"}`}
                            style={{ width: `${s.nota}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Contratos ── */}
          {tab === "contratos" && (
            <div className="space-y-2">
              {fornecedor.contratos.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum contrato registrado.</p>
              )}
              {fornecedor.contratos.map((c, i) => (
                <div key={i} className="p-3 rounded-lg border border-border bg-muted/20 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-muted-foreground">{c.numero}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      c.status === "Ativo" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {c.status}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">{c.objeto}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span><Calendar className="h-3 w-3 inline mr-1" />{c.vigencia}</span>
                    <span className="font-medium text-foreground">{c.valor}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 px-6 py-4 border-t border-border">
          <p className="text-xs text-muted-foreground">CNPJ: {fornecedor.cnpj}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Fechar</Button>
            {fornecedor.status === "Qualificação" && (
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white border-0">
                Iniciar análise
              </Button>
            )}
            {(fornecedor.status === "Homologado" || fornecedor.status === "Pré-cadastro") && (
              <Button size="sm" className="bg-ctrl hover:bg-ctrl/90 text-ctrl-foreground border-0">
                Editar cadastro
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Bloco de informação simples
const InfoBox = ({
  icon, label, value, mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) => (
  <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-0.5">
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {icon}
      <span>{label}</span>
    </div>
    <p className={`text-sm font-medium text-foreground ${mono ? "font-mono" : ""}`}>{value}</p>
  </div>
);

// ── Página principal ──────────────────────────────────────────────────────────
const FornecedoresBase = () => {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<Filtro>("Todos");
  const [busca, setBusca] = useState("");
  const [selecionado, setSelecionado] = useState<Fornecedor | null>(null);

  const counts = {
    Todos: FORNECEDORES.length,
    Homologado: FORNECEDORES.filter(f => f.status === "Homologado").length,
    Qualificação: FORNECEDORES.filter(f => f.status === "Qualificação").length,
    "Pré-cadastro": FORNECEDORES.filter(f => f.status === "Pré-cadastro").length,
    Bloqueado: FORNECEDORES.filter(f => f.status === "Bloqueado").length,
  };

  const filtrados = FORNECEDORES.filter(f => {
    const matchFiltro = filtro === "Todos" || f.status === filtro;
    const matchBusca =
      busca === "" ||
      f.nome.toLowerCase().includes(busca.toLowerCase()) ||
      f.cnpj.includes(busca);
    return matchFiltro && matchBusca;
  });

  const tabs: { key: Filtro; label: string }[] = [
    { key: "Todos",         label: `Todos (${counts.Todos})` },
    { key: "Homologado",    label: `Homologados (${counts.Homologado})` },
    { key: "Qualificação",  label: `Em qualificação (${counts.Qualificação})` },
    { key: "Pré-cadastro",  label: `Pré-cadastro (${counts["Pré-cadastro"]})` },
    { key: "Bloqueado",     label: `Bloqueados (${counts.Bloqueado})` },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Fornecedores cadastrados</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {counts.Todos} fornecedores · atualizado 23/04/2026
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar por nome/CNPJ..."
              className="pl-8 h-8 text-sm w-52"
            />
          </div>
          <Button
            size="sm"
            className="gap-1.5 bg-ctrl hover:bg-ctrl/90 text-ctrl-foreground border-0 text-xs h-8"
            onClick={() => navigate("/controle/fornecedores/novo")}
          >
            <PlusCircle className="h-3.5 w-3.5" /> Novo fornecedor
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setFiltro(t.key)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              filtro === t.key
                ? "bg-ctrl text-ctrl-foreground border-ctrl"
                : "bg-background text-muted-foreground border-border hover:border-ctrl/40"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fornecedor</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">CNPJ</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Categorias</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Score</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Risco</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ação</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  Nenhum fornecedor encontrado.
                </td>
              </tr>
            )}
            {filtrados.map(f => {
              const st = STATUS_CONFIG[f.status];
              return (
                <tr
                  key={f.id}
                  className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                  onClick={() => setSelecionado(f)}
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground">{f.nome}</p>
                    {f.nomeFantasia !== f.nome && (
                      <p className="text-xs text-muted-foreground">{f.nomeFantasia}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{f.cnpj}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {f.categorias.map(c => (
                        <span key={c} className={`px-2 py-0.5 rounded text-[11px] font-medium ${CAT_COLORS[c] ?? "bg-muted text-muted-foreground"}`}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {f.score !== null
                      ? <span className="font-semibold text-foreground">{f.score}/100</span>
                      : <span className="text-muted-foreground">—</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded text-xs font-medium ${RISCO_CONFIG[f.risco]}`}>
                      {f.risco}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${st.dot}`} />
                      <span className={`text-sm font-medium ${st.text}`}>{f.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <Button
                      size="sm"
                      className={`h-7 text-xs px-3 border-0 ${
                        f.status === "Qualificação"
                          ? "bg-orange-500 hover:bg-orange-600 text-white"
                          : "bg-ctrl hover:bg-ctrl/90 text-ctrl-foreground"
                      }`}
                      onClick={() => setSelecionado(f)}
                    >
                      {f.status === "Qualificação" ? "Analisar" : "Ver"}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selecionado && (
        <FornecedorModal
          fornecedor={selecionado}
          onClose={() => setSelecionado(null)}
        />
      )}
    </div>
  );
};

export default FornecedoresBase;
