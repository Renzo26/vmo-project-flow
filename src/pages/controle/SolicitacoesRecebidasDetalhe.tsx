import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft,
  Zap,
  Info,
  Minus,
  CheckCircle2,
  FileText,
  AlertCircle,
  Send,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  User,
  CalendarClock,
  BadgeCheck,
} from "lucide-react";
import { SOLICITACOES, STATUS_CONFIG, ICON_MAP } from "./SolicitacoesRecebidas";

// ─── Mock detalhe por solicitação ─────────────────────────────────────────────

const DETALHE_MOCK: Record<
  string,
  {
    tipo: string;
    subtipo: string;
    area: string;
    prioridade: string;
    prazoDesejado: string;
    escopo: string;
    centroCusto: string;
    codigoOrcamentario: string;
    verbaBadge: string;
    estimativaSolicitante: string;
    fluxoAprovacao: string;
    fornecedores: string[];
    apfConfig: {
      metodologia: string;
      tipoContagem: string;
      tipoDSFP: string;
      rsPf: number;
      tolerancia: string;
      fatorAjuste: string;
      conversao: string;
    };
    contagem: {
      ee: number;
      se: number;
      ce: number;
      ali: number;
      aie: number;
      cfp: number;
    };
    parecer?: {
      conclusao: string;
      justificativa: string;
      estimativaAprovada: string;
      fornecedorIndicado: string;
      observacoes: string;
      emitidoEm: string;
      emitidoPor: string;
    };
  }
> = {
  "043": {
    tipo: "Desenvolvimento de Software",
    subtipo: "Novo desenvolvimento",
    area: "Logística e Operações",
    prioridade: "Alta",
    prazoDesejado: "30/06/2026",
    escopo:
      "Sistema mobile para controle de estoque com integração ao ERP Totvs. Entregáveis: app iOS/Android, APIs REST, documentação técnica e treinamento.",
    centroCusto: "CC-0042-TI",
    codigoOrcamentario: "PROJ-2026-018",
    verbaBadge: "R$ 250.000 ✓",
    estimativaSolicitante: "Não informada",
    fluxoAprovacao: "2 níveis",
    fornecedores: ["TechSoft Ltda", "DevBrasil S.A.", "Soluções Corp", "InfoSystems ME"],
    apfConfig: {
      metodologia: "IFPUG CPM 4.3.1",
      tipoContagem: "DSFP",
      tipoDSFP: "Novo desenvolvimento",
      rsPf: 820,
      tolerancia: "±10%",
      fatorAjuste: "1.00",
      conversao: "(EE+CE+SE)×4.6+(ALI+AIE)×7",
    },
    contagem: { ee: 8, se: 5, ce: 6, ali: 5, aie: 2, cfp: 0 },
  },
  "041": {
    tipo: "Desenvolvimento de Software",
    subtipo: "Integração/APIs",
    area: "TI",
    prioridade: "Normal",
    prazoDesejado: "31/05/2026",
    escopo:
      "Integração via API REST entre CRM Salesforce e ERP Totvs. Sincronização de cadastros, pedidos e faturamento em tempo real.",
    centroCusto: "CC-0010-TI",
    codigoOrcamentario: "PROJ-2026-011",
    verbaBadge: "R$ 80.000 ✓",
    estimativaSolicitante: "R$ 65.000",
    fluxoAprovacao: "1 nível",
    fornecedores: ["TechSoft Ltda", "InfoSystems ME"],
    apfConfig: {
      metodologia: "IFPUG CPM 4.3.1",
      tipoContagem: "DSFP",
      tipoDSFP: "Novo desenvolvimento",
      rsPf: 820,
      tolerancia: "±10%",
      fatorAjuste: "1.00",
      conversao: "(EE+CE+SE)×4.6+(ALI+AIE)×7",
    },
    contagem: { ee: 8, se: 5, ce: 4, ali: 3, aie: 2, cfp: 0 },
  },
  "039": {
    tipo: "Alocação de Profissional",
    subtipo: "Alocação dedicada",
    area: "Plataformas",
    prioridade: "Alta",
    prazoDesejado: "30/04/2027",
    escopo:
      "Alocação de Dev Sênior .NET por 12 meses para sustentação e evolução da plataforma de APIs internas.",
    centroCusto: "CC-0021-TI",
    codigoOrcamentario: "PROJ-2026-015",
    verbaBadge: "R$ 264.000 ✓",
    estimativaSolicitante: "R$ 22.000/mês",
    fluxoAprovacao: "3 níveis",
    fornecedores: ["DevBrasil S.A.", "Soluções Corp"],
    apfConfig: {
      metodologia: "—",
      tipoContagem: "—",
      tipoDSFP: "Não se aplica",
      rsPf: 0,
      tolerancia: "—",
      fatorAjuste: "—",
      conversao: "APF não aplicável para alocação",
    },
    contagem: { ee: 0, se: 0, ce: 0, ali: 0, aie: 0, cfp: 0 },
  },
  "038": {
    tipo: "Segurança da Informação",
    subtipo: "Pentest / Auditoria",
    area: "Segurança",
    prioridade: "Crítica",
    prazoDesejado: "15/05/2026",
    escopo:
      "Pentest black-box na plataforma de pagamentos. Escopo: aplicação web, APIs e infraestrutura. Relatório com CVSS e plano de remediação.",
    centroCusto: "CC-0005-SEG",
    codigoOrcamentario: "PROJ-2026-009",
    verbaBadge: "R$ 50.000 ✓",
    estimativaSolicitante: "R$ 35.000",
    fluxoAprovacao: "2 níveis",
    fornecedores: ["CyberShield", "SecureTech"],
    apfConfig: {
      metodologia: "—",
      tipoContagem: "—",
      tipoDSFP: "Não se aplica",
      rsPf: 0,
      tolerancia: "—",
      fatorAjuste: "—",
      conversao: "APF não aplicável para segurança",
    },
    contagem: { ee: 0, se: 0, ce: 0, ali: 0, aie: 0, cfp: 0 },
    parecer: {
      conclusao: "Aprovada",
      justificativa:
        "Solicitação dentro do orçamento disponível. Escopo técnico adequado e fornecedor habilitado. Estimativa condizente com mercado para pentest de plataforma crítica.",
      estimativaAprovada: "R$ 35.000",
      fornecedorIndicado: "CyberShield",
      observacoes: "Contratação emergencial aprovada dado criticidade da plataforma.",
      emitidoEm: "16/04/2026",
      emitidoPor: "Juliana Costa",
    },
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-3">
    {children}
  </p>
);

const Counter = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) => (
  <div className="flex items-center gap-2">
    <button
      onClick={() => onChange(Math.max(0, value - 1))}
      className="h-7 w-7 rounded-lg border border-border bg-card hover:bg-muted flex items-center justify-center transition-colors"
    >
      <Minus className="h-3.5 w-3.5 text-muted-foreground" />
    </button>
    <span className="w-8 text-center text-sm font-semibold text-foreground">
      {value}
    </span>
    <button
      onClick={() => onChange(value + 1)}
      className="h-7 w-7 rounded-lg border border-border bg-card hover:bg-muted flex items-center justify-center transition-colors"
    >
      <Plus className="h-3.5 w-3.5 text-muted-foreground" />
    </button>
  </div>
);

