import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal, Save, Calculator, Laptop, Link2, User } from "lucide-react";
import { SOLICITACOES, STATUS_CONFIG, ICON_MAP } from "./SolicitacoesRecebidas";

type Tab = "configuracao" | "em_analise";

const ControleAPF = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("configuracao");
  const [config, setConfig] = useState({
    valorPF: "850",
    fatorAjuste: "1.0",
    complexidadeBaixa: "0.8",
    complexidadeMedia: "1.0",
    complexidadeAlta: "1.3",
  });

  const update = (k: string, v: string) => setConfig(p => ({ ...p, [k]: v }));

  const emAnalise = SOLICITACOES.filter(s =>
    s.status === "apf_pendente" || s.status === "em_contagem"
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5" /> APF
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Análise de Pontos de Função</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {([
          { key: "configuracao", label: "Configuração" },
          { key: "em_analise", label: "Em análise", count: emAnalise.length },
        ] as { key: Tab; label: string; count?: number }[]).map(t => (
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
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                tab === t.key ? "bg-ctrl/10 text-ctrl" : "bg-muted text-muted-foreground"
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab: Configuração */}
      {tab === "configuracao" && (
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <div>
            <Label>Valor do Ponto de Função (R$)</Label>
            <Input value={config.valorPF} onChange={e => update("valorPF", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>Fator de Ajuste</Label>
            <Input value={config.fatorAjuste} onChange={e => update("fatorAjuste", e.target.value)} className="mt-1" />
          </div>

          <div className="pt-2">
            <h3 className="font-semibold text-foreground text-sm mb-3">Multiplicadores de Complexidade</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Baixa</Label>
                <Input value={config.complexidadeBaixa} onChange={e => update("complexidadeBaixa", e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Média</Label>
                <Input value={config.complexidadeMedia} onChange={e => update("complexidadeMedia", e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Alta</Label>
                <Input value={config.complexidadeAlta} onChange={e => update("complexidadeAlta", e.target.value)} className="mt-1" />
              </div>
            </div>
          </div>

          <Button className="gap-2 mt-4">
            <Save className="h-4 w-4" /> Salvar configuração
          </Button>
        </div>
      )}

      {/* Tab: Em análise APF */}
      {tab === "em_analise" && (
        <div className="space-y-3">
          {emAnalise.length === 0 && (
            <div className="bg-card rounded-xl border border-border p-10 text-center text-sm text-muted-foreground">
              Nenhuma solicitação em análise APF no momento.
            </div>
          )}
          {emAnalise.map(sol => {
            const Icon = ICON_MAP[sol.iconKey];
            const statusCfg = STATUS_CONFIG[sol.status];
            return (
              <div
                key={sol.id}
                className="bg-card rounded-xl border border-border p-4 flex items-start gap-4 hover:border-ctrl/40 hover:shadow-sm transition-all cursor-pointer"
                onClick={() => navigate(`/controle/solicitacoes/recebidas/${sol.id}`)}
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${sol.iconBg}`}>
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
                <div className="flex flex-col items-end gap-2 shrink-0 ml-2" onClick={e => e.stopPropagation()}>
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
