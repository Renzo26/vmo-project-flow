import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SlidersHorizontal, Zap, Check, Plus, Trash2, ToggleLeft, ToggleRight,
  CheckCircle2, AlertTriangle, XCircle, RefreshCw, ShieldCheck,
} from "lucide-react";

const STEPS = ["Metodologia", "Deflatores", "Parâmetros Econômicos", "Regras de Parecer"];

type MetodologiaKey = "IFPUG" | "NESMA" | "SFP";

interface Deflator {
  id: string;
  mne: string;
  descricao: string;
  valor: number;
  tipo: string;
  destaque: boolean;
  ativo: boolean;
}

const DEFLATORES_PADRAO: Deflator[] = [
  { id: "d1",  mne: "Inc-4.1",   descricao: "4.1 Aplicação / 4.1 Novo sistema / 4.2 Projeto de Melhoria – Nova",                                                valor: 1.00, tipo: "Func", destaque: false, ativo: true },
  { id: "d2",  mne: "A50-4.2",   descricao: "4.2 Projeto de Melhoria - Alterada (50%) (Mesma empresa que desenvolveu a funcionalidade s/ redoc)",                valor: 0.50, tipo: "Func", destaque: false, ativo: true },
  { id: "d3",  mne: "A65-4.2",   descricao: "4.2 Projeto de Melhoria - Alterada (65%) (Mesma empresa que desenvolveu a funcionalidade c/ redoc)",                valor: 0.65, tipo: "Func", destaque: false, ativo: true },
  { id: "d4",  mne: "A75-4.2",   descricao: "4.2 Projeto de Melhoria - Alterada (75%) (Empresa diferente daquela que desenvolveu a funcionalidade s/ redoc)",   valor: 0.75, tipo: "Func", destaque: false, ativo: true },
  { id: "d5",  mne: "A80-4.2",   descricao: "4.2 Projeto de Melhoria - Alterada (80%) (Cláusula de Contrato)",                                                  valor: 0.80, tipo: "Func", destaque: true,  ativo: true },
  { id: "d6",  mne: "A90-4.2",   descricao: "4.2 Projeto de Melhoria - Alterada (90%) (Empresa diferente daquela que desenvolveu a funcionalidade c/ redoc)",   valor: 0.90, tipo: "Func", destaque: false, ativo: true },
  { id: "d7",  mne: "Exc-4.2",   descricao: "4.2 Projeto de Melhoria - Excluída",                                                                               valor: 0.30, tipo: "Func", destaque: false, ativo: true },
  { id: "d8",  mne: "Exc25-4.2", descricao: "4.2 Projeto de Melhoria - Excluída",                                                                               valor: 0.25, tipo: "Func", destaque: true,  ativo: true },
  { id: "d9",  mne: "MD-4.3",    descricao: "4.3 Projetos de Migração de Dados",                                                                                 valor: 1.00, tipo: "Func", destaque: false, ativo: true },
  { id: "d10", mne: "MC-4.4",    descricao: "4.4 Manutenção Corretiva - 0% (Garantia)",                                                                          valor: 0.00, tipo: "Func", destaque: false, ativo: true },
  { id: "d11", mne: "MC50-4.4",  descricao: "4.4 Manutenção Corretiva - 50% (Mesma empresa que desenvolveu a funcionalidade s/ redoc)",                          valor: 0.50, tipo: "Func", destaque: false, ativo: true },
  { id: "d12", mne: "MC65-4.4",  descricao: "4.4 Manutenção Corretiva - 65% (Mesma empresa que desenvolveu a funcionalidade c/ redoc)",                          valor: 0.65, tipo: "Func", destaque: false, ativo: true },
  { id: "d13", mne: "MC75-4.4",  descricao: "4.4 Manutenção Corretiva - 75% (Empresa diferente daquela que desenvolveu a funcionalidade s/ redoc)",              valor: 0.75, tipo: "Func", destaque: false, ativo: true },
  { id: "d14", mne: "MC90-4.4",  descricao: "4.4 Manutenção Corretiva - 90% (Empresa diferente daquela que desenvolveu a funcionalidade c/ redoc)",              valor: 0.90, tipo: "Func", destaque: false, ativo: true },
  { id: "d15", mne: "MD1-4.5.1", descricao: "4.5.1 Mudança de Plataforma - Linguagem de Programação",                                                           valor: 1.00, tipo: "Func", destaque: false, ativo: true },
  { id: "d16", mne: "MD2-4.5.2", descricao: "4.5.2 Mudança de Plataforma - Banco de Dados (BD_HIERÁRQUICO)",                                                    valor: 1.00, tipo: "Func", destaque: false, ativo: true },
];
type TipoParecer = "Aprovado" | "Negociar" | "Revisar" | "Recusado";

