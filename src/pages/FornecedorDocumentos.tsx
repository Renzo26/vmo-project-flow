import { useState, useRef } from "react";
import {
  UploadCloud, CheckCircle2, AlertTriangle, XCircle,
  Clock, ScanLine, Plus, X, FileText, Paperclip, RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// ─── Types ────────────────────────────────────────────────────────────────────

type DocStatus = "valido" | "vencendo" | "vencido" | "pendente" | "validando";

interface Documento {
  id: string;
  nome: string;
  obrigatorio: boolean;
  arquivo?: string;
  dataEmissao?: string;
  dataVencimento?: string;
  observacao?: string;
  status: DocStatus;
  custom?: boolean;
}

// ─── Slots predefinidos ───────────────────────────────────────────────────────

const SLOTS_OBRIGATORIOS: Omit<Documento, "status">[] = [
  { id: "cnd-federal",   nome: "Certidão Negativa de Débitos Federais",    obrigatorio: true },
  { id: "cnd-estadual",  nome: "Certidão Negativa Estadual",               obrigatorio: true },
  { id: "cnd-municipal", nome: "Certidão Negativa Municipal (ISS)",        obrigatorio: true },
  { id: "fgts",          nome: "Certificado de Regularidade do FGTS",      obrigatorio: true },
  { id: "cndt",          nome: "Certidão Negativa de Débitos Trabalhistas", obrigatorio: true },
  { id: "contrato",      nome: "Contrato Social / Última Alteração",        obrigatorio: true },
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
  valido:    { label: "Válido",         badge: "bg-green-100 text-green-700 border-green-200",        icon: CheckCircle2 },
  vencendo:  { label: "Vence em breve", badge: "bg-yellow-100 text-yellow-700 border-yellow-200",     icon: AlertTriangle },
  vencido:   { label: "Vencido",        badge: "bg-red-100 text-red-700 border-red-200",              icon: XCircle },
  pendente:  { label: "Pendente",       badge: "bg-gray-100 text-gray-600 border-gray-200",           icon: Clock },
  validando: { label: "Validando…",     badge: "bg-blue-100 text-blue-700 border-blue-200",           icon: ScanLine },
};

const FORN_COLOR = "hsl(var(--sidebar-forn-bg))";

// ─── Modal de upload ──────────────────────────────────────────────────────────

interface UploadModalProps {
  titulo: string;
  isNovo?: boolean;
  onConfirm: (dados: { nome?: string; arquivo: File; emissao: string; validade: string; obs: string }) => void;
  onClose: () => void;
}

const UploadModal = ({ titulo, isNovo, onConfirm, onClose }: UploadModalProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [arquivo, setArquivo]   = useState<File | null>(null);
  const [drag, setDrag]         = useState(false);
  const [nomeDoc, setNomeDoc]   = useState("");
  const [emissao, setEmissao]   = useState("");
  const [validade, setValidade] = useState("");
  const [obs, setObs]           = useState("");

  const podeEnviar = !!arquivo && !!emissao && !!validade && (!isNovo || nomeDoc.trim().length > 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
          <div>
            <h3 className="text-base font-semibold text-foreground">{titulo}</h3>
            {!isNovo && <p className="text-xs text-muted-foreground mt-0.5">Preencha os dados do documento antes de enviar</p>}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Nome (somente novo doc livre) */}
          {isNovo && (
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block">NOME DO DOCUMENTO *</Label>
              <Input value={nomeDoc} onChange={e => setNomeDoc(e.target.value)}
                placeholder="Ex: Alvará de Funcionamento, Apólice de Seguro…"
                className="h-9 text-sm" autoFocus />
            </div>
          )}

          {/* Drop zone */}
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-2 block">ANEXAR ARQUIVO *</Label>
            {arquivo ? (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
                <Paperclip className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm flex-1 truncate">{arquivo.name}</span>
                <span className="text-xs text-muted-foreground shrink-0">{(arquivo.size / 1024).toFixed(0)} KB</span>
                <button onClick={() => setArquivo(null)} className="text-muted-foreground hover:text-destructive transition-colors ml-1">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={e => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) setArquivo(f); }}
                onClick={() => fileRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-7 cursor-pointer transition-colors ${
                  drag ? "border-green-500 bg-green-50" : "border-border hover:border-green-500/40 hover:bg-muted/30"
                }`}
              >
                <UploadCloud className="h-7 w-7 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Arraste ou <span className="font-medium" style={{ color: FORN_COLOR }}>clique para selecionar</span>
                </p>
                <p className="text-xs text-muted-foreground">PDF ou imagem · máx. 10 MB</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept=".pdf,image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) { setArquivo(f); e.target.value = ""; } }} />
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block">DATA DE EMISSÃO *</Label>
              <Input type="date" value={emissao} onChange={e => setEmissao(e.target.value)} className="h-9 text-sm" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1 block">DATA DE VALIDADE *</Label>
              <Input type="date" value={validade} onChange={e => setValidade(e.target.value)} className="h-9 text-sm"
                min={new Date().toISOString().split("T")[0]} />
            </div>
          </div>

          {/* Observações */}
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1 block">OBSERVAÇÕES</Label>
            <Textarea value={obs} onChange={e => setObs(e.target.value)}
              placeholder="Informações adicionais sobre este documento..."
              className="min-h-[72px] text-sm resize-none" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 pb-5">
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" disabled={!podeEnviar}
            onClick={() => podeEnviar && onConfirm({ nome: isNovo ? nomeDoc : undefined, arquivo: arquivo!, emissao, validade, obs })}
            className="gap-1.5 text-white" style={{ backgroundColor: FORN_COLOR }}>
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
  const isValidando = doc.status === "validando";

  return (
    <div className={`flex items-center gap-4 px-5 py-3.5 rounded-xl border bg-card ${
      doc.status === "vencido"  ? "border-red-200"    :
      doc.status === "vencendo" ? "border-yellow-200"  : "border-border"
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
          {doc.arquivo ? (
            <span className="flex items-center gap-1">
              <Paperclip className="h-3 w-3" /> {doc.arquivo}
            </span>
          ) : "Nenhum arquivo enviado"}
        </p>
      </div>

      {/* Data vencimento */}
      <div className="w-28 shrink-0 text-right hidden sm:block">
        {doc.dataVencimento ? (
          <>
            <p className="text-xs text-muted-foreground">
              {new Date(doc.dataVencimento + "T12:00:00").toLocaleDateString("pt-BR")}
            </p>
            {dias !== null && (
              <p className={`text-[11px] font-medium mt-0.5 ${
                dias < 0 ? "text-red-600" : dias <= 30 ? "text-yellow-600" : "text-muted-foreground"
              }`}>
                {dias < 0 ? `${Math.abs(dias)}d vencido` : `${dias}d restantes`}
              </p>
            )}
          </>
        ) : (
          <p className="text-xs text-muted-foreground">—</p>
        )}
      </div>

      {/* Badge status */}
      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 ${badge} ${
        isValidando ? "animate-pulse" : ""
      }`}>
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>

      {/* Botão */}
      <Button size="sm" variant="outline" disabled={isValidando}
        onClick={() => onEnviar(doc.id)}
        className="h-8 gap-1.5 shrink-0 text-xs">
        {doc.arquivo
          ? <><RotateCcw className="h-3.5 w-3.5" /> Substituir</>
          : <><UploadCloud className="h-3.5 w-3.5" /> Enviar</>
        }
      </Button>
    </div>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState = ({ onAdicionar }: { onAdicionar: () => void }) => (
  <div className="flex flex-col items-center justify-center gap-4 py-16 px-6 rounded-2xl border-2 border-dashed border-border bg-muted/20 mb-2">
    <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center">
      <FileText className="h-7 w-7 text-muted-foreground" />
    </div>
    <div className="text-center">
      <p className="text-sm font-semibold text-foreground">Nenhum documento enviado ainda</p>
      <p className="text-xs text-muted-foreground mt-1">Adicione seus documentos e certidões abaixo</p>
    </div>
    <Button onClick={onAdicionar} className="gap-1.5 text-white" style={{ backgroundColor: FORN_COLOR }}>
      <Plus className="h-4 w-4" />
      Anexar documento
    </Button>
  </div>
);

// ─── Página principal ─────────────────────────────────────────────────────────

const FornecedorDocumentos = () => {
  const [docs, setDocs]       = useState<Documento[]>(DOCS_INICIAIS);
  const [modalId, setModalId] = useState<string | null>(null);
  const [modalNovo, setModalNovo] = useState(false);

  const vencidos = docs.filter(d => d.status === "vencido").length;
  const vencendo = docs.filter(d => d.status === "vencendo").length;
  const temQualquerDoc = docs.some(d => d.arquivo);
  const docAtivo = modalId ? docs.find(d => d.id === modalId) : undefined;

  const processarUpload = (id: string, { arquivo, emissao, validade, obs }: { arquivo: File; emissao: string; validade: string; obs: string }) => {
    setDocs(prev => prev.map(d => d.id !== id ? d : {
      ...d, arquivo: arquivo.name, dataEmissao: emissao, observacao: obs,
      dataVencimento: undefined, status: "validando",
    }));
    setModalId(null);
    setTimeout(() => {
      setDocs(prev => prev.map(d => d.id !== id ? d : { ...d, status: calcStatus(validade), dataVencimento: validade }));
    }, 2500);
  };

  const adicionarNovo = ({ nome, arquivo, emissao, validade, obs }: { nome?: string; arquivo: File; emissao: string; validade: string; obs: string }) => {
    const novoId = `custom-${Date.now()}`;
    setDocs(prev => [...prev, {
      id: novoId, nome: nome || "Documento", obrigatorio: false,
      arquivo: arquivo.name, dataEmissao: emissao, observacao: obs,
      status: "validando", custom: true,
    }]);
    setModalNovo(false);
    setTimeout(() => {
      setDocs(prev => prev.map(d => d.id !== novoId ? d : { ...d, status: calcStatus(validade), dataVencimento: validade }));
    }, 2500);
  };

  const obrigatorios   = docs.filter(d => d.obrigatorio);
  const complementares = docs.filter(d => !d.obrigatorio);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Documentos e Certidões</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Envie e mantenha seus documentos atualizados. O sistema valida o vencimento automaticamente via OCR.
          </p>
        </div>
        <Button onClick={() => setModalNovo(true)} className="gap-1.5 shrink-0 text-white" size="sm"
          style={{ backgroundColor: FORN_COLOR }}>
          <Plus className="h-4 w-4" /> Adicionar documento
        </Button>
      </div>

      {/* Alertas */}
      {(vencidos > 0 || vencendo > 0) && (
        <div className="space-y-2">
          {vencidos > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm">
              <XCircle className="h-4 w-4 text-red-600 shrink-0" />
              <span className="text-red-800">
                <strong>{vencidos} documento{vencidos > 1 ? "s" : ""} vencido{vencidos > 1 ? "s" : ""}.</strong>{" "}
                Substitua para manter a homologação ativa.
              </span>
            </div>
          )}
          {vencendo > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm">
              <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0" />
              <span className="text-yellow-800">
                <strong>{vencendo} documento{vencendo > 1 ? "s vencem" : " vence"} em breve.</strong>{" "}
                Você receberá um e-mail de alerta 30 dias antes.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!temQualquerDoc && <EmptyState onAdicionar={() => setModalNovo(true)} />}

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
        <button onClick={() => setModalNovo(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:border-green-500/40 hover:text-green-700 hover:bg-green-50/50 transition-colors">
          <Plus className="h-4 w-4" /> Adicionar outro documento
        </button>
      </div>

      {/* Modal — enviar/substituir */}
      {modalId && docAtivo && (
        <UploadModal
          titulo={`Enviar — ${docAtivo.nome}`}
          onConfirm={({ arquivo, emissao, validade, obs }) => processarUpload(modalId, { arquivo, emissao, validade, obs })}
          onClose={() => setModalId(null)}
        />
      )}

      {/* Modal — novo documento */}
      {modalNovo && (
        <UploadModal
          titulo="Adicionar documento"
          isNovo
          onConfirm={dados => adicionarNovo(dados)}
          onClose={() => setModalNovo(false)}
        />
      )}
    </div>
  );
};

export default FornecedorDocumentos;
