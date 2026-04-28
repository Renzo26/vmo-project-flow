import { useState, useRef } from "react";
import {
  UploadCloud, CheckCircle2, AlertTriangle, XCircle,
  Clock, ScanLine, Plus, X, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ─── Types ────────────────────────────────────────────────────────────────────

type DocStatus = "valido" | "vencendo" | "vencido" | "pendente" | "validando";

interface Documento {
  id: string;
  nome: string;
  obrigatorio: boolean;
  arquivo?: string;
  dataVencimento?: string;
  status: DocStatus;
  custom?: boolean;
}

// ─── Slots predefinidos (obrigatórios e comuns) ───────────────────────────────

const SLOTS_OBRIGATORIOS: Omit<Documento, "status">[] = [
  { id: "cnd-federal",   nome: "Certidão Negativa de Débitos Federais",    obrigatorio: true  },
  { id: "cnd-estadual",  nome: "Certidão Negativa Estadual",               obrigatorio: true  },
  { id: "cnd-municipal", nome: "Certidão Negativa Municipal (ISS)",        obrigatorio: true  },
  { id: "fgts",          nome: "Certificado de Regularidade do FGTS",     obrigatorio: true  },
  { id: "cndt",          nome: "Certidão Negativa de Débitos Trabalhistas",obrigatorio: true  },
  { id: "contrato",      nome: "Contrato Social / Última Alteração",       obrigatorio: true  },
];

const DOCS_INICIAIS: Documento[] = SLOTS_OBRIGATORIOS.map(s => ({ ...s, status: "pendente" }));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const diasRestantes = (data?: string): number | null => {
  if (!data) return null;
  return Math.ceil((new Date(data).getTime() - Date.now()) / 86_400_000);
};

const calcStatus = (dataVencimento?: string): DocStatus => {
  const dias = diasRestantes(dataVencimento);
  if (dias === null) return "valido";
  if (dias < 0) return "vencido";
  if (dias <= 30) return "vencendo";
  return "valido";
};

const STATUS_CFG: Record<DocStatus, { label: string; badge: string; icon: React.ElementType }> = {
  valido:    { label: "Válido",         badge: "bg-success/10 text-success border-success/25",           icon: CheckCircle2 },
  vencendo:  { label: "Vence em breve", badge: "bg-warning/10 text-warning border-warning/25",           icon: AlertTriangle },
  vencido:   { label: "Vencido",        badge: "bg-destructive/10 text-destructive border-destructive/25",icon: XCircle },
  pendente:  { label: "Pendente",       badge: "bg-muted text-muted-foreground border-border",           icon: Clock },
  validando: { label: "Validando OCR…", badge: "bg-primary/10 text-primary border-primary/25",           icon: ScanLine },
};

// ─── Modal de upload ──────────────────────────────────────────────────────────

interface UploadModalProps {
  nomeInicial?: string;
  pedirNome?: boolean;
  onConfirm: (nome: string, arquivo: File, dataVencimento?: string) => void;
  onClose: () => void;
}

const UploadModal = ({ nomeInicial = "", pedirNome = false, onConfirm, onClose }: UploadModalProps) => {
  const inputRef   = useRef<HTMLInputElement>(null);
  const [nome, setNome]       = useState(nomeInicial);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [data, setData]       = useState("");
  const [drag, setDrag]       = useState(false);

  const handleFile = (f: File) => setArquivo(f);
  const podeEnviar = arquivo && (!pedirNome || nome.trim().length > 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
          <h3 className="text-base font-semibold text-foreground">
            {pedirNome ? "Adicionar documento" : `Enviar — ${nomeInicial}`}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Nome (somente ao adicionar documento livre) */}
          {pedirNome && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Nome do documento *</label>
              <Input
                placeholder="Ex: Alvará de Funcionamento, Apólice de Seguro…"
                value={nome}
                onChange={e => setNome(e.target.value)}
                className="h-9 text-sm"
                autoFocus
              />
            </div>
          )}

          {/* Drop zone */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Arquivo *</label>
            <div
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
              onClick={() => inputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-7 cursor-pointer transition-colors ${
                drag ? "border-primary bg-primary/5" : arquivo ? "border-success bg-success/5" : "border-border hover:border-primary/40 hover:bg-muted/30"
              }`}
            >
              <input ref={inputRef} type="file" accept=".pdf,image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) { handleFile(f); e.target.value = ""; } }} />
              {arquivo ? (
                <>
                  <FileText className="h-7 w-7 text-success" />
                  <p className="text-sm font-medium text-foreground">{arquivo.name}</p>
                  <p className="text-xs text-muted-foreground">{(arquivo.size / 1024).toFixed(0)} KB · clique para trocar</p>
                </>
              ) : (
                <>
                  <UploadCloud className="h-7 w-7 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Arraste ou <span className="text-primary font-medium">clique para selecionar</span></p>
                  <p className="text-xs text-muted-foreground">PDF ou imagem · máx. 10 MB</p>
                </>
              )}
            </div>
          </div>

          {/* Data de vencimento (opcional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Data de vencimento <span className="text-muted-foreground font-normal">(opcional — será lida via OCR se não informada)</span>
            </label>
            <Input
              type="date"
              value={data}
              onChange={e => setData(e.target.value)}
              className="h-9 text-sm"
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 pb-5">
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button
            size="sm"
            disabled={!podeEnviar}
            onClick={() => podeEnviar && onConfirm(nome, arquivo!, data || undefined)}
            className="gap-1.5 bg-[hsl(var(--sidebar-forn-bg))] hover:opacity-90 text-white"
          >
            <UploadCloud className="h-3.5 w-3.5" />
            Enviar documento
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Linha de documento ───────────────────────────────────────────────────────

const DocRow = ({
  doc,
  onEnviar,
}: {
  doc: Documento;
  onEnviar: (id: string) => void;
}) => {
  const { label, badge, icon: Icon } = STATUS_CFG[doc.status];
  const dias = diasRestantes(doc.dataVencimento);

  return (
    <div className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border bg-card ${
      doc.status === "vencido"  ? "border-destructive/30" :
      doc.status === "vencendo" ? "border-warning/30"     : "border-border"
    }`}>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-foreground leading-tight">{doc.nome}</p>
          {doc.obrigatorio && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border font-medium shrink-0">
              Obrigatório
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {doc.arquivo ?? "Nenhum arquivo enviado"}
        </p>
      </div>

      {/* Vencimento */}
      <div className="w-32 shrink-0 text-right hidden sm:block">
        {doc.dataVencimento ? (
          <>
            <p className="text-xs text-muted-foreground">
              {new Date(doc.dataVencimento).toLocaleDateString("pt-BR")}
            </p>
            {dias !== null && (
              <p className={`text-[11px] font-medium mt-0.5 ${
                dias < 0 ? "text-destructive" : dias <= 30 ? "text-warning" : "text-muted-foreground"
              }`}>
                {dias < 0 ? `${Math.abs(dias)}d vencido` : `${dias}d restantes`}
              </p>
            )}
          </>
        ) : (
          <p className="text-xs text-muted-foreground">—</p>
        )}
      </div>

      {/* Badge */}
      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 ${badge} ${
        doc.status === "validando" ? "animate-pulse" : ""
      }`}>
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>

      {/* Botão */}
      <Button
        size="sm"
        variant="outline"
        disabled={doc.status === "validando"}
        onClick={() => onEnviar(doc.id)}
        className="h-8 gap-1.5 shrink-0 text-xs"
      >
        <UploadCloud className="h-3.5 w-3.5" />
        {doc.arquivo ? "Substituir" : "Enviar"}
      </Button>
    </div>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState = ({ onAdicionar }: { onAdicionar: () => void }) => (
  <div className="flex flex-col items-center justify-center gap-4 py-16 px-6 rounded-2xl border-2 border-dashed border-border bg-muted/20">
    <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center">
      <FileText className="h-7 w-7 text-muted-foreground" />
    </div>
    <div className="text-center">
      <p className="text-sm font-semibold text-foreground">Nenhum documento enviado ainda</p>
      <p className="text-xs text-muted-foreground mt-1">Adicione seus documentos e certidões abaixo</p>
    </div>
    <Button onClick={onAdicionar} className="gap-1.5 bg-[hsl(var(--sidebar-forn-bg))] hover:opacity-90 text-white">
      <Plus className="h-4 w-4" />
      Anexar documento
    </Button>
  </div>
);

// ─── Página principal ─────────────────────────────────────────────────────────

const FornecedorDocumentos = () => {
  const [docs, setDocs]           = useState<Documento[]>(DOCS_INICIAIS);
  const [modalId, setModalId]     = useState<string | null>(null); // id existente
  const [modalNovo, setModalNovo] = useState(false);               // doc livre

  const vencidos = docs.filter(d => d.status === "vencido").length;
  const vencendo = docs.filter(d => d.status === "vencendo").length;

  const docAtivo = modalId ? docs.find(d => d.id === modalId) : undefined;

  const processarUpload = (id: string, nome: string, arquivo: File, dataVencimento?: string) => {
    setDocs(prev => prev.map(d => d.id !== id ? d : {
      ...d,
      nome,
      arquivo: arquivo.name,
      status: "validando",
      dataVencimento: undefined,
    }));
    setModalId(null);
    setModalNovo(false);

    // Simula OCR: após 2.5s resolve o vencimento
    setTimeout(() => {
      setDocs(prev => prev.map(d => {
        if (d.id !== id) return d;
        const venc = dataVencimento
          ? dataVencimento
          : (() => { const dt = new Date(); dt.setMonth(dt.getMonth() + 6); return dt.toISOString().split("T")[0]; })();
        return { ...d, status: calcStatus(venc), dataVencimento: venc };
      }));
    }, 2500);
  };

  const adicionarNovo = (nome: string, arquivo: File, dataVencimento?: string) => {
    const novoId = `custom-${Date.now()}`;
    setDocs(prev => [...prev, {
      id: novoId, nome, obrigatorio: false, arquivo: arquivo.name,
      status: "validando", dataVencimento: undefined, custom: true,
    }]);
    setModalNovo(false);

    setTimeout(() => {
      setDocs(prev => prev.map(d => {
        if (d.id !== novoId) return d;
        const venc = dataVencimento
          ? dataVencimento
          : (() => { const dt = new Date(); dt.setMonth(dt.getMonth() + 6); return dt.toISOString().split("T")[0]; })();
        return { ...d, status: calcStatus(venc), dataVencimento: venc };
      }));
    }, 2500);
  };

  const obrigatorios = docs.filter(d => d.obrigatorio);
  const complementares = docs.filter(d => !d.obrigatorio);
  const temQualquerDoc = docs.some(d => d.arquivo);

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Documentos e Certidões</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Envie e mantenha seus documentos atualizados. O sistema valida o vencimento automaticamente via OCR.
          </p>
        </div>
        <Button
          onClick={() => setModalNovo(true)}
          className="gap-1.5 shrink-0 bg-[hsl(var(--sidebar-forn-bg))] hover:opacity-90 text-white"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Adicionar documento
        </Button>
      </div>

      {/* Alertas de situação */}
      {(vencidos > 0 || vencendo > 0) && (
        <div className="space-y-2">
          {vencidos > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm">
              <XCircle className="h-4 w-4 text-destructive shrink-0" />
              <span>
                <strong>{vencidos} documento{vencidos > 1 ? "s" : ""} vencido{vencidos > 1 ? "s" : ""}.</strong>{" "}
                Substitua para manter a homologação ativa.
              </span>
            </div>
          )}
          {vencendo > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-warning/25 bg-warning/5 px-4 py-3 text-sm">
              <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
              <span>
                <strong>{vencendo} documento{vencendo > 1 ? "s vencem" : " vence"} em breve.</strong>{" "}
                Você receberá um e-mail de alerta 30 dias antes do vencimento.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Empty state geral */}
      {!temQualquerDoc && (
        <EmptyState onAdicionar={() => setModalNovo(true)} />
      )}

      {/* Obrigatórios */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Obrigatórios</p>
        {obrigatorios.map(doc => (
          <DocRow key={doc.id} doc={doc} onEnviar={id => setModalId(id)} />
        ))}
      </div>

      {/* Complementares */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Complementares</p>
        <p className="text-xs text-muted-foreground -mt-1 mb-1">Opcionais — reforçam o score de homologação</p>
        {complementares.map(doc => (
          <DocRow key={doc.id} doc={doc} onEnviar={id => setModalId(id)} />
        ))}
        {/* Botão de adicionar no final */}
        <button
          onClick={() => setModalNovo(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Adicionar outro documento
        </button>
      </div>

      {/* Modal — enviar/substituir documento existente */}
      {modalId && docAtivo && (
        <UploadModal
          nomeInicial={docAtivo.nome}
          pedirNome={false}
          onConfirm={(nome, arquivo, data) => processarUpload(modalId, nome, arquivo, data)}
          onClose={() => setModalId(null)}
        />
      )}

      {/* Modal — adicionar documento livre */}
      {modalNovo && (
        <UploadModal
          pedirNome
          onConfirm={(nome, arquivo, data) => adicionarNovo(nome, arquivo, data)}
          onClose={() => setModalNovo(false)}
        />
      )}
    </div>
  );
};

export default FornecedorDocumentos;