interface Alcada {
  id: string;
  cargo: string;
  ativa: boolean;
}

interface FaixaDesvio {
  id: string;
  desvioMin: number;
  desvioMax: number | null; // null = sem limite superior ("acima de X%")
  acao: TipoParecer;
  alcadaId: string;
  ativa: boolean;
}

const PARECER_CONFIG: Record<TipoParecer, {
  icon: React.ElementType;
  border: string;
  bg: string;
  text: string;
}> = {
  Aprovado: { icon: CheckCircle2, border: "border-green-200",  bg: "bg-green-50",  text: "text-green-700" },
  Negociar: { icon: AlertTriangle, border: "border-yellow-200", bg: "bg-yellow-50", text: "text-yellow-700" },
  Revisar:  { icon: Zap,           border: "border-orange-200", bg: "bg-orange-50", text: "text-orange-600" },
  Recusado: { icon: XCircle,       border: "border-red-200",    bg: "bg-red-50",    text: "text-red-700" },
};

const ALCADAS_PADRAO: Alcada[] = [
  { id: "a1", cargo: "Solicitante", ativa: true },
  { id: "a2", cargo: "Coordenador responsável", ativa: true },
  { id: "a3", cargo: "Gerente responsável", ativa: true },
  { id: "a4", cargo: "Superintendente responsável", ativa: true },
  { id: "a5", cargo: "Diretor responsável", ativa: true },
];

const makeFaixas = (prefix: string): FaixaDesvio[] => [
  { id: `${prefix}_1`, desvioMin: 0,  desvioMax: 10, acao: "Aprovado", alcadaId: "a1", ativa: true },
  { id: `${prefix}_2`, desvioMin: 10, desvioMax: 20, acao: "Aprovado", alcadaId: "a2", ativa: true },
  { id: `${prefix}_3`, desvioMin: 20, desvioMax: 30, acao: "Aprovado", alcadaId: "a3", ativa: true },
  { id: `${prefix}_4`, desvioMin: 30, desvioMax: 40, acao: "Aprovado", alcadaId: "a4", ativa: true },
  { id: `${prefix}_5`, desvioMin: 40, desvioMax: null, acao: "Recusado", alcadaId: "a5", ativa: true },
];

const FAIXAS_PADRAO: Record<MetodologiaKey, FaixaDesvio[]> = {
  IFPUG: makeFaixas("if"),
  NESMA: makeFaixas("ne"),
  SFP:   makeFaixas("sfp"),
};

const METODOLOGIA_OPTIONS: { value: string; key: MetodologiaKey }[] = [
  { value: "IFPUG — CPM 4.3.1 (padrão BRAESP)", key: "IFPUG" },
  { value: "NESMA — Function Point Analysis",    key: "NESMA" },
  { value: "SFP — Simple Function Points",       key: "SFP" },
];

function getMetodologiaKey(value: string): MetodologiaKey {
  return METODOLOGIA_OPTIONS.find(o => o.value === value)?.key ?? "IFPUG";
}

let nextId = 100;

