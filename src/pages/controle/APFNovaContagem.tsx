import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import type { ContagemPFCreate, FuncaoIFPUGIn, FuncaoSFPIn } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, ChevronDown, ChevronUp, Calculator, Save } from "lucide-react";

// ─── Tabelas locais para preview em tempo real ───────────────────────────────
const TABELA_IFPUG: Record<string, Record<string, number>> = {
  EE:  { L: 3, A: 4, H: 6 },
  SE:  { L: 4, A: 5, H: 7 },
  CE:  { L: 3, A: 4, H: 6 },
  ALI: { L: 7, A: 10, H: 15 },
  AIE: { L: 5, A: 7, H: 10 },
};
const TABELA_SFP: Record<string, number> = { AL: 7, PE: 4.6 };
const DEFLATORES: Record<string, number> = {
  "Inc-4.1": 1.00, "A50-4.2": 0.50, "A65-4.2": 0.65, "A75-4.2": 0.75,
  "A80-4.2": 0.80, "A90-4.2": 0.90, "Exc-4.2": 0.30, "Exc25-4.2": 0.25,
  "MD-4.3": 1.00, "MC-4.4": 0.00, "MC50-4.4": 0.50, "MC65-4.4": 0.65,
  "MC75-4.4": 0.75, "MC90-4.4": 0.90, "MD1-4.5.1": 1.00, "MD2-4.5.2": 1.00,
  "MD3-4.5.2": 0.30, "AV1-4.6.1": 0.30, "AV2-4.6.2": 0.30, "Ad40-4.8": 0.40,
  "Ad50-4.8": 0.50, "Ad65-4.8": 0.65, "Ad75-4.8": 0.75, "Ad90-4.8": 0.90,
  "AE1-4.9.1": 1.00, "AE2-4.9.1": 1.00, "AE3-4.9.1": 0.60, "AE4-4.9.2": 1.00,
  "AE5-4.9.3": 0.10, "AD-4.10": 0.10, "MDSL-4.12": 0.25, "VE-4.13": 0.15,
  "VET-4.13": 0.20, "PFT-4.14": 0.15, "CIR-4.15": 1.00, "CMM-4.16": 1.00, "SA": 0.00,
};
const DEFLATOR_LABELS: Record<string, string> = {
  "Inc-4.1": "Inc-4.1 — Novo (1,00)", "A50-4.2": "A50-4.2 — Alterada s/ redoc., mesma emp. (0,50)",
  "A65-4.2": "A65-4.2 — Alterada c/ redoc., mesma emp. (0,65)", "A75-4.2": "A75-4.2 — Alterada s/ redoc., emp. dif. (0,75)",
  "A80-4.2": "A80-4.2 — Cláusula de Contrato (0,80)", "A90-4.2": "A90-4.2 — Alterada c/ redoc., emp. dif. (0,90)",
  "Exc-4.2": "Exc-4.2 — Excluída (0,30)", "Exc25-4.2": "Exc25-4.2 — Excluída 25% (0,25)",
  "MD-4.3": "MD-4.3 — Migração de Dados (1,00)", "MC-4.4": "MC-4.4 — Manutenção Corretiva 0% (0,00)",
  "MC50-4.4": "MC50-4.4 — MC s/ redoc., mesma emp. (0,50)", "MC65-4.4": "MC65-4.4 — MC c/ redoc., mesma emp. (0,65)",
  "MC75-4.4": "MC75-4.4 — MC s/ redoc., emp. dif. (0,75)", "MC90-4.4": "MC90-4.4 — MC c/ redoc., emp. dif. (0,90)",
  "MD1-4.5.1": "MD1-4.5.1 — Mudança Linguagem (1,00)", "MD2-4.5.2": "MD2-4.5.2 — Mudança BD Hierárquico (1,00)",
  "MD3-4.5.2": "MD3-4.5.2 — Mudança BD Relacional (0,30)", "AV1-4.6.1": "AV1-4.6.1 — Atualização Linguagem (0,30)",
  "AV2-4.6.2": "AV2-4.6.2 — Atualização Browser (0,30)", "Ad40-4.8": "Ad40-4.8 — Adaptação Cláusula s/ redoc. (0,40)",
  "Ad50-4.8": "Ad50-4.8 — Adaptação contratada s/ redoc. (0,50)", "Ad65-4.8": "Ad65-4.8 — Adaptação contratada c/ redoc. (0,65)",
  "Ad75-4.8": "Ad75-4.8 — Adaptação não-contratada s/ redoc. (0,75)", "Ad90-4.8": "Ad90-4.8 — Adaptação não-contratada c/ redoc. (0,90)",
  "AE1-4.9.1": "AE1-4.9.1 — BD Atualização s/ Consulta (1,00)", "AE2-4.9.1": "AE2-4.9.1 — BD Consulta s/ Atualização (1,00)",
  "AE3-4.9.1": "AE3-4.9.1 — BD Atualização c/ Consulta (0,60)", "AE4-4.9.2": "AE4-4.9.2 — Geração de Relatórios (1,00)",
  "AE5-4.9.3": "AE5-4.9.3 — Reexecução (0,10)", "AD-4.10": "AD-4.10 — Atualização de Dados (0,10)",
  "MDSL-4.12": "MDSL-4.12 — Manutenção Doc. Legados (0,25)", "VE-4.13": "VE-4.13 — Verificação Erros s/ Testes (0,15)",
  "VET-4.13": "VET-4.13 — Verificação Erros c/ Testes (0,20)", "PFT-4.14": "PFT-4.14 — PF de Teste (0,15)",
  "CIR-4.15": "CIR-4.15 — Componente Interno Reusável (1,00)", "CMM-4.16": "CMM-4.16 — Múltiplas Mídias (1,00)",
  "SA": "SA — Sem Alteração (0,00)",
};