// ─── Tab: Resumo ──────────────────────────────────────────────────────────────

const TabResumo = ({
  sol,
  det,
}: {
  sol: (typeof SOLICITACOES)[0];
  det: (typeof DETALHE_MOCK)[string];
}) => {
  const statusCfg = STATUS_CONFIG[sol.status];

  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Identificação */}
        <div className="bg-card rounded-xl border border-border p-5 space-y-3">
          <SectionLabel>Identificação</SectionLabel>
          <Row label="Nº solicitação" value={sol.numero} mono />
          <Row
            label="Tipo"
            value={
              <span className="inline-block px-2 py-0.5 rounded bg-ctrl/10 text-ctrl border border-ctrl/30 text-xs font-medium">
                {det.tipo}
              </span>
            }
          />
          <Row label="Subtipo" value={det.subtipo} />
          <Row label="Área" value={det.area} />
          <Row
            label="Prioridade"
            value={
              <span
                className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                  det.prioridade === "Crítica"
                    ? "bg-destructive/10 text-destructive border border-destructive/30"
                    : det.prioridade === "Alta"
                    ? "bg-warning/10 text-warning border border-warning/30"
                    : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                {det.prioridade}
              </span>
            }
          />
          <Row label="Prazo desejado" value={det.prazoDesejado} />

          <div className="pt-1">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-2">
              Escopo declarado
            </p>
            <p className="text-sm text-foreground/80 leading-relaxed">{det.escopo}</p>
          </div>
        </div>

        {/* Orçamento */}
        <div className="bg-card rounded-xl border border-border p-5 space-y-3">
          <SectionLabel>Orçamento</SectionLabel>
          <Row label="Centro de custo" value={det.centroCusto} mono />
          <Row label="Código orçamentário" value={det.codigoOrcamentario} mono />
          <Row
            label="Verba disponível"
            value={
              <span className="text-success font-semibold text-sm">
                {det.verbaBadge}
              </span>
            }
          />
          <Row label="Estimativa solicitante" value={det.estimativaSolicitante} />
          <Row label="Fluxo aprovação" value={det.fluxoAprovacao} />

          <div className="pt-2">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-2">
              Fornecedores habilitados
            </p>
            <div className="flex flex-wrap gap-1.5">
              {det.fornecedores.map((f) => (
                <span
                  key={f}
                  className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground border border-border"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Info bar */}
      {sol.status === "apf_pendente" || sol.status === "em_contagem" ? (
        <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
          <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-foreground">
            O Controle Econômico deve emitir o parecer com base na configuração do Módulo APF.
            Clique em{" "}
            <span className="font-semibold text-primary">Emitir parecer automático</span> para iniciar.
          </p>
        </div>
      ) : sol.status === "parecer_emitido" || sol.status === "aprovada" ? (
        <div className="flex items-start gap-3 rounded-lg border border-success/20 bg-success/5 px-4 py-3">
          <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
          <p className="text-sm text-foreground">
            Parecer emitido. Consulte a aba{" "}
            <span className="font-semibold text-success">Parecer</span> para ver os detalhes da análise.
          </p>
        </div>
      ) : null}
    </div>
  );
};

const Row = ({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) => (
  <div className="flex items-center justify-between gap-4 py-1 border-b border-border/50 last:border-0">
    <span className="text-xs text-muted-foreground shrink-0">{label}</span>
    <span className={`text-sm text-right ${mono ? "font-mono text-foreground" : "text-foreground"}`}>
      {value}
    </span>
  </div>
);

// ─── Tab: Contagem APF ────────────────────────────────────────────────────────

const TabContagemAPF = ({
  det,
  contagem,
  onChange,
  onEmitir,
  onFinalizar,
}: {
  det: (typeof DETALHE_MOCK)[string];
  contagem: { ee: number; se: number; ce: number; ali: number; aie: number; cfp: number };
  onChange: (field: keyof typeof contagem, v: number) => void;
  onEmitir: () => void;
  onFinalizar: () => void;
}) => {
  const { apfConfig } = det;
  const naoPertinente = apfConfig.rsPf === 0;

  const pe = contagem.ee + contagem.se + contagem.ce;
  const al = contagem.ali + contagem.aie;
  const pfsPE = pe * 4.6;
  const pfsAL = al * 7.0;
  const dsfp = pfsPE + pfsAL + contagem.cfp;
  const estimativa = dsfp * apfConfig.rsPf;

  if (naoPertinente) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-warning/20 bg-warning/5 px-4 py-4">
        <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
        <p className="text-sm text-foreground">
          A metodologia APF (<span className="font-medium">Análise de Pontos de Função</span>) não se aplica a este tipo de solicitação ({det.subtipo}).
          Utilize a aba <span className="font-semibold">Parecer</span> para registrar diretamente a análise.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Motor config */}
      <div className="rounded-xl bg-[hsl(270,45%,15%)] border border-[hsl(270,45%,28%)] p-5">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="h-4 w-4 text-[hsl(var(--ctrl))]" />
          <span className="text-sm font-semibold text-white">Motor APF BRAESP — Configuração ativa</span>
        </div>
        <p className="text-xs text-white/50 mb-5">
          Metodologia: {apfConfig.metodologia} · Tipo: {apfConfig.tipoDSFP} · R$/PF: R${" "}
          {apfConfig.rsPf.toLocaleString("pt-BR")},00 (configurado pelo CE)
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: "Metodologia", value: apfConfig.metodologia, sub: "" },
            { label: "Tipo de contagem", value: apfConfig.tipoContagem, sub: apfConfig.tipoDSFP },
            {
              label: "R$/PF contratado",
              value: `R$ ${apfConfig.rsPf.toLocaleString("pt-BR")}`,
              sub: "Teto contratual",
            },
            { label: "Tolerância (±%)", value: apfConfig.tolerancia, sub: "Faixa aceitável" },
            { label: "Fator de ajuste", value: apfConfig.fatorAjuste, sub: "VAF não aplicado (PFS)" },
            { label: "Conversão PF→PFS", value: "Ativa", sub: apfConfig.conversao },
          ].map((item) => (
            <div key={item.label} className="rounded-lg bg-white/5 px-3 py-2.5">
              <p className="text-[9px] font-semibold tracking-widest uppercase text-white/40 mb-1">
                {item.label}
              </p>
              <p className="text-sm font-semibold text-white leading-tight">{item.value}</p>
              {item.sub && <p className="text-[10px] text-white/40 mt-0.5">{item.sub}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* PE section */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
          Identificação dos Processos Elementares (PE)
        </p>

        <div className="flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/15 px-3 py-2.5">
          <Info className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-foreground/80 leading-relaxed">
            <span className="font-semibold text-foreground">PE — Processo Elementar:</span> a menor unidade de atividade significativa para o usuário, autocontida, transação completa que deixa o sistema em estado consistente. Cada PE = 4.6 PFS. Identifique um PE por funcionalidade descrita no escopo.
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              key: "ee" as const,
              label: "EE — Entradas Externas",
              desc: "Dados inseridos pelo usuário que processam informação nos ALs (cadastros, registros, formulários)",
            },
            {
              key: "se" as const,
              label: "SE — Saídas Externas",
              desc: "Dados enviados ao usuário com processamento derivado (relatórios, extratos, dashboards)",
            },
            {
              key: "ce" as const,
              label: "CE — Consultas Externas",
              desc: "Dados recuperados sem processamento derivado (listagens simples, buscas, combos)",
            },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-start justify-between gap-4 py-2 border-b border-border/50 last:border-0"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
              <Counter
                value={contagem[item.key]}
                onChange={(v) => onChange(item.key, v)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* AL section */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
          Identificação dos Arquivos Lógicos (AL)
        </p>

        <div className="flex items-start gap-2 rounded-lg bg-ctrl/5 border border-ctrl/15 px-3 py-2.5">
          <Info className="h-3.5 w-3.5 text-ctrl shrink-0 mt-0.5" />
          <p className="text-xs text-foreground/80 leading-relaxed">
            <span className="font-semibold text-foreground">AL — Arquivo Lógico:</span> grupo de dados logicamente relacionados, reconhecido pelo usuário, mantido dentro da fronteira da aplicação. Cada AL = 7.0 PFS.{" "}
            <span className="text-ctrl font-medium">ALI</span> = arquivo interno;{" "}
            <span className="text-warning font-medium">AIE</span> = arquivo de interface externa.
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              key: "ali" as const,
              label: "ALI — Arquivos Lógicos Internos",
              desc: "Dados mantidos e atualizados pela própria aplicação (entidades do domínio: Produto, Estoque, Movimentação...)",
            },
            {
              key: "aie" as const,
              label: "AIE — Arquivos de Interface Externos",
              desc: "Dados de sistemas externos referenciados mas não mantidos (ERP Totvs, AD, catálogos externos)",
            },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-start justify-between gap-4 py-2 border-b border-border/50 last:border-0"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
              <Counter
                value={contagem[item.key]}
                onChange={(v) => onChange(item.key, v)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Result */}
      <div className="bg-card rounded-xl border border-border p-5">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-4">
          Resultado da contagem PFS — Metodologia IFPUG
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { label: "Processos elementares (PE)", value: pe.toString() },
            { label: "Arquivos lógicos (AL)", value: al.toString() },
            {
              label: "Total PFS (ADD)",
              value: dsfp.toFixed(1),
              accent: true,
            },
            {
              label: "Estimativa de valor",
              value: `R$ ${estimativa.toLocaleString("pt-BR")}`,
              accent: true,
              color: "text-success",
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-lg p-3 text-center ${
                item.accent ? "bg-ctrl/5 border border-ctrl/20" : "bg-muted/50"
              }`}
            >
              <p className={`text-2xl font-bold ${item.color ?? "text-foreground"}`}>
                {item.value}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">{item.label}</p>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground font-mono leading-relaxed">
          PFS(PE) = (#EE+#CE+#SE) × 4.6 = ({contagem.ee}+{contagem.ce}+{contagem.se}) × 4.6 ={" "}
          {pfsPE.toFixed(1)}
          {"   "}·{"   "}
          PFS(AL) = (#ALI+#AIE) × 7.0 = ({contagem.ali}+{contagem.aie}) × 7.0 = {pfsAL.toFixed(1)}
          {"   "}·{"   "}
          DSFP = ADD = {dsfp.toFixed(1)} + {contagem.cfp} = {dsfp.toFixed(1)} PFS
        </p>
      </div>

      {/* CFP + actions */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-medium text-foreground mb-1">
            Funcionalidades de conversão (CFP)
          </p>
          <div className="flex items-center gap-2">
            <Counter
              value={contagem.cfp}
              onChange={(v) => onChange("cfp", v)}
            />
            <span className="text-xs text-muted-foreground">PEs para carga inicial de dados</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-1.5 border-ctrl text-ctrl hover:bg-ctrl/10"
            onClick={onEmitir}
          >
            <Zap className="h-4 w-4" />
            Emitir parecer automático
          </Button>
          <Button
            className="gap-1.5 bg-success hover:bg-success/90 text-success-foreground"
            onClick={onFinalizar}
          >
            <CheckCircle2 className="h-4 w-4" />
            Finalizar contagem
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Tab: Parecer ─────────────────────────────────────────────────────────────

type Conclusao = "aprovada" | "aprovada_ressalvas" | "rejeitada";

interface ParecerForm {
  conclusao: Conclusao | "";
  estimativaAprovada: string;
  valorFornecedor: string;
  fornecedorIndicado: string;
  justificativa: string;
  observacoes: string;
}

const CONCLUSAO_OPTIONS: { value: Conclusao; label: string; desc: string; style: string; icon: React.ElementType }[] = [
  {
    value: "aprovada",
    label: "Aprovada",
    desc: "Solicitação aprovada conforme análise técnica e orçamentária",
    style: "border-success/40 bg-success/5 text-success",
    icon: ThumbsUp,
  },
  {
    value: "aprovada_ressalvas",
    label: "Aprovada com ressalvas",
    desc: "Aprovação condicionada a ajustes ou esclarecimentos adicionais",
    style: "border-warning/40 bg-warning/5 text-warning",
    icon: AlertTriangle,
  },
  {
    value: "rejeitada",
    label: "Rejeitada",
    desc: "Solicitação não aprovada — necessário revisar escopo ou orçamento",
    style: "border-destructive/40 bg-destructive/5 text-destructive",
    icon: ThumbsDown,
  },
];

const TabParecer = ({
  det,
  contagemResultado,
  onParecerEmitido,
}: {
  det: (typeof DETALHE_MOCK)[string];
  contagemResultado: { dsfp: number; estimativa: number };
  onParecerEmitido: (p: ParecerForm) => void;
}) => {
  const [form, setForm] = useState<ParecerForm>({
    conclusao: "",
    estimativaAprovada:
      contagemResultado.estimativa > 0
        ? `R$ ${contagemResultado.estimativa.toLocaleString("pt-BR")}`
        : det.estimativaSolicitante !== "Não informada"
        ? det.estimativaSolicitante
        : "",
    valorFornecedor: "",
    fornecedorIndicado: det.fornecedores[0] ?? "",
    justificativa: "",
    observacoes: "",
  });
  const [emitido, setEmitido] = useState<ParecerForm | null>(
    det.parecer
      ? {
          conclusao: det.parecer.conclusao.toLowerCase().replace(" ", "_") as Conclusao,
          estimativaAprovada: det.parecer.estimativaAprovada,
          fornecedorIndicado: det.parecer.fornecedorIndicado,
          justificativa: det.parecer.justificativa,
          observacoes: det.parecer.observacoes,
        }
      : null
  );

  const handleEmitir = () => {
    if (!form.conclusao || !form.justificativa.trim()) return;
    setEmitido(form);
    onParecerEmitido(form);
  };

  // ── View mode (already emitted) ──
  if (emitido) {
    const conclusaoLabel =
      CONCLUSAO_OPTIONS.find((o) => o.value === emitido.conclusao)?.label ?? emitido.conclusao;
    const conclusaoCfg = CONCLUSAO_OPTIONS.find((o) => o.value === emitido.conclusao);
    const ConclusaoIcon = conclusaoCfg?.icon ?? CheckCircle2;

    return (
      <div className="space-y-4">
        {/* Banner */}
        <div
          className={`flex items-center justify-between gap-4 rounded-xl border px-5 py-4 ${
            emitido.conclusao === "aprovada"
              ? "bg-success/5 border-success/20"
              : emitido.conclusao === "aprovada_ressalvas"
              ? "bg-warning/5 border-warning/20"
              : "bg-destructive/5 border-destructive/20"
          }`}
        >
          <div className="flex items-center gap-3">
            <ConclusaoIcon
              className={`h-5 w-5 shrink-0 ${
                emitido.conclusao === "aprovada"
                  ? "text-success"
                  : emitido.conclusao === "aprovada_ressalvas"
                  ? "text-warning"
                  : "text-destructive"
              }`}
            />
            <div>
              <p className="text-sm font-semibold text-foreground">
                Parecer:{" "}
                <span
                  className={
                    emitido.conclusao === "aprovada"
                      ? "text-success"
                      : emitido.conclusao === "aprovada_ressalvas"
                      ? "text-warning"
                      : "text-destructive"
                  }
                >
                  {conclusaoLabel}
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {det.parecer
                  ? `Emitido em ${det.parecer.emitidoEm} por ${det.parecer.emitidoPor}`
                  : `Emitido em ${new Date().toLocaleDateString("pt-BR")} por Juliana Costa`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg border border-border">
              <BadgeCheck className="h-3.5 w-3.5" />
              Parecer oficial registrado
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Análise técnica */}
          <div className="bg-card rounded-xl border border-border p-5 space-y-4">
            <SectionLabel>Análise técnica</SectionLabel>
            <div>
              <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-2">
                Justificativa
              </p>
              <p className="text-sm text-foreground/80 leading-relaxed">{emitido.justificativa}</p>
            </div>
            {emitido.observacoes && (
              <div className="pt-3 border-t border-border/50">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-2">
                  Observações
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed">{emitido.observacoes}</p>
              </div>
            )}
          </div>

          {/* Decisão econômica */}
          <div className="bg-card rounded-xl border border-border p-5 space-y-3">
            <SectionLabel>Decisão econômica</SectionLabel>
            <Row
              label="Estimativa aprovada (APF)"
              value={<span className="text-success font-semibold">{emitido.estimativaAprovada || "—"}</span>}
            />
            {emitido.valorFornecedor && (
              <Row
                label="Valor informado pelo fornecedor"
                value={<span className="font-medium">{emitido.valorFornecedor}</span>}
              />
            )}
            {emitido.valorFornecedor && emitido.estimativaAprovada && (() => {
              const parseVal = (s: string) =>
                parseFloat(s.replace(/[R$\s.]/g, "").replace(",", ".")) || 0;
              const estimado = parseVal(emitido.estimativaAprovada);
              const fornecedor = parseVal(emitido.valorFornecedor);
              if (fornecedor === 0 || estimado === 0) return null;
              const dentro = fornecedor <= estimado;
              return (
                <Row
                  label="Status orçamentário"
                  value={
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${
                      dentro
                        ? "bg-success/10 text-success border-success/30"
                        : "bg-destructive/10 text-destructive border-destructive/30"
                    }`}>
                      {dentro ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                      {dentro ? "Dentro do orçamento" : "Acima do orçamento"}
                    </span>
                  }
                />
              );
            })()}
            <Row label="Fornecedor indicado" value={emitido.fornecedorIndicado || "—"} />
            {contagemResultado.dsfp > 0 && (
              <Row
                label="Total PFS contado"
                value={<span className="font-mono">{contagemResultado.dsfp.toFixed(1)} PFS</span>}
              />
            )}
            <Row
              label="Emitido em"
              value={det.parecer?.emitidoEm ?? new Date().toLocaleDateString("pt-BR")}
            />
            <Row label="Responsável" value={det.parecer?.emitidoPor ?? "Juliana Costa"} />
          </div>
        </div>
      </div>
    );
  }

  // ── Form mode ──
  const canSubmit = form.conclusao !== "" && form.justificativa.trim().length >= 20;

  return (
    <div className="space-y-4">
      {/* Aviso informativo */}
      <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-foreground">
          Finalize a contagem APF e clique em{" "}
          <span className="font-semibold text-primary">Emitir parecer automático</span> para gerar o
          parecer com base nas regras configuradas.
        </p>
      </div>

      {/* Resumo APF (se aplicável) */}
      {contagemResultado.dsfp > 0 && (
        <div className="bg-card rounded-xl border border-border p-5">
          <SectionLabel>Resumo da contagem APF</SectionLabel>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total PFS (ADD)", value: `${contagemResultado.dsfp.toFixed(1)} PFS` },
              { label: "R$/PF configurado", value: `R$ ${det.apfConfig.rsPf.toLocaleString("pt-BR")}` },
              {
                label: "Estimativa calculada",
                value: `R$ ${contagemResultado.estimativa.toLocaleString("pt-BR")}`,
                highlight: true,
              },
            ].map((item) => (
              <div
                key={item.label}
                className={`rounded-lg p-3 text-center ${
                  item.highlight ? "bg-success/5 border border-success/20" : "bg-muted/50"
                }`}
              >
                <p className={`text-lg font-bold ${item.highlight ? "text-success" : "text-foreground"}`}>
                  {item.value}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conclusão */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <SectionLabel>Conclusão do parecer *</SectionLabel>
        <div className="grid sm:grid-cols-3 gap-3">
          {CONCLUSAO_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const selected = form.conclusao === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setForm((f) => ({ ...f, conclusao: opt.value }))}
                className={`flex flex-col gap-2 rounded-xl border-2 p-4 text-left transition-all ${
                  selected
                    ? opt.style
                    : "border-border bg-card hover:border-border/70 hover:bg-muted/30"
                }`}
              >
                <Icon className={`h-5 w-5 ${selected ? "" : "text-muted-foreground"}`} />
                <div>
                  <p className={`text-sm font-semibold ${selected ? "" : "text-foreground"}`}>
                    {opt.label}
                  </p>
                  <p className={`text-xs mt-0.5 ${selected ? "opacity-80" : "text-muted-foreground"}`}>
                    {opt.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Campos econômicos */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <SectionLabel>Decisão econômica</SectionLabel>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Estimativa aprovada (APF)</label>
            <Input
              placeholder="Ex: R$ 111.684"
              value={form.estimativaAprovada}
              onChange={(e) => setForm((f) => ({ ...f, estimativaAprovada: e.target.value }))}
              className="h-9 text-sm"
            />
            {contagemResultado.estimativa > 0 && (
              <p className="text-[11px] text-muted-foreground">
                Calculado via APF:{" "}
                <button
                  className="text-primary underline"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      estimativaAprovada: `R$ ${contagemResultado.estimativa.toLocaleString("pt-BR")}`,
                    }))
                  }
                >
                  R$ {contagemResultado.estimativa.toLocaleString("pt-BR")}
                </button>
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Valor informado pelo fornecedor</label>
            <Input
              placeholder="Ex: R$ 108.000"
              value={form.valorFornecedor}
              onChange={(e) => setForm((f) => ({ ...f, valorFornecedor: e.target.value }))}
              className="h-9 text-sm"
            />
          </div>

          {/* Indicador de orçamento */}
          {(() => {
            const parseVal = (s: string) =>
              parseFloat(s.replace(/[R$\s.]/g, "").replace(",", ".")) || 0;
            const estimado = parseVal(form.estimativaAprovada);
            const fornecedor = parseVal(form.valorFornecedor);
            if (!form.valorFornecedor || !form.estimativaAprovada || fornecedor === 0 || estimado === 0)
              return null;
            const dentroOrcamento = fornecedor <= estimado;
            const diff = Math.abs(estimado - fornecedor);
            const pct = ((diff / estimado) * 100).toFixed(1);
            return (
              <div className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 ${
                dentroOrcamento
                  ? "bg-success/5 border-success/25"
                  : "bg-destructive/5 border-destructive/25"
              }`}>
                {dentroOrcamento ? (
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={`text-xs font-semibold ${dentroOrcamento ? "text-success" : "text-destructive"}`}>
                    {dentroOrcamento ? "Dentro do orçamento" : "Acima do orçamento"}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {dentroOrcamento
                      ? `Economia de R$ ${diff.toLocaleString("pt-BR")} (${pct}% abaixo da estimativa)`
                      : `Excede em R$ ${diff.toLocaleString("pt-BR")} (${pct}% acima da estimativa)`}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                    Validação automática pelo backend será ativada futuramente
                  </p>
                </div>
              </div>
            );
          })()}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Fornecedor indicado</label>
            <select
              value={form.fornecedorIndicado}
              onChange={(e) => setForm((f) => ({ ...f, fornecedorIndicado: e.target.value }))}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Selecionar fornecedor</option>
              {det.fornecedores.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <SectionLabel>Responsável pelo parecer</SectionLabel>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
            <div className="h-9 w-9 rounded-full bg-ctrl/15 flex items-center justify-center shrink-0">
              <User className="h-4 w-4 text-ctrl" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Juliana Costa</p>
              <p className="text-xs text-muted-foreground">Controle Econômico · Suprimentos TI</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5" />
            <span>Data de emissão: {new Date().toLocaleDateString("pt-BR")}</span>
          </div>
        </div>
      </div>

      {/* Justificativa + Observações */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <SectionLabel>Análise técnica</SectionLabel>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-foreground">
              Justificativa *{" "}
              <span className="text-muted-foreground font-normal">(mínimo 20 caracteres)</span>
            </label>
            <span
              className={`text-[11px] ${
                form.justificativa.length >= 20 ? "text-success" : "text-muted-foreground"
              }`}
            >
              {form.justificativa.length} / 20+
            </span>
          </div>
          <Textarea
            placeholder="Descreva a análise técnica e econômica da solicitação, fundamentando a conclusão..."
            value={form.justificativa}
            onChange={(e) => setForm((f) => ({ ...f, justificativa: e.target.value }))}
            className="text-sm min-h-[100px] resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">
            Observações{" "}
            <span className="text-muted-foreground font-normal">(opcional)</span>
          </label>
          <Textarea
            placeholder="Condicionantes, ressalvas, orientações para a próxima etapa..."
            value={form.observacoes}
            onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
            className="text-sm min-h-[72px] resize-none"
          />
        </div>
      </div>

      {/* Ações */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-xs text-muted-foreground">
          * Campos obrigatórios — o parecer não pode ser alterado após emissão.
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            Salvar rascunho
          </Button>
          <Button
            size="sm"
            disabled={!canSubmit}
            onClick={handleEmitir}
            className="gap-1.5 bg-ctrl hover:bg-ctrl/90 text-ctrl-foreground disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
            Emitir parecer oficial
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

type TabDetalhe = "resumo" | "parecer";

const TABS_DETALHE: { key: TabDetalhe; label: string }[] = [
  { key: "resumo", label: "Resumo da solicitação" },
  { key: "parecer", label: "Parecer" },
];

const SolicitacoesRecebidasDetalhe = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabDetalhe>("resumo");

  const sol = SOLICITACOES.find((s) => s.id === id);
  const det = id ? DETALHE_MOCK[id] : undefined;

  const [contagem, setContagem] = useState(
    det?.contagem ?? { ee: 0, se: 0, ce: 0, ali: 0, aie: 0, cfp: 0 }
  );

  if (!sol || !det) {
    return (
      <div className="text-center py-20 text-sm text-muted-foreground">
        Solicitação não encontrada.
      </div>
    );
  }

  const Icon = ICON_MAP[sol.iconKey];
  const statusCfg = STATUS_CONFIG[sol.status];

  const handleContagemChange = (
    field: keyof typeof contagem,
    v: number
  ) => setContagem((prev) => ({ ...prev, [field]: v }));

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${sol.iconBg}`}>
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Análise APF — {sol.numero}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {sol.titulo} · Área: {sol.area} · Solicitante: {sol.solicitante}
            </p>
          </div>
        </div>
      </div>

      {/* ── Sub-header: Voltar + Emitir ── */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate("/controle/solicitacoes/recebidas")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </button>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${statusCfg.className}`}>
            {statusCfg.label}
          </span>
          <Button
            size="sm"
            className="gap-1.5 bg-success hover:bg-success/90 text-success-foreground"
            onClick={() => setActiveTab("parecer")}
          >
            <FileText className="h-3.5 w-3.5" />
            Emitir parecer automático
            <Zap className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="border-b border-border">
        <div className="flex items-center gap-1">
          {TABS_DETALHE.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.key
                  ? "border-ctrl text-ctrl"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ── */}
      {activeTab === "resumo" && <TabResumo sol={sol} det={det} />}
      {activeTab === "parecer" && (
        <TabParecer
          det={det}
          contagemResultado={{
            dsfp: (() => {
              const pe = contagem.ee + contagem.se + contagem.ce;
              const al = contagem.ali + contagem.aie;
              return pe * 4.6 + al * 7.0 + contagem.cfp;
            })(),
            estimativa: (() => {
              const pe = contagem.ee + contagem.se + contagem.ce;
              const al = contagem.ali + contagem.aie;
              const dsfp = pe * 4.6 + al * 7.0 + contagem.cfp;
              return Math.round(dsfp * det.apfConfig.rsPf);
            })(),
          }}
          onParecerEmitido={() => {}}
        />
      )}
    </div>
  );
};

export default SolicitacoesRecebidasDetalhe;
