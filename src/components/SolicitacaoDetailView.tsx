import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  type FornecedorOut,
  type SolicitacaoDetail,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft, Loader2, FileSpreadsheet, CheckCircle2, AlertTriangle,
  XCircle, ThumbsUp, ThumbsDown, Paperclip, MessageCircleQuestion, Check, X,
} from "lucide-react";

const SolicitacaoDetailView = ({ backTo }: { backTo: string }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  const qc = useQueryClient();

  const { data: s, isLoading } = useQuery({
    queryKey: ["solicitacao", id],
    queryFn: () => api.get<SolicitacaoDetail>(`/solicitacoes/${id}`),
    enabled: !!id,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["solicitacao", id] });
    qc.invalidateQueries({ queryKey: ["solicitacoes"] });
  };

  if (isLoading || !s) {
    return <div className="py-20 text-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin inline" /></div>;
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <button onClick={() => navigate(backTo)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Voltar
      </button>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-foreground">{s.titulo}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {s.numero} · {s.tipo_servico ?? "—"} · Solicitante: {s.solicitante_nome ?? "—"}
          </p>
        </div>
        <Badge variant="outline" className={STATUS_COLORS[s.status]}>{STATUS_LABELS[s.status]}</Badge>
      </div>

      {/* Detalhes */}
      <div className="bg-card rounded-xl border border-border p-5 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
        <Info label="Área" value={s.area} />
        <Info label="Prioridade / Categoria" value={[s.prioridade, s.categoria].filter(Boolean).join(" · ")} />
        <Info label="Classificação" value={[s.fin_type, s.iniciativa, s.urgencia].filter(Boolean).join(" · ")} />
        <Info label="Prazo de entrega" value={s.prazo_entrega} />
        <Info label="Complexidade / Ambiente" value={[s.complexidade, s.ambiente].filter(Boolean).join(" · ")} />
        <Info label="Modalidade" value={s.modalidade} />
        <div className="md:col-span-2"><Info label="Descrição / escopo" value={s.descricao} /></div>
        <Info label="Sistemas impactados" value={s.sistemas_impactados} />
        <Info label="Entregáveis" value={s.entregaveis} />
        <Info label="Fornecedor direcionado" value={s.fornecedor_nome} />
        <Info label="Metodologia PF" value={s.metodologia_pf?.toUpperCase()} />
      </div>

      {/* Documentos */}
      {s.documentos.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Documentos anexados</h3>
          <ul className="space-y-2">
            {s.documentos.map(d => (
              <li key={d.id} className="flex items-center gap-2 text-sm">
                <FileSpreadsheet className="h-4 w-4 text-primary shrink-0" />
                {d.url ? (
                  <a href={d.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">{d.nome}</a>
                ) : (
                  <span className="text-foreground">{d.nome}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Análise IA */}
      {s.analise_pf && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className={`p-4 flex items-start gap-3 ${s.analise_pf.completo ? "bg-success/10" : "bg-amber-500/10"}`}>
            {s.analise_pf.completo
              ? <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
              : <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />}
            <div>
              <p className="text-sm font-semibold text-foreground">
                Análise da Entrada PF ({s.analise_pf.metodologia.toUpperCase()}) — {s.analise_pf.total_preenchidos}/{s.analise_pf.total_campos} campos
              </p>
              {s.analise_pf.resumo && <p className="text-xs text-foreground mt-1">{s.analise_pf.resumo}</p>}
            </div>
          </div>
          {(s.analise_pf.pendentes?.length ?? 0) > 0 && (
            <div className="p-4 border-t border-border">
              <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5"><XCircle className="h-3.5 w-3.5 text-amber-600" /> Pendências</h4>
              <ul className="space-y-1">
                {s.analise_pf.pendentes!.map(p => <li key={p} className="text-xs text-foreground">{p}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Proposta existente */}
      {s.proposta && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Proposta do fornecedor</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Info label="Valor" value={s.proposta.valor != null ? `R$ ${s.proposta.valor.toLocaleString("pt-BR")}` : null} />
            <Info label="Prazo" value={s.proposta.prazo} />
            <div className="col-span-2"><Info label="Observações" value={s.proposta.observacoes} /></div>
            {s.proposta.url && (
              <a href={s.proposta.url} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1 text-sm">
                <Paperclip className="h-3.5 w-3.5" /> {s.proposta.arquivo_nome ?? "Arquivo da proposta"}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Ações por perfil */}
      {role === "controle" && s.status === "aguardando_controle" && <ControleAval onDone={invalidate} />}
      {role === "fornecedor" && (s.status === "aguardando_proposta" || s.status === "proposta_enviada") && <FornecedorProposta onDone={invalidate} />}
      {role === "solicitante" && s.status === "proposta_enviada" && <SolicitanteDecisao onDone={invalidate} />}
    </div>
  );
};

const Info = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
    <p className="text-foreground">{value || "—"}</p>
  </div>
);

// ─── Ação: Controle dá aval + escolhe fornecedor ────────────────────────────
const ControleAval = ({ onDone }: { onDone: () => void }) => {
  const { id } = useParams<{ id: string }>();
  const [fornecedorId, setFornecedorId] = useState("");
  const [parecer, setParecer] = useState("");
  const [estimativa, setEstimativa] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: fornecedores } = useQuery({
    queryKey: ["fornecedores"],
    queryFn: () => api.get<FornecedorOut[]>("/fornecedores"),
  });

  const aval = useMutation({
    mutationFn: () => api.patch(`/solicitacoes/${id}/aval`, {
      fornecedor_id: fornecedorId,
      parecer_controle: parecer || null,
      estimativa_aprovada: estimativa || null,
    }),
    onSuccess: onDone,
    onError: (e) => setError(e instanceof ApiError ? e.message : "Falha ao dar aval."),
  });

  const rejeitar = useMutation({
    mutationFn: () => api.patch(`/solicitacoes/${id}/rejeitar`),
    onSuccess: onDone,
    onError: (e) => setError(e instanceof ApiError ? e.message : "Falha ao rejeitar."),
  });

  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-4">
      <h3 className="text-sm font-bold text-foreground">Parecer do Controle Econômico</h3>
      <div>
        <Label>Fornecedor para envio *</Label>
        <select value={fornecedorId} onChange={e => setFornecedorId(e.target.value)}
          className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option value="">Selecione o fornecedor...</option>
          {(fornecedores ?? []).map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
        </select>
        {(fornecedores ?? []).length === 0 && (
          <p className="text-[11px] text-amber-600 mt-1">Nenhum fornecedor cadastrado. Cadastre em Fornecedores → Novo.</p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Estimativa aprovada (opcional)</Label>
          <Input value={estimativa} onChange={e => setEstimativa(e.target.value)} placeholder="Ex: 120 PF / R$ 98.400" className="mt-1" />
        </div>
      </div>
      <div>
        <Label>Parecer / observações</Label>
        <Textarea value={parecer} onChange={e => setParecer(e.target.value)} className="mt-1 min-h-[80px]" placeholder="Justificativa da análise..." />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button onClick={() => { setError(null); aval.mutate(); }} disabled={!fornecedorId || aval.isPending}
          className="bg-success hover:bg-success/90 text-success-foreground gap-1.5">
          {aval.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />} Dar aval e enviar ao fornecedor
        </Button>
        <Button variant="outline" onClick={() => { setError(null); rejeitar.mutate(); }} disabled={rejeitar.isPending}
          className="text-destructive border-destructive/40 gap-1.5">
          <ThumbsDown className="h-4 w-4" /> Rejeitar
        </Button>
      </div>
    </div>
  );
};

// ─── Ação: Fornecedor responde à solicitação ────────────────────────────────
type FornecedorAcao = "aceitar" | "recusar" | "perguntar" | null;

const FornecedorProposta = ({ onDone }: { onDone: () => void }) => {
  const { id } = useParams<{ id: string }>();
  const [acao, setAcao] = useState<FornecedorAcao>(null);
  const [motivo, setMotivo] = useState("");
  const [pergunta, setPergunta] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const enviar = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      if (acao === "aceitar") {
        if (file) fd.append("arquivo", file);
      } else if (acao === "recusar") {
        fd.append("observacoes", `RECUSA: ${motivo || "Sem motivo informado."}`);
      } else if (acao === "perguntar") {
        fd.append("observacoes", `PERGUNTA: ${pergunta}`);
      }
      return api.upload(`/solicitacoes/${id}/proposta`, fd);
    },
    onSuccess: onDone,
    onError: (e) => setError(e instanceof ApiError ? e.message : "Falha ao enviar resposta."),
  });

  const opcoes: { key: FornecedorAcao; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
    {
      key: "aceitar",
      label: "Aceitar",
      desc: "Tenho interesse e enviarei minha proposta.",
      icon: <Check className="h-5 w-5" />,
      color: "border-success text-success bg-success/5",
    },
    {
      key: "recusar",
      label: "Recusar",
      desc: "Não tenho interesse nesta solicitação.",
      icon: <X className="h-5 w-5" />,
      color: "border-destructive text-destructive bg-destructive/5",
    },
    {
      key: "perguntar",
      label: "Perguntar",
      desc: "Preciso de mais informações antes de decidir.",
      icon: <MessageCircleQuestion className="h-5 w-5" />,
      color: "border-primary text-primary bg-primary/5",
    },
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-4">
      <h3 className="text-sm font-bold text-foreground">Responder à solicitação</h3>

      {/* Seleção de ação */}
      <div className="grid grid-cols-3 gap-3">
        {opcoes.map(o => (
          <button
            key={o.key}
            onClick={() => { setAcao(o.key); setError(null); }}
            className={`rounded-lg border-2 p-3 text-left transition-all ${
              acao === o.key ? o.color : "border-border text-muted-foreground hover:border-muted-foreground"
            }`}
          >
            <div className="mb-1">{o.icon}</div>
            <p className="text-sm font-semibold">{o.label}</p>
            <p className="text-[11px] mt-0.5 leading-snug">{o.desc}</p>
          </button>
        ))}
      </div>

      {/* Formulário contextual */}
      {acao === "aceitar" && (
        <div>
          <Label>Arquivo da proposta (PDF/Excel) <span className="text-destructive">*</span></Label>
          <Input type="file" accept=".pdf,.xlsx,.docx" onChange={e => setFile(e.target.files?.[0] ?? null)} className="mt-1" />
          {!file && <p className="text-[11px] text-muted-foreground mt-1">Anexe o documento com sua proposta comercial.</p>}
        </div>
      )}

      {acao === "recusar" && (
        <div>
          <Label>Motivo (opcional)</Label>
          <Textarea
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            placeholder="Explique brevemente o motivo da recusa..."
            className="mt-1 min-h-[80px]"
          />
        </div>
      )}

      {acao === "perguntar" && (
        <div>
          <Label>Sua pergunta <span className="text-destructive">*</span></Label>
          <Textarea
            value={pergunta}
            onChange={e => setPergunta(e.target.value)}
            placeholder="Descreva sua dúvida sobre esta solicitação..."
            className="mt-1 min-h-[80px]"
          />
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {acao && (
        <Button
          onClick={() => { setError(null); enviar.mutate(); }}
          disabled={
            enviar.isPending ||
            (acao === "aceitar" && !file) ||
            (acao === "perguntar" && !pergunta.trim())
          }
          className={`gap-1.5 ${
            acao === "aceitar" ? "bg-success hover:bg-success/90 text-success-foreground" :
            acao === "recusar" ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" : ""
          }`}
        >
          {enviar.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : acao === "aceitar" ? (
            <Paperclip className="h-4 w-4" />
          ) : acao === "recusar" ? (
            <X className="h-4 w-4" />
          ) : (
            <MessageCircleQuestion className="h-4 w-4" />
          )}
          {acao === "aceitar" ? "Enviar proposta" : acao === "recusar" ? "Confirmar recusa" : "Enviar pergunta"}
        </Button>
      )}
    </div>
  );
};

// ─── Ação: Solicitante aceita ou recusa ─────────────────────────────────────
const SolicitanteDecisao = ({ onDone }: { onDone: () => void }) => {
  const { id } = useParams<{ id: string }>();
  const [error, setError] = useState<string | null>(null);

  const decidir = useMutation({
    mutationFn: (decisao: "aceita" | "recusada") => api.patch(`/solicitacoes/${id}/decisao`, { decisao }),
    onSuccess: onDone,
    onError: (e) => setError(e instanceof ApiError ? e.message : "Falha ao registrar decisão."),
  });

  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-3">
      <h3 className="text-sm font-bold text-foreground">Decisão sobre a proposta</h3>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button onClick={() => { setError(null); decidir.mutate("aceita"); }} disabled={decidir.isPending}
          className="bg-success hover:bg-success/90 text-success-foreground gap-1.5">
          <ThumbsUp className="h-4 w-4" /> Aceitar proposta
        </Button>
        <Button variant="outline" onClick={() => { setError(null); decidir.mutate("recusada"); }} disabled={decidir.isPending}
          className="text-destructive border-destructive/40 gap-1.5">
          <ThumbsDown className="h-4 w-4" /> Recusar
        </Button>
      </div>
    </div>
  );
};

export default SolicitacaoDetailView;