const HORAS_POR_PF = 6;
const fmt2 = (n: number) => n.toFixed(2);
const fmtH = (n: number) => `${n.toFixed(1)} h`;

// ─── Linha IFPUG ─────────────────────────────────────────────────────────────
type RowIFPUG = FuncaoIFPUGIn & { _key: string };
type RowSFP = FuncaoSFPIn & { _key: string };

let _seq = 0;
const newKey = () => `k${++_seq}`;

const emptyIFPUG = (): RowIFPUG => ({
  _key: newKey(), descricao: "", tipo: "EE", complexidade: "A", deflator_mnemonico: "Inc-4.1",
});
const emptySFP = (): RowSFP => ({
  _key: newKey(), descricao: "", tipo: "AL", operacao: "ADD",
});

// ─── Cálculo local (espelho do backend) ──────────────────────────────────────
function calcIFPUG(rows: RowIFPUG[]) {
  const detalhes = rows.map(r => {
    const bruto = TABELA_IFPUG[r.tipo]?.[r.complexidade] ?? 0;
    const def = DEFLATORES[r.deflator_mnemonico] ?? 1;
    return { ...r, pf_bruto: bruto, pf_local: +(bruto * def).toFixed(2) };
  });
  const totalBruto = +detalhes.reduce((s, d) => s + d.pf_bruto, 0).toFixed(2);
  const totalLocal = +detalhes.reduce((s, d) => s + d.pf_local, 0).toFixed(2);
  const esforco = +(totalLocal * HORAS_POR_PF).toFixed(2);
  return { detalhes, totalBruto, totalLocal, esforco };
}

function calcSFP(rows: RowSFP[], melhoria: boolean, asfpb: number) {
  const detalhes = rows.map(r => {
    const unit = TABELA_SFP[r.tipo] ?? 0;
    let impacto = 0;
    if (r.operacao === "ADD") impacto = unit;
    else if (r.operacao === "DEL") impacto = -unit;
    else if (r.operacao === "CHG" && melhoria) impacto = 0;
    return { ...r, pf_unitario: unit, impacto };
  });
  const esfp = +detalhes.reduce((s, d) => s + Math.abs(d.impacto === 0 && d.operacao === "CHG" ? d.pf_unitario : Math.abs(d.impacto)), 0).toFixed(2);
  const dsfp = melhoria ? esfp : +detalhes.filter(d => d.operacao === "ADD").reduce((s, d) => s + d.pf_unitario, 0).toFixed(2);
  const addTotal = +detalhes.filter(d => d.operacao === "ADD").reduce((s, d) => s + d.pf_unitario, 0).toFixed(2);
  const delTotal = +detalhes.filter(d => d.operacao === "DEL").reduce((s, d) => s + d.pf_unitario, 0).toFixed(2);
  const asfpa = +(asfpb + addTotal - delTotal).toFixed(2);
  const total = melhoria ? esfp : dsfp;
  const esforco = +(total * HORAS_POR_PF).toFixed(2);
  return { detalhes, total, dsfp, esfp, asfpa, esforco };
}