const ControleAPF = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Step 1
  const [metodologia, setMetodologia] = useState("IFPUG — CPM 4.3.1 (padrão BRAESP)");
  const [tipoContagem, setTipoContagem] = useState("DSFP — Novo desenvolvimento");
  const [vaf, setVaf] = useState("Não — PFS sem ajuste (recomendado)");
  const [vigencia, setVigencia] = useState("2026-01-01");
  const versao = "v2026.1";

  // Step 2 — Deflatores
  const [deflatores, setDeflatores] = useState<Deflator[]>(JSON.parse(JSON.stringify(DEFLATORES_PADRAO)));

  const updateDeflator = (id: string, patch: Partial<Deflator>) =>
    setDeflatores(prev => prev.map(d => d.id === id ? { ...d, ...patch } : d));

  const resetDeflatores = () =>
    setDeflatores(JSON.parse(JSON.stringify(DEFLATORES_PADRAO)));

  // Step 3
  const [valorPF, setValorPF] = useState("820");
  const [tolerancia, setTolerancia] = useState("10");
  const [valorMaxCE, setValorMaxCE] = useState("50000");
  const [savingMinimo, setSavingMinimo] = useState("5");
  const [prazoFornecedor, setPrazoFornecedor] = useState("5");
  const [modalidade, setModalidade] = useState("Ponto de Função (PF)");

  // Step 3
  const [alcadas, setAlcadas] = useState<Alcada[]>(JSON.parse(JSON.stringify(ALCADAS_PADRAO)));
  const [faixas, setFaixas] = useState<Record<MetodologiaKey, FaixaDesvio[]>>(
    JSON.parse(JSON.stringify(FAIXAS_PADRAO))
  );
  const [notificarCE, setNotificarCE] = useState("Qualquer recusa automática");
  const [enviarCopia, setEnviarCopia] = useState("solicitante, área TI");
  const [adicionandoAlcada, setAdicionandoAlcada] = useState(false);
  const [novaAlcadaCargo, setNovaAlcadaCargo] = useState("");

  const metKey = getMetodologiaKey(metodologia);
  const faixasAtivas = faixas[metKey];

  const toggleFaixa = (id: string) =>
    setFaixas(prev => ({
      ...prev,
      [metKey]: prev[metKey].map(f => f.id === id ? { ...f, ativa: !f.ativa } : f),
    }));

  const updateFaixa = (id: string, patch: Partial<FaixaDesvio>) =>
    setFaixas(prev => ({
      ...prev,
      [metKey]: prev[metKey].map(f => f.id === id ? { ...f, ...patch } : f),
    }));

  const removeFaixa = (id: string) =>
    setFaixas(prev => ({
      ...prev,
      [metKey]: prev[metKey].filter(f => f.id !== id),
    }));

  const addFaixa = () => {
    const last = faixasAtivas[faixasAtivas.length - 1];
    const newMin = last ? (last.desvioMax ?? last.desvioMin + 10) : 0;
    setFaixas(prev => ({
      ...prev,
      [metKey]: [
        ...prev[metKey],
        { id: `custom_${nextId++}`, desvioMin: newMin, desvioMax: null, acao: "Aprovado", alcadaId: alcadas[0]?.id ?? "a1", ativa: true },
      ],
    }));
  };

  const resetFaixas = () =>
    setFaixas(prev => ({
      ...prev,
      [metKey]: JSON.parse(JSON.stringify(FAIXAS_PADRAO[metKey])),
    }));

  const addAlcada = () => {
    if (!novaAlcadaCargo.trim()) return;
    setAlcadas(prev => [
      ...prev,
      { id: `custom_${nextId++}`, cargo: novaAlcadaCargo.trim(), ativa: true },
    ]);
    setNovaAlcadaCargo("");
    setAdicionandoAlcada(false);
  };

  const removeAlcada = (id: string) =>
    setAlcadas(prev => prev.filter(a => a.id !== id));

  const updateAlcadaCargo = (id: string, cargo: string) =>
    setAlcadas(prev => prev.map(a => a.id === id ? { ...a, cargo } : a));

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
      </div>

      {/* Configuração */}
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
                    {METODOLOGIA_OPTIONS.map(o => (
                      <option key={o.key}>{o.value}</option>
                    ))}
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

          {/* ── Etapa 2 — Deflatores ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div>
                  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    2 — Deflatores e Itens Não Mensuráveis
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Fonte: SISP 2.3</p>
                </div>
                <button
                  onClick={resetDeflatores}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Restaurar padrões
                </button>
              </div>

              <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 text-sm text-amber-800">
                Linhas em <span className="font-semibold">destaque amarelo</span> indicam itens de{" "}
                <span className="font-semibold">Cláusula de Contrato</span>. O campo{" "}
                <span className="font-semibold">Valor</span> é editável; ative ou desative cada deflator
                conforme a política vigente.
              </div>

              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border">
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-28">
                        Mnemônico
                      </th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Descrição
                      </th>
                      <th className="text-center px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-24">
                        Valor
                      </th>
                      <th className="text-center px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-16">
                        Tipo
                      </th>
                      <th className="text-center px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-16">
                        Ativo
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {deflatores.map((d, i) => (
                      <tr
                        key={d.id}
                        className={`border-b border-border last:border-0 transition-opacity ${
                          !d.ativo ? "opacity-40" : ""
                        } ${d.destaque ? "bg-amber-50" : i % 2 === 0 ? "" : "bg-muted/10"}`}
                      >
                        <td className="px-4 py-2">
                          <span className={`font-mono text-xs font-semibold ${d.destaque ? "text-amber-700" : "text-foreground"}`}>
                            {d.mne}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-foreground">
                          {d.descricao}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <Input
                            type="number"
                            step="0.01"
                            min={0}
                            max={1}
                            value={d.valor}
                            onChange={e => updateDeflator(d.id, { valor: Number(e.target.value) })}
                            className="h-8 w-20 text-sm text-center mx-auto"
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-ctrl/10 text-ctrl">
                            {d.tipo}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => updateDeflator(d.id, { ativo: !d.ativo })}
                            className={`transition-colors ${d.ativo ? "text-ctrl" : "text-muted-foreground"}`}
                          >
                            {d.ativo
                              ? <ToggleRight className="h-5 w-5" />
                              : <ToggleLeft className="h-5 w-5" />
                            }
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Etapa 3 — Parâmetros Econômicos ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="border-b border-border pb-2">
                <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  3 — Parâmetros Econômicos e Contratuais
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Produtividade (Horas/PF) *</Label>
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

          {/* ── Etapa 4 — Alçadas e Faixas de Desvio ── */}
          {step === 3 && (
            <div className="space-y-5">
              {/* Cabeçalho da etapa */}
              <div className="flex items-center justify-between border-b border-border pb-2">
                <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  4 — Faixas de Desvio e Alçadas de Aprovação
                </p>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-ctrl/10 text-ctrl">
                    {metKey}
                  </span>
                  <button
                    onClick={resetFaixas}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Restaurar padrões
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-3 rounded-lg border border-ctrl/20 bg-ctrl/5 text-sm text-foreground">
                As faixas abaixo são exclusivas da metodologia{" "}
                <span className="font-semibold text-ctrl">{metodologia}</span>. Cada faixa define
                a alçada mínima necessária para aprovar a contagem dentro daquele desvio percentual.
              </div>

              {/* Tabela de faixas */}
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border">
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Desvio de (%)
                      </th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Até (%)
                      </th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Ação
                      </th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Alçada responsável
                      </th>
                      <th className="text-center px-4 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-20">
                        Ativo
                      </th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {faixasAtivas.map((f, i) => {
                      const cfg = PARECER_CONFIG[f.acao];
                      return (
                        <tr
                          key={f.id}
                          className={`border-b border-border last:border-0 transition-opacity ${
                            !f.ativa ? "opacity-40" : ""
                          } ${i % 2 === 0 ? "" : "bg-muted/10"}`}
                        >
                          {/* De */}
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                min={0}
                                value={f.desvioMin}
                                onChange={e => updateFaixa(f.id, { desvioMin: Number(e.target.value) })}
                                className="h-8 w-16 text-sm text-center"
                              />
                              <span className="text-muted-foreground text-xs">%</span>
                            </div>
                          </td>

                          {/* Até */}
                          <td className="px-4 py-2.5">
                            {f.desvioMax !== null ? (
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  min={0}
                                  value={f.desvioMax}
                                  onChange={e => updateFaixa(f.id, { desvioMax: Number(e.target.value) })}
                                  className="h-8 w-16 text-sm text-center"
                                />
                                <span className="text-muted-foreground text-xs">%</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs italic px-1">sem limite</span>
                            )}
                          </td>

                          {/* Ação */}
                          <td className="px-4 py-2.5">
                            <select
                              value={f.acao}
                              onChange={e => updateFaixa(f.id, { acao: e.target.value as TipoParecer })}
                              className={`h-8 rounded-md border px-2 text-xs font-semibold ${cfg.border} ${cfg.bg} ${cfg.text}`}
                            >
                              {(Object.keys(PARECER_CONFIG) as TipoParecer[]).map(p => (
                                <option key={p}>{p}</option>
                              ))}
                            </select>
                          </td>

                          {/* Alçada */}
                          <td className="px-4 py-2.5">
                            <select
                              value={f.alcadaId}
                              onChange={e => updateFaixa(f.id, { alcadaId: e.target.value })}
                              className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
                            >
                              {alcadas.map(a => (
                                <option key={a.id} value={a.id}>{a.cargo}</option>
                              ))}
                            </select>
                          </td>

                          {/* Toggle ativo */}
                          <td className="px-4 py-2.5 text-center">
                            <button
                              onClick={() => toggleFaixa(f.id)}
                              className={`transition-colors ${f.ativa ? "text-ctrl" : "text-muted-foreground"}`}
                            >
                              {f.ativa
                                ? <ToggleRight className="h-5 w-5" />
                                : <ToggleLeft className="h-5 w-5" />
                              }
                            </button>
                          </td>

                          {/* Remover */}
                          <td className="px-2 py-2.5">
                            <button
                              onClick={() => removeFaixa(f.id)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Adicionar faixa */}
                <button
                  onClick={addFaixa}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border-t border-dashed border-ctrl/30 text-sm text-ctrl hover:bg-ctrl/5 transition-colors"
                >
                  <Plus className="h-4 w-4" /> Adicionar faixa para {metKey}
                </button>
              </div>

              {/* Alçadas configuradas */}
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      Alçadas de aprovação
                    </p>
                  </div>
                  <button
                    onClick={() => setAdicionandoAlcada(true)}
                    className="flex items-center gap-1 text-xs text-ctrl hover:text-ctrl/80 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" /> Nova alçada
                  </button>
                </div>

                <div className="divide-y divide-border">
                  {alcadas.map((a, i) => (
                    <div key={a.id} className="flex items-center gap-3 px-4 py-2.5">
                      <span className="w-6 h-6 rounded-full bg-ctrl/10 text-ctrl text-xs font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <Input
                        value={a.cargo}
                        onChange={e => updateAlcadaCargo(a.id, e.target.value)}
                        className="h-8 text-sm flex-1"
                      />
                      <button
                        onClick={() => removeAlcada(a.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {adicionandoAlcada && (
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-ctrl/5">
                      <Input
                        value={novaAlcadaCargo}
                        onChange={e => setNovaAlcadaCargo(e.target.value)}
                        placeholder="Ex: Gerente de Contratos"
                        className="h-8 text-sm flex-1"
                        autoFocus
                        onKeyDown={e => e.key === "Enter" && addAlcada()}
                      />
                      <Button
                        size="sm"
                        className="h-8 bg-ctrl hover:bg-ctrl/90 text-ctrl-foreground"
                        onClick={addAlcada}
                        disabled={!novaAlcadaCargo.trim()}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        onClick={() => { setAdicionandoAlcada(false); setNovaAlcadaCargo(""); }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Notificações */}
              <div className="border-t border-border pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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
    </div>
  );
};

export default ControleAPF;
