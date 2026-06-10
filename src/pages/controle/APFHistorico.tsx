import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ContagemPFOut } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Loader2, Eye } from "lucide-react";
import EmptyState from "@/components/EmptyState";

const METODO_CFG: Record<string, string> = {
  ifpug: "bg-blue-50 text-blue-600 border border-blue-200",
  sfp:   "bg-teal-50 text-teal-600 border border-teal-200",
};
const TIPO_CFG: Record<string, string> = {
  desenvolvimento: "bg-success/10 text-success border-success/30",
  melhoria: "bg-amber-50 text-amber-600 border border-amber-200",
};

const fmt = (n: number) => n.toFixed(2);
const fmtH = (n: number) => `${n.toFixed(1)} h`;
const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

const APFHistorico = () => {
  const [busca, setBusca] = useState("");
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["contagens-pf"],
    queryFn: () => api.get<ContagemPFOut[]>("/pf/contagens"),
  });

  const contagens = data ?? [];
  const filtered = contagens.filter(c => {
    const q = busca.toLowerCase();
    return !busca || c.titulo.toLowerCase().includes(q) || (c.usuario_nome ?? "").toLowerCase().includes(q);
  });

  const totalPFL = filtered.reduce((s, c) => s + c.total_pf_local, 0);
  const totalEsforco = filtered.reduce((s, c) => s + c.esforco_horas, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-foreground">Histórico de contagens APF</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {contagens.length} contagem{contagens.length !== 1 ? "s" : ""} registrada{contagens.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar título ou analista..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="pl-8 h-8 text-sm w-60"
            />
          </div>
          <Button size="sm" className="gap-1.5 h-8" onClick={() => navigate("/controle/apf/nova")}>
            <Plus className="h-3.5 w-3.5" /> Nova contagem
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Título</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Data</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Método</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Tipo</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">PF Bruto</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">PF Local</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Esforço</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Analista</th>
                <th className="w-12" />
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin inline" />
                  </td>
                </tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={9}>
                    <EmptyState
                      title="Nenhuma contagem registrada"
                      description="Clique em 'Nova contagem' para iniciar uma contagem de Pontos de Função."
                    />
                  </td>
                </tr>
              )}
              {!isLoading && filtered.map((c, i) => (
                <tr key={c.id} className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${i % 2 !== 0 ? "bg-muted/10" : ""}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{c.titulo}</p>
                    {c.solicitacao_id && (
                      <p className="text-xs text-muted-foreground">Vinculada a solicitação</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{fmtDate(c.created_at)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${METODO_CFG[c.metodologia] ?? "bg-muted text-muted-foreground"}`}>
                      {c.metodologia.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={`text-[11px] ${TIPO_CFG[c.tipo_projeto] ?? ""}`}>
                      {c.tipo_projeto === "desenvolvimento" ? "Desenv." : "Melhoria"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">{fmt(c.total_pf_bruto)}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-bold text-primary">{fmt(c.total_pf_local)}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground whitespace-nowrap">{fmtH(c.esforco_horas)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{c.usuario_nome ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => navigate(`/controle/apf/contagem/${c.id}`)}
                      className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                      title="Ver detalhe"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            {!isLoading && filtered.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-border bg-muted/30">
                  <td colSpan={5} className="px-4 py-3 text-xs font-semibold text-foreground">
                    Totais ({filtered.length} contagens)
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-bold text-primary">{fmt(totalPFL)}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs font-bold text-foreground whitespace-nowrap">{fmtH(totalEsforco)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default APFHistorico;