// ─── Componente principal ────────────────────────────────────────────────────
const APFNovaContagem = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [titulo, setTitulo] = useState("");
  const [metodologia, setMetodologia] = useState<"ifpug" | "sfp">("ifpug");
  const [tipoProj, setTipoProj] = useState<"desenvolvimento" | "melhoria">("desenvolvimento");
  const [asfpb, setAsfpb] = useState(0);
  const [rowsIFPUG, setRowsIFPUG] = useState<RowIFPUG[]>([emptyIFPUG()]);
  const [rowsSFP, setRowsSFP] = useState<RowSFP[]>([emptySFP()]);
  const [error, setError] = useState<string | null>(null);
  const [expandPreview, setExpandPreview] = useState(true);

  const previewIFPUG = useMemo(() => calcIFPUG(rowsIFPUG), [rowsIFPUG]);
  const previewSFP = useMemo(() => calcSFP(rowsSFP, tipoProj === "melhoria", asfpb), [rowsSFP, tipoProj, asfpb]);

  const totalPF = metodologia === "ifpug" ? previewIFPUG.totalLocal : previewSFP.total;
  const esforco = metodologia === "ifpug" ? previewIFPUG.esforco : previewSFP.esforco;

  const salvar = useMutation({
    mutationFn: () => {
      const payload: ContagemPFCreate = {
        titulo,
        metodologia,
        tipo_projeto: tipoProj,
        funcoes_ifpug: metodologia === "ifpug" ? rowsIFPUG.map(({ _key, ...r }) => r) : [],
        funcoes_sfp: metodologia === "sfp" ? rowsSFP.map(({ _key, ...r }) => r) : [],
        asfpb: metodologia === "sfp" ? asfpb : 0,
        solicitacao_id: null,
      };
      return api.post<{ id: string }>("/pf/contagens", payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contagens-pf"] });
      navigate("/controle/apf/historico");
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : "Falha ao salvar contagem."),
  });

  const updateIFPUG = (key: string, field: keyof FuncaoIFPUGIn, value: string) =>
    setRowsIFPUG(prev => prev.map(r => r._key === key ? { ...r, [field]: value } : r));
  const updateSFP = (key: string, field: keyof FuncaoSFPIn, value: string) =>
    setRowsSFP(prev => prev.map(r => r._key === key ? { ...r, [field]: value } : r));

  const canSave = titulo.trim().length > 0 && (metodologia === "ifpug" ? rowsIFPUG.length > 0 : rowsSFP.length > 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Nova Contagem APF</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Cadastre as funções e o motor calcula automaticamente.</p>
        </div>
        <Button onClick={() => salvar.mutate()} disabled={!canSave || salvar.isPending} className="gap-1.5">
          <Save className="h-4 w-4" /> {salvar.isPending ? "Salvando..." : "Salvar contagem"}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive bg-destructive/5 rounded-lg p-3">{error}</p>}

      {/* Cabeçalho da contagem */}
      <div className="bg-card rounded-xl border border-border p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <Label>Título da contagem *</Label>
          <Input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Sistema de Protocolo v2" className="mt-1" />
        </div>
        <div>
          <Label>Metodologia</Label>
          <select value={metodologia} onChange={e => setMetodologia(e.target.value as "ifpug" | "sfp")}
            className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="ifpug">IFPUG / APF</option>
            <option value="sfp">SFP 2.2</option>
          </select>
        </div>
        <div>
          <Label>Tipo de projeto</Label>
          <select value={tipoProj} onChange={e => setTipoProj(e.target.value as "desenvolvimento" | "melhoria")}
            className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="desenvolvimento">Desenvolvimento</option>
            <option value="melhoria">Melhoria</option>
          </select>
        </div>
        {metodologia === "sfp" && tipoProj === "melhoria" && (
          <div>
            <Label>ASFPB — Tamanho anterior (PF)</Label>
            <Input type="number" min={0} value={asfpb} onChange={e => setAsfpb(Number(e.target.value))} className="mt-1" />
          </div>
        )}
      </div>

      {/* Tabela de funções IFPUG */}
      {metodologia === "ifpug" && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Funções ({rowsIFPUG.length})</h3>
            <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs"
              onClick={() => setRowsIFPUG(p => [...p, emptyIFPUG()])}>
              <Plus className="h-3.5 w-3.5" /> Adicionar função
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground w-6">#</th>
                  <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground min-w-[200px]">Descrição</th>
                  <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground w-28">Tipo</th>
                  <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground w-24">Compl.</th>
                  <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground min-w-[280px]">Deflator SISP</th>
                  <th className="text-right px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground w-20">PF Bruto</th>
                  <th className="text-right px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground w-20">PF Local</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {rowsIFPUG.map((row, i) => {
                  const bruto = TABELA_IFPUG[row.tipo]?.[row.complexidade] ?? 0;
                  const def = DEFLATORES[row.deflator_mnemonico] ?? 1;
                  const local = +(bruto * def).toFixed(2);
                  return (
                    <tr key={row._key} className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="px-3 py-2 text-muted-foreground text-xs">{i + 1}</td>
                      <td className="px-3 py-2">
                        <Input value={row.descricao} onChange={e => updateIFPUG(row._key, "descricao", e.target.value)}
                          placeholder="Descrição da função..." className="h-8 text-xs" />
                      </td>
                      <td className="px-3 py-2">
                        <select value={row.tipo} onChange={e => updateIFPUG(row._key, "tipo", e.target.value)}
                          className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs">
                          {["EE", "SE", "CE", "ALI", "AIE"].map(t => <option key={t}>{t}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <select value={row.complexidade} onChange={e => updateIFPUG(row._key, "complexidade", e.target.value)}
                          className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs">
                          <option value="L">Baixa (L)</option>
                          <option value="A">Média (A)</option>
                          <option value="H">Alta (H)</option>
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <select value={row.deflator_mnemonico} onChange={e => updateIFPUG(row._key, "deflator_mnemonico", e.target.value)}
                          className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs">
                          {Object.entries(DEFLATOR_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-xs text-muted-foreground">{bruto}</td>
                      <td className="px-3 py-2 text-right font-mono text-xs font-semibold text-foreground">{fmt2(local)}</td>
                      <td className="px-3 py-2">
                        <button onClick={() => setRowsIFPUG(p => p.filter(r => r._key !== row._key))}
                          className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border bg-muted/30">
                  <td colSpan={5} className="px-3 py-2 text-xs font-semibold text-foreground">
                    Total ({rowsIFPUG.length} funções)
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-xs font-bold text-muted-foreground">
                    {fmt2(previewIFPUG.totalBruto)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-sm font-bold text-primary">
                    {fmt2(previewIFPUG.totalLocal)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Tabela de funções SFP */}
      {metodologia === "sfp" && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Funções SFP ({rowsSFP.length})</h3>
            <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs"
              onClick={() => setRowsSFP(p => [...p, emptySFP()])}>
              <Plus className="h-3.5 w-3.5" /> Adicionar função
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground w-6">#</th>
                  <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground min-w-[220px]">Descrição</th>
                  <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground w-32">Tipo CFB</th>
                  <th className="text-left px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground w-32">Operação</th>
                  <th className="text-right px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground w-20">PF Unit.</th>
                  <th className="text-right px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground w-20">Impacto</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {rowsSFP.map((row, i) => {
                  const unit = TABELA_SFP[row.tipo] ?? 0;
                  let impacto = 0;
                  if (row.operacao === "ADD") impacto = unit;
                  else if (row.operacao === "DEL") impacto = -unit;
                  return (
                    <tr key={row._key} className="border-b border-border last:border-0 hover:bg-muted/20">
                      <td className="px-3 py-2 text-muted-foreground text-xs">{i + 1}</td>
                      <td className="px-3 py-2">
                        <Input value={row.descricao} onChange={e => updateSFP(row._key, "descricao", e.target.value)}
                          placeholder="Descrição..." className="h-8 text-xs" />
                      </td>
                      <td className="px-3 py-2">
                        <select value={row.tipo} onChange={e => updateSFP(row._key, "tipo", e.target.value)}
                          className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs">
                          <option value="AL">AL — Arquivo Lógico (7 PF)</option>
                          <option value="PE">PE — Processo Elementar (4,6 PF)</option>
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <select value={row.operacao} onChange={e => updateSFP(row._key, "operacao", e.target.value)}
                          className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs">
                          <option value="ADD">ADD — Adição</option>
                          {tipoProj === "melhoria" && <option value="CHG">CHG — Alteração</option>}
                          {tipoProj === "melhoria" && <option value="DEL">DEL — Exclusão</option>}
                          <option value="CFP">CFP — COSMIC</option>
                        </select>
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-xs text-muted-foreground">{unit.toFixed(1)}</td>
                      <td className={`px-3 py-2 text-right font-mono text-xs font-semibold ${impacto < 0 ? "text-destructive" : impacto > 0 ? "text-success" : "text-muted-foreground"}`}>
                        {impacto >= 0 ? "+" : ""}{impacto.toFixed(1)}
                      </td>
                      <td className="px-3 py-2">
                        <button onClick={() => setRowsSFP(p => p.filter(r => r._key !== row._key))}
                          className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border bg-muted/30">
                  <td colSpan={4} className="px-3 py-2 text-xs font-semibold text-foreground">
                    Total ({rowsSFP.length} funções)
                  </td>
                  <td colSpan={2} className="px-3 py-2 text-right font-mono text-sm font-bold text-primary">
                    {tipoProj === "melhoria" ? `ESFP: ${fmt2(previewSFP.esfp)}` : `DSFP: ${fmt2(previewSFP.dsfp)}`}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Painel de resultado */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl overflow-hidden">
        <button
          onClick={() => setExpandPreview(p => !p)}
          className="w-full flex items-center justify-between px-5 py-3 hover:bg-primary/10 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Resultado calculado</span>
            <span className="text-sm text-primary font-bold ml-2">
              {metodologia === "ifpug"
                ? `${fmt2(previewIFPUG.totalLocal)} PF Local`
                : `${fmt2(previewSFP.total)} PF`}
            </span>
          </div>
          {expandPreview ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>

        {expandPreview && (
          <div className="px-5 pb-5 border-t border-primary/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {metodologia === "ifpug" ? (
                <>
                  <Stat label="PF Bruto" value={fmt2(previewIFPUG.totalBruto)} />
                  <Stat label="PF Local (deflacionado)" value={fmt2(previewIFPUG.totalLocal)} highlight />
                  <Stat label="Esforço total" value={fmtH(esforco)} />
                  <Stat label="Funções cadastradas" value={String(rowsIFPUG.length)} />
                </>
              ) : (
                <>
                  {tipoProj === "melhoria"
                    ? <><Stat label="ESFP" value={fmt2(previewSFP.esfp)} highlight /><Stat label="ASFPB" value={fmt2(asfpb)} /><Stat label="ASFPA" value={fmt2(previewSFP.asfpa)} /></>
                    : <><Stat label="DSFP" value={fmt2(previewSFP.dsfp)} highlight /><Stat label="ASFP" value={fmt2(previewSFP.dsfp)} /></>}
                  <Stat label="Esforço total" value={fmtH(esforco)} />
                </>
              )}
            </div>

            <div className="mt-4">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Distribuição do esforço</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { label: "Requisitos (20%)", val: +(esforco * 0.2).toFixed(1) },
                  { label: "Projeto (30%)", val: +(esforco * 0.3).toFixed(1) },
                  { label: "Implementação (40%)", val: +(esforco * 0.4).toFixed(1) },
                  { label: "Disponibilização (10%)", val: +(esforco * 0.1).toFixed(1) },
                ].map(d => (
                  <div key={d.label} className="bg-background rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">{d.label}</p>
                    <p className="text-sm font-bold text-foreground mt-0.5">{fmtH(d.val)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Stat = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div className="bg-background rounded-lg p-3">
    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
    <p className={`text-lg font-bold mt-0.5 ${highlight ? "text-primary" : "text-foreground"}`}>{value}</p>
  </div>
);

export default APFNovaContagem;
