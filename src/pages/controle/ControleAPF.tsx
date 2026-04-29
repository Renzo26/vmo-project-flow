import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SlidersHorizontal, Zap, Check, Plus,
  CheckCircle2, AlertTriangle, XCircle,
} from "lucide-react";
import { SOLICITACOES, STATUS_CONFIG, ICON_MAP } from "./SolicitacoesRecebidas";

type Tab = "configuracao" | "em_analise";

const STEPS = ["Metodologia", "Parâmetros Econômicos", "Regras de Parecer", "Config. PFS"];

const ControleAPF = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("configuracao");
  const [step, setStep] = useState(0);

  // Step 1
  const [metodologia, setMetodologia] = useState("IFPUG — CPM 4.3.1 (padrão BRAESP)");
  const [tipoContagem, setTipoContagem] = useState("DSFP — Novo desenvolvimento");
  const [vaf, setVaf] = useState("Não — PFS sem ajuste (recomendado)");
  const [vigencia, setVigencia] = useState("2026-01-01");
  const versao = "v2026.1";

  // Step 2
  const [valorPF, setValorPF] = useState("820");
  const [tolerancia, setTolerancia] = useState("10");
  const [valorMaxCE, setValorMaxCE] = useState("50000");
  const [savingMinimo, setSavingMinimo] = useState("5");
  const [prazoFornecedor, setPrazoFornecedor] = useState("5");
  const [modalidade, setModalidade] = useState("Ponto de Função (PF)");

  // Step 3
  const [notificarCE, setNotificarCE] = useState("Qualquer recusa automática");
  const [enviarCopia, setEnviarCopia] = useState("solicitante, área TI");

  const emAnalise = SOLICITACOES.filter(
    (s) => s.status === "apf_pendente" || s.status === "em_contagem"
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5" /> Configuração do Módulo APF
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure as regras de contagem, metodologias e parâmetros econômicos que serão aplicados
            automaticamente a todas as demandas de desenvolvimento de software.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm text-muted-foreground hidden md:block">Motor de análise automática</span>
          <Button
            size="sm"
            className="gap-1.5 bg-ctrl hover:bg-ctrl/90 text-ctrl-foreground"
            onClick={() => navigate("/controle/apf/nova-contagem")}
          >
            <Zap className="h-4 w-4" /> Nova contagem APF
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5">
            <Plus className="h-4 w-4" /> Analisar solicitação
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(
          [
            { key: "configuracao", label: "Configuração" },
            { key: "em_analise", label: "Em análise", count: emAnalise.length },
          ] as { key: Tab; label: string; count?: number }[]
        ).map((t) => (
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
            {t.count !== undefined && (
              <span
                className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                  tab === t.key ? "bg-ctrl/10 text-ctrl" : "bg-muted text-muted-foreground"
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: Configuração ── */}
      {tab === "configuracao" && (
        <div className="space-y-6">
          {/* Banner Motor APF */}
          <div className="p-4 rounded-xl border border-ctrl/25 bg-gradient-to-r from-ctrl/10 to-ctrl/3">
            <p className="text-sm text-foreground">
              <span className="font-semibold text-ctrl">Motor APF ativo:</span>{" "}
              As configurações abaixo definem o comportamento do parecer automático. Qualquer alteração
              será aplicada às novas contagens a partir da data de vigência informada.
            </p>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      i < step
                        ? "bg-ctrl text-ctrl-foreground"
                        : i === step
                        ? "bg-ctrl text-ctrl-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i < step ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:block ${
                      i <= step ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {s}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 ${i < step ? "bg-ctrl" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Card de etapa */}
          <div className="bg-card rounded-xl border border-border p-6">
            {/* ── Etapa 1 — Metodologia ── */}
            {step === 0 && (
              <div className="space-y-5">
                <div className="border-b border-border pb-2">
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    1 — Metodologia Padrão de Contagem
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Método de medição funcional padrão *</Label>
                    <select
                      value={metodologia}
                      onChange={(e) => setMetodologia(e.target.value)}
                      className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option>IFPUG — CPM 4.3.1 (padrão BRAESP)</option>
                      <option>NESMA — Function Point Analysis</option>
                      <option>COSMIC — ISO 19761</option>
                    </select>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Metodologia obrigatória para todos os projetos de desenvolvimento
                    </p>
                  </div>
                  <div>
                    <Label>Tipo de contagem padrão *</Label>
                    <select
                      value={tipoContagem}
                      onChange={(e) => setTipoContagem(e.target.value)}
                      className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option>DSFP — Novo desenvolvimento</option>
                      <option>ESFP — Melhoria</option>
                      <option>ASFP — Aplicação existente</option>
                    </select>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Selecionado automaticamente pelo tipo da solicitação
                    </p>
                  </div>
                  <div>
                    <Label>Aplicar fator de ajuste (VAF)</Label>
                    <select
                      value={vaf}
                      onChange={(e) => setVaf(e.target.value)}
                      className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option>Não — PFS sem ajuste (recomendado)</option>
                      <option>Sim — aplicar VAF</option>
                    </select>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      PFS dispensa VAF por definição do método
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Vigência desta configuração *</Label>
                    <Input
                      type="date"
                      value={vigencia}
                      onChange={(e) => setVigencia(e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Data a partir da qual esta configuração é aplicada
                    </p>
                  </div>
                  <div>
                    <Label>Versão da configuração</Label>
                    <Input value={versao} disabled className="mt-1 bg-muted/50 font-mono" />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Para rastreabilidade histórica das contagens
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Etapa 2 — Parâmetros Econômicos ── */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="border-b border-border pb-2">
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    2 — Parâmetros Econômicos e Contratuais
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Valor R$/PF contratado (teto) *</Label>
                    <Input value={valorPF} onChange={(e) => setValorPF(e.target.value)} className="mt-1" />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Referência para análise de propostas e parecer automático
                    </p>
                  </div>
                  <div>
                    <Label>Tolerância aceitável (%) acima do teto *</Label>
                    <Input
                      value={tolerancia}
                      onChange={(e) => setTolerancia(e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      % acima do R$/PF que ainda gera parecer "Negociar"
                    </p>
                  </div>
                  <div>
                    <Label>Valor máximo sem aprovação CE (R$)</Label>
                    <Input
                      value={valorMaxCE}
                      onChange={(e) => setValorMaxCE(e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Acima disso exige aprovação do Controle Econômico
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Saving mínimo esperado (%)</Label>
                    <Input
                      value={savingMinimo}
                      onChange={(e) => setSavingMinimo(e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      % de saving vs estimativa não-APF para validar uso do método
                    </p>
                  </div>
                  <div>
                    <Label>Prazo padrão para resposta de fornecedores</Label>
                    <Input
                      value={prazoFornecedor}
                      onChange={(e) => setPrazoFornecedor(e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Dias úteis para envio de proposta após cotação
                    </p>
                  </div>
                  <div>
                    <Label>Modalidade padrão de contratação</Label>
                    <select
                      value={modalidade}
                      onChange={(e) => setModalidade(e.target.value)}
                      className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option>Ponto de Função (PF)</option>
                      <option>Hora trabalhada (H/H)</option>
                      <option>Escopo fechado</option>
                      <option>Sprint / iteração</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ── Etapa 3 — Regras de Parecer ── */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="border-b border-border pb-2">
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    3 — Regras de Parecer Automático
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-success/25 bg-success/5 text-sm text-foreground">
                  O motor APF analisará automaticamente cada proposta recebida com base nestas regras e
                  emitirá o parecer sem intervenção manual.
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-4 p-3 rounded-lg border border-success/25 bg-success/5">
                    <div className="flex items-center gap-2 shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <span className="text-sm font-semibold text-success">APROVADO automaticamente</span>
                      <span className="text-sm text-muted-foreground">quando:</span>
                    </div>
                    <span className="text-xs text-muted-foreground text-right">
                      Proposta ≤ R$/PF contratado e escopo compatível com PFS calculado (±15%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 p-3 rounded-lg border border-warning/25 bg-warning/5">
                    <div className="flex items-center gap-2 shrink-0">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      <span className="text-sm font-semibold text-warning">
                        NEGOCIAR — enviado ao fornecedor
                      </span>
                      <span className="text-sm text-muted-foreground">quando:</span>
                    </div>
                    <span className="text-xs text-muted-foreground text-right">
                      Proposta entre teto e teto +10% · Sistema dispara notificação automática
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 p-3 rounded-lg border border-orange-200 bg-orange-50">
                    <div className="flex items-center gap-2 shrink-0">
                      <Zap className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-semibold text-orange-600">
                        REVISAR ESCOPO — retorna ao solicitante
                      </span>
                      <span className="text-sm text-muted-foreground">quando:</span>
                    </div>
                    <span className="text-xs text-muted-foreground text-right">
                      PFS calculado difere &gt;30% da estimativa original do solicitante
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 p-3 rounded-lg border border-destructive/25 bg-destructive/5">
                    <div className="flex items-center gap-2 shrink-0">
                      <XCircle className="h-4 w-4 text-destructive" />
                      <span className="text-sm font-semibold text-destructive">
                        RECUSADO automaticamente
                      </span>
                      <span className="text-sm text-muted-foreground">quando:</span>
                    </div>
                    <span className="text-xs text-muted-foreground text-right">
                      Proposta &gt; teto +10% OU fornecedor bloqueado/irregular
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div>
                    <Label>Notificar CE quando</Label>
                    <select
                      value={notificarCE}
                      onChange={(e) => setNotificarCE(e.target.value)}
                      className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option>Qualquer recusa automática</option>
                      <option>Toda aprovação acima de R$ 50.000</option>
                      <option>Toda negociação iniciada</option>
                      <option>Nunca</option>
                    </select>
                  </div>
                  <div>
                    <Label>Enviar cópia do parecer para</Label>
                    <Input
                      value={enviarCopia}
                      onChange={(e) => setEnviarCopia(e.target.value)}
                      placeholder="Ex: solicitante, área TI"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── Etapa 4 — Configuração PFS ── */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="border-b border-border pb-2">
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    4 — Configuração PFS IFPUG V2.2 (Pontos de Função Simples)
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-sm text-foreground">
                  <span className="font-medium">
                    O método PFS (Pontos de Função Simples) do IFPUG
                  </span>{" "}
                  usa apenas 2 CFBs: PE (Processo Elementar) = 4,6 PFS e AL (Arquivo Lógico) = 7,0 PFS.
                  É ideal para estimativas rápidas no início do projeto quando os detalhes de DER/RLR não
                  estão disponíveis.
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Peso por PE (Processo Elementar)</Label>
                    <Input value="4,6" disabled className="mt-1 bg-muted/50 font-mono" />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Fixo por norma IFPUG PFS v2.2
                    </p>
                  </div>
                  <div>
                    <Label>Peso por AL (Arquivo Lógico)</Label>
                    <Input value="7,0" disabled className="mt-1 bg-muted/50 font-mono" />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Fixo por norma IFPUG PFS v2.2
                    </p>
                  </div>
                  <div>
                    <Label>Fórmula DSFP</Label>
                    <Input value="DSFP = ADD + CFP" disabled className="mt-1 bg-muted/50 font-mono" />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      ADD = novas funcionalidades · CFP = conversão
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Fórmula ESFP (melhoria)</Label>
                    <Input
                      value="ESFP = ADD+CHG+DEL+CFP"
                      disabled
                      className="mt-1 bg-muted/50 font-mono"
                    />
                  </div>
                  <div>
                    <Label>Fórmula Baseline após melhoria</Label>
                    <Input
                      value="ASFPA = ASFPB + ADD - DEL"
                      disabled
                      className="mt-1 bg-muted/50 font-mono"
                    />
                  </div>
                  <div>
                    <Label>Conversão PF→PFS (se disponível)</Label>
                    <Input
                      value="(EE+CE+SE)×4.6+(ALI+AIE)×7"
                      disabled
                      className="mt-1 bg-muted/50 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navegação */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => (step > 0 ? setStep(step - 1) : navigate("/controle/dashboard"))}
              >
                {step === 0 ? "Cancelar" : "Voltar"}
              </Button>
              {step < STEPS.length - 1 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  className="bg-ctrl hover:bg-ctrl/90 text-ctrl-foreground"
                >
                  Próximo
                </Button>
              ) : (
                <Button
                  onClick={() => navigate("/controle/apf")}
                  className="gap-2 bg-success hover:bg-success/90 text-success-foreground"
                >
                  <Check className="h-4 w-4" /> Salvar configuração APF
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Em análise ── */}
      {tab === "em_analise" && (
        <div className="space-y-3">
          {emAnalise.length === 0 && (
            <div className="bg-card rounded-xl border border-border p-10 text-center text-sm text-muted-foreground">
              Nenhuma solicitação em análise APF no momento.
            </div>
          )}
          {emAnalise.map((sol) => {
            const Icon = ICON_MAP[sol.iconKey];
            const statusCfg = STATUS_CONFIG[sol.status];
            return (
              <div
                key={sol.id}
                className="bg-card rounded-xl border border-border p-4 flex items-start gap-4 hover:border-ctrl/40 hover:shadow-sm transition-all cursor-pointer"
                onClick={() => navigate(`/controle/solicitacoes/recebidas/${sol.id}`)}
              >
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${sol.iconBg}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground leading-tight">
                    <span className="text-muted-foreground font-normal">{sol.numero} — </span>
                    {sol.titulo}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Área: {sol.area} · Solicitante: {sol.solicitante} · Enviado: {sol.enviado}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    <span className="text-foreground/70">{sol.subtipo}</span> · {sol.detalhe}
                  </p>
                </div>
                <div
                  className="flex flex-col items-end gap-2 shrink-0 ml-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${statusCfg.className}`}>
                    {statusCfg.label}
                  </span>
                  <Button
                    size="sm"
                    className="h-7 text-xs px-3 bg-ctrl hover:bg-ctrl/90 text-ctrl-foreground border-0"
                    onClick={() => navigate(`/controle/solicitacoes/recebidas/${sol.id}`)}
                  >
                    {sol.status === "apf_pendente" ? "⚡ Validar APF" : "Continuar APF"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ControleAPF;
