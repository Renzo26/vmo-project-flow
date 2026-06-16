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
  type ContagemPFOut,
} from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft, Loader2, FileSpreadsheet, CheckCircle2, AlertTriangle,
  XCircle, ThumbsUp, ThumbsDown, Paperclip, MessageCircleQuestion,
  Check, X, Clock, Send, CircleCheck, Ban, RefreshCcw, Calculator, Plus, Eye, Building2,
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
    <div className="space-y-5">
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

      {/* Parecer do controle */}
      {(s.parecer_controle || s.estimativa_aprovada) && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <CircleCheck className="h-4 w-4 text-success" /> Parecer do Controle Econômico
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {s.estimativa_aprovada && <Info label="Estimativa aprovada" value={s.estimativa_aprovada} />}
            {s.parecer_controle && <div className="md:col-span-2"><Info label="Parecer" value={s.parecer_controle} /></div>}
          </div>
        </div>
      )}

      {/* Proposta do fornecedor */}
      {s.proposta && (
        <PropostaCard proposta={s.proposta} />
      )}

      {/* Contagens APF vinculadas — visível apenas para controle */}
      {role === "controle" && (
        <ContagemAPFBloco solicitacaoId={s.id} />
      )}

      {/* Ações por perfil */}
      {role === "controle" && s.status === "aguardando_controle" && (
        <ControleAval onDone={invalidate} s={s} />
      )}
      {role === "controle" && s.status !== "aguardando_controle" && (
        <ControleLinha s={s} />
      )}
      {role === "fornecedor" && (s.status === "aguardando_proposta" || s.status === "proposta_enviada") && (
        <FornecedorProposta s={s} onDone={invalidate} />
      )}
      {role === "fornecedor" && (s.status === "aceita" || s.status === "recusada") && (
        <ResultadoFinal s={s} />
      )}
      {role === "solicitante" && s.status === "proposta_enviada" && (
        <SolicitanteDecisao s={s} onDone={invalidate} />
      )}
      {role === "solicitante" && (s.status === "aceita" || s.status === "recusada") && (
        <ResultadoFinal s={s} />
      )}
    </div>
  );
};

// ─── Bloco APF vinculado à solicitação ───────────────────────────────────────
const ContagemAPFBloco = ({ solicitacaoId }: { solicitacaoId: string }) => {
  const navigate = useNavigate();

  const { data: contagens, isLoading } = useQuery({
    queryKey: ["contagens-pf", "solicitacao", solicitacaoId],
    queryFn: () => api.get<ContagemPFOut[]>(`/pf/contagens?solicitacao_id=${solicitacaoId}`),
  });

  const metBadge = (m: string) =>
    m === "ifpug"
      ? "bg-blue-100 text-blue-700"
      : "bg-purple-100 text-purple-700";

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-ctrl" />
          <h3 className="text-sm font-semibold text-foreground">Contagens APF</h3>
          {contagens && contagens.length > 0 && (
            <span className="text-xs bg-ctrl/10 text-ctrl px-2 py-0.5 rounded-full font-semibold">
              {contagens.length}
            </span>
          )}
        </div>
        <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs"
          onClick={() => navigate(`/controle/apf/nova?solicitacao_id=${solicitacaoId}`)}>
          <Plus className="h-3.5 w-3.5" /> Nova contagem
        </Button>
      </div>

      {isLoading ? (
        <div className="py-6 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : !contagens || contagens.length === 0 ? (
        <div className="py-6 text-center text-sm text-muted-foreground">
          Nenhuma contagem APF vinculada.{" "}
          <button onClick={() => navigate(`/controle/apf/nova?solicitacao_id=${solicitacaoId}`)}
            className="text-ctrl hover:underline">
            Criar agora
          </button>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Título</th>
              <th className="text-center px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-20">Método</th>
              <th className="text-right px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-24">PF Local</th>
              <th className="text-right px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-24">Esforço</th>
              <th className="text-right px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-28">Data</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {contagens.map(c => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="px-4 py-2.5">
                  <p className="font-medium text-foreground">{c.titulo}</p>
                  {c.usuario_nome && <p className="text-[11px] text-muted-foreground">{c.usuario_nome}</p>}
                </td>
                <td className="px-3 py-2.5 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase ${metBadge(c.metodologia)}`}>
                    {c.metodologia}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right font-mono font-bold text-primary">{c.total_pf_local.toFixed(2)}</td>
                <td className="px-3 py-2.5 text-right text-muted-foreground">{c.esforco_horas.toFixed(0)} h</td>
                <td className="px-3 py-2.5 text-right text-muted-foreground text-xs">
                  {new Date(c.created_at).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-2 py-2.5">
                  <button onClick={() => navigate(`/controle/apf/contagem/${c.id}`)}
                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-muted/20 border-t-2 border-border">
              <td colSpan={2} className="px-4 py-2 text-xs font-semibold text-foreground">
                Total ({contagens.length} {contagens.length === 1 ? "contagem" : "contagens"})
              </td>
              <td className="px-3 py-2 text-right font-mono font-bold text-primary text-sm">
                {contagens.reduce((s, c) => s + c.total_pf_local, 0).toFixed(2)} PF
              </td>
              <td className="px-3 py-2 text-right text-sm font-semibold text-foreground">
                {contagens.reduce((s, c) => s + c.esforco_horas, 0).toFixed(0)} h
              </td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
};

const Info = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
    <p className="text-foreground">{value || "—"}</p>
  </div>
);

// ─── Card da proposta ────────────────────────────────────────────────────────
const PropostaCard = ({ proposta }: { proposta: NonNullable<SolicitacaoDetail["proposta"]> }) => {
  const obs = proposta.observacoes ?? "";
  const isRecusa = obs.startsWith("RECUSA:");
  const isPergunta = obs.startsWith("PERGUNTA:");

  return (
    <div className={`rounded-xl border p-5 ${isRecusa ? "bg-destructive/5 border-destructive/30" : isPergunta ? "bg-primary/5 border-primary/30" : "bg-card border-border"}`}>
      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        {isRecusa
          ? <><Ban className="h-4 w-4 text-destructive" /> Resposta do Fornecedor — Recusa</>
          : isPergunta
          ? <><MessageCircleQuestion className="h-4 w-4 text-primary" /> Pergunta do Fornecedor</>
          : <><Send className="h-4 w-4 text-success" /> Proposta do Fornecedor</>}
      </h3>
      {!isRecusa && !isPergunta && (
        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
          <Info label="Valor" value={proposta.valor != null ? `R$ ${proposta.valor.toLocaleString("pt-BR")}` : null} />
          <Info label="Prazo" value={proposta.prazo} />
        </div>
      )}
      {obs && (
        <p className="text-sm text-foreground bg-muted/50 rounded-lg p-3">
          {isRecusa ? obs.replace("RECUSA: ", "").replace("RECUSA:", "") : isPergunta ? obs.replace("PERGUNTA: ", "").replace("PERGUNTA:", "") : obs}
        </p>
      )}
      {proposta.url && (
        <a href={proposta.url} target="_blank" rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <Paperclip className="h-3.5 w-3.5" /> {proposta.arquivo_nome ?? "Arquivo da proposta"}
        </a>
      )}
    </div>
  );
};

// ─── Resultado final ─────────────────────────────────────────────────────────
const ResultadoFinal = ({ s }: { s: SolicitacaoDetail }) => (
  <div className={`rounded-xl border p-5 flex items-center gap-3 ${s.status === "aceita" ? "bg-success/10 border-success/30" : "bg-muted border-border"}`}>
    {s.status === "aceita"
      ? <CircleCheck className="h-6 w-6 text-success shrink-0" />
      : <Ban className="h-6 w-6 text-muted-foreground shrink-0" />}
    <div>
      <p className="text-sm font-semibold text-foreground">
        {s.status === "aceita" ? "Proposta aceita!" : "Proposta recusada"}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">
        {s.status === "aceita"
          ? "O solicitante aceitou a proposta. Esta solicitação está concluída."
          : "O solicitante recusou a proposta. Esta solicitação foi encerrada."}
      </p>
    </div>
  </div>
);

// ─── Ação: Controle dá aval + escolhe fornecedor ────────────────────────────
const ControleAval = ({ onDone, s }: { onDone: () => void; s: SolicitacaoDetail }) => {
  const { id } = useParams<{ id: string }>();
  const [fornecedorId, setFornecedorId] = useState("");
  const [parecer, setParecer] = useState("");
  const [estimativa, setEstimativa] = useState("");
  const [error, setError] = useState<string | null>(null);

  const formJson = (s.form_json ?? {}) as Record<string, unknown>;
  const fornecedoresIndicados: string[] = Array.isArray(formJson.fornecedores_indicados)
    ? (formJson.fornecedores_indicados as string[])
    : [];
  const justificativaForn = typeof formJson.justificativa_fornecedores === "string"
    ? formJson.justificativa_fornecedores
    : null;
  const docAprovacao = s.documentos.find(d => d.kind === "aprovacao_fornecedor") ?? null;
  const temJustificativa = !!(justificativaForn || docAprovacao);

  const { data: fornecedores } = useQuery({
    queryKey: ["fornecedores"],
    queryFn: () => api.get<FornecedorOut[]>("/fornecedores"),
  });

  const fornecedoresParaEnvio = fornecedoresIndicados.length > 0
    ? (fornecedores ?? []).filter(f => fornecedoresIndicados.includes(f.id))
    : (fornecedores ?? []);

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

      {/* Fornecedores indicados pelo solicitante */}
      {fornecedoresIndicados.length > 0 && (
        <div className="bg-muted/40 rounded-lg p-4 space-y-2">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            Fornecedores indicados pelo solicitante ({fornecedoresIndicados.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {fornecedoresParaEnvio.length > 0
              ? fornecedoresParaEnvio.map(f => (
                  <span key={f.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
                    <Building2 className="h-3 w-3" /> {f.nome}
                  </span>
                ))
              : <span className="text-xs text-muted-foreground italic">Carregando fornecedores...</span>
            }
          </div>
        </div>
      )}

      {/* Justificativa de menos de 3 fornecedores — validar antes de dar aval */}
      {temJustificativa && (
        <div className="border border-amber-400/40 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg p-4 space-y-3">
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            Solicitante indicou menos de 3 fornecedores — valide a justificativa antes de dar o aval
          </p>
          {justificativaForn && (
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Justificativa</p>
              <p className="text-sm text-foreground bg-background rounded-lg p-3">{justificativaForn}</p>
            </div>
          )}
          {docAprovacao && (
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Documento de aprovação do superior</p>
              {docAprovacao.url ? (
                <a href={docAprovacao.url} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                  <Paperclip className="h-3.5 w-3.5" /> {docAprovacao.nome}
                </a>
              ) : (
                <span className="text-sm text-foreground flex items-center gap-1.5">
                  <Paperclip className="h-3.5 w-3.5 text-muted-foreground" /> {docAprovacao.nome}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Seleção de fornecedor — apenas quando < 3 indicados (justificativa presente) */}
      {temJustificativa && (
        <div>
          <Label>Fornecedor para envio *</Label>
          <select value={fornecedorId} onChange={e => setFornecedorId(e.target.value)}
            className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="">Selecione o fornecedor...</option>
            {fornecedoresParaEnvio.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
          </select>
          {fornecedoresParaEnvio.length === 0 && (fornecedores ?? []).length === 0 && (
            <p className="text-[11px] text-amber-600 mt-1">Nenhum fornecedor cadastrado. Cadastre em Fornecedores → Novo.</p>
          )}
        </div>
      )}
      <div>
        <Label>Estimativa aprovada (opcional)</Label>
        <Input value={estimativa} onChange={e => setEstimativa(e.target.value)} placeholder="Ex: 120 PF / R$ 98.400" className="mt-1" />
      </div>
      <div>
        <Label>Parecer / observações</Label>
        <Textarea value={parecer} onChange={e => setParecer(e.target.value)} className="mt-1 min-h-[80px]" placeholder="Justificativa da análise..." />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button onClick={() => { setError(null); aval.mutate(); }} disabled={(temJustificativa && !fornecedorId) || aval.isPending}
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

// ─── Controle: linha do tempo após aval ─────────────────────────────────────
const ControleLinha = ({ s }: { s: SolicitacaoDetail }) => {
  const etapas = [
    {
      label: "Aval do Controle",
      done: true,
      detail: s.estimativa_aprovada ? `Estimativa: ${s.estimativa_aprovada}` : s.parecer_controle ?? "Aprovado",
      icon: <CircleCheck className="h-4 w-4 text-success" />,
    },
    {
      label: "Resposta do Fornecedor",
      done: !!s.proposta,
      detail: s.proposta
        ? (s.proposta.observacoes?.startsWith("RECUSA:")
            ? "Fornecedor recusou"
            : s.proposta.observacoes?.startsWith("PERGUNTA:")
            ? "Fornecedor fez uma pergunta"
            : "Proposta enviada")
        : "Aguardando...",
      icon: s.proposta ? <Send className="h-4 w-4 text-success" /> : <Clock className="h-4 w-4 text-muted-foreground" />,
    },
    {
      label: "Decisão do Solicitante",
      done: s.status === "aceita" || s.status === "recusada",
      detail: s.status === "aceita" ? "Proposta aceita" : s.status === "recusada" ? "Proposta recusada" : "Aguardando...",
      icon: s.status === "aceita"
        ? <CircleCheck className="h-4 w-4 text-success" />
        : s.status === "recusada"
        ? <Ban className="h-4 w-4 text-destructive" />
        : <Clock className="h-4 w-4 text-muted-foreground" />,
    },
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">Acompanhamento do fluxo</h3>
      <div className="space-y-3">
        {etapas.map((e, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">{e.icon}</div>
            <div>
              <p className={`text-sm font-medium ${e.done ? "text-foreground" : "text-muted-foreground"}`}>{e.label}</p>
              <p className="text-xs text-muted-foreground">{e.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Ação: Fornecedor responde à solicitação ────────────────────────────────
type FornecedorAcao = "aceitar" | "recusar" | "perguntar" | null;

const FornecedorProposta = ({ s, onDone }: { s: SolicitacaoDetail; onDone: () => void }) => {
  const { id } = useParams<{ id: string }>();
  const jaRespondeu = s.status === "proposta_enviada";
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
    onSuccess: () => { setAcao(null); setFile(null); setMotivo(""); setPergunta(""); onDone(); },
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
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">
          {jaRespondeu ? "Atualizar resposta" : "Responder à solicitação"}
        </h3>
        {jaRespondeu && (
          <span className="flex items-center gap-1 text-xs text-success font-medium">
            <CircleCheck className="h-3.5 w-3.5" /> Resposta enviada
          </span>
        )}
      </div>

      {jaRespondeu && !acao && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
          <RefreshCcw className="h-4 w-4 shrink-0" />
          Você já enviou uma resposta. Selecione uma opção abaixo para atualizar.
        </div>
      )}

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
        <div className="flex gap-2">
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
          <Button variant="ghost" onClick={() => setAcao(null)} disabled={enviar.isPending}>
            Cancelar
          </Button>
        </div>
      )}
    </div>
  );
};

// ─── Ação: Solicitante aceita ou recusa ─────────────────────────────────────
const SolicitanteDecisao = ({ s, onDone }: { s: SolicitacaoDetail; onDone: () => void }) => {
  const { id } = useParams<{ id: string }>();
  const [error, setError] = useState<string | null>(null);

  const decidir = useMutation({
    mutationFn: (decisao: "aceita" | "recusada") => api.patch(`/solicitacoes/${id}/decisao`, { decisao }),
    onSuccess: onDone,
    onError: (e) => setError(e instanceof ApiError ? e.message : "Falha ao registrar decisão."),
  });

  const obs = s.proposta?.observacoes ?? "";
  const isPergunta = obs.startsWith("PERGUNTA:");

  if (isPergunta) {
    return (
      <div className="bg-primary/5 border border-primary/30 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <MessageCircleQuestion className="h-4 w-4 text-primary" /> O fornecedor tem uma pergunta
        </h3>
        <p className="text-sm text-foreground bg-background rounded-lg p-3">
          {obs.replace("PERGUNTA: ", "").replace("PERGUNTA:", "")}
        </p>
        <p className="text-xs text-muted-foreground">Entre em contato com o fornecedor para responder à dúvida antes de tomar uma decisão.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-4">
      <h3 className="text-sm font-bold text-foreground">Sua decisão sobre a proposta</h3>

      {s.proposta && (
        <div className="bg-muted/40 rounded-lg p-4 space-y-2 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Resumo da proposta recebida</p>
          <div className="grid grid-cols-2 gap-3">
            <Info label="Valor" value={s.proposta.valor != null ? `R$ ${s.proposta.valor.toLocaleString("pt-BR")}` : null} />
            <Info label="Prazo" value={s.proposta.prazo} />
          </div>
          {s.proposta.observacoes && <Info label="Observações" value={s.proposta.observacoes} />}
          {s.proposta.url && (
            <a href={s.proposta.url} target="_blank" rel="noreferrer"
              className="mt-1 inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
              <Paperclip className="h-3.5 w-3.5" /> {s.proposta.arquivo_nome ?? "Arquivo da proposta"}
            </a>
          )}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button onClick={() => { setError(null); decidir.mutate("aceita"); }} disabled={decidir.isPending}
          className="bg-success hover:bg-success/90 text-success-foreground gap-1.5">
          {decidir.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />} Aceitar proposta
        </Button>
        <Button variant="outline" onClick={() => { setError(null); decidir.mutate("recusada"); }} disabled={decidir.isPending}
          className="text-destructive border-destructive/40 gap-1.5">
          <ThumbsDown className="h-4 w-4" /> Recusar proposta
        </Button>
      </div>
    </div>
  );
};

export default SolicitacaoDetailView;
