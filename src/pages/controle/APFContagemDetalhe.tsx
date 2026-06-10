import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ContagemPFDetail } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Loader2 } from "lucide-react";

const METODO_CFG: Record<string, string> = {
  ifpug: "bg-blue-50 text-blue-600 border border-blue-200",
  sfp:   "bg-teal-50 text-teal-600 border border-teal-200",
};

const fmt = (n: number) => n.toFixed(2);
const fmtH = (n: number) => `${n.toFixed(1)} h`;
const fmtDate = (s: string) => new Date(s).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

const APFContagemDetalhe = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: c, isLoading } = useQuery({
    queryKey: ["contagem-pf", id],
    queryFn: () => api.get<ContagemPFDetail>(`/pf/contagens/${id}`),
    enabled: !!id,
  });

  if (isLoading || !c) {
    return <div className="py-20 text-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin inline" /></div>;
  }

  const dist = c.distribuicao ?? {};

  return (
    <div className="space-y-5">
      <button onClick={() => navigate("/controle/apf/historico")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Voltar ao histórico
      </button>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-foreground">{c.titulo}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {fmtDate(c.created_at)} · por {c.usuario_nome ?? "—"}
          </p>
        </div>
        <div className="flex gap-2">
          <span className={`px-2.5 py-1 rounded text-xs font-medium ${METODO_CFG[c.metodologia] ?? ""}`}>
            {c.metodologia.toUpperCase()}
          </span>
          <Badge variant="outline" className="text-xs">
            {c.tipo_projeto === "desenvolvimento" ? "Desenvolvimento" : "Melhoria"}
          </Badge>
        </div>
      </div>

      {/* Totais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {c.metodologia === "ifpug" && (
          <StatCard label="PF Bruto" value={fmt(c.total_pf_bruto)} />
        )}
        <StatCard label={c.metodologia === "ifpug" ? "PF Local" : "Total PF"} value={fmt(c.total_pf_local)} highlight />
        <StatCard label="Esforço total" value={fmtH(c.esforco_horas)} />
        <StatCard label="Funções" value={String(c.funcoes.length)} />
        {c.asfpb != null && c.metodologia === "sfp" && (
          <StatCard label="ASFPB (antes)" value={fmt(c.asfpb)} />
        )}
      </div>

      {/* Distribuição do esforço */}
      {Object.keys(dist).length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Distribuição do esforço</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key: "requisitos", label: "Requisitos (20%)" },
              { key: "projeto", label: "Projeto (30%)" },
              { key: "implementacao", label: "Implementação (40%)" },
              { key: "disponibilizacao", label: "Disponibilização (10%)" },
            ].map(d => (
              <div key={d.key} className="bg-muted/40 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">{d.label}</p>
                <p className="text-sm font-bold text-foreground mt-0.5">{fmtH(dist[d.key] ?? 0)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabela de funções */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Funções cadastradas ({c.funcoes.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground w-8">#</th>
                <th className="text-left px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Descrição</th>
                <th className="text-left px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground w-16">Tipo</th>
                {c.metodologia === "ifpug" && <>
                  <th className="text-left px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground w-20">Compl.</th>
                  <th className="text-left px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Deflator</th>
                </>}
                {c.metodologia === "sfp" && (
                  <th className="text-left px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground w-20">Operação</th>
                )}
                <th className="text-right px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground w-20">PF Bruto</th>
                <th className="text-right px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground w-20">PF Local</th>
              </tr>
            </thead>
            <tbody>
              {c.funcoes.map((f, i) => (
                <tr key={f.id} className={`border-b border-border last:border-0 ${i % 2 !== 0 ? "bg-muted/10" : ""}`}>
                  <td className="px-4 py-2 text-muted-foreground text-xs">{f.ordem + 1}</td>
                  <td className="px-4 py-2 text-foreground">{f.descricao || "—"}</td>
                  <td className="px-4 py-2 font-mono text-xs font-medium text-foreground">{f.tipo}</td>
                  {c.metodologia === "ifpug" && <>
                    <td className="px-4 py-2 text-xs text-muted-foreground">
                      {f.complexidade === "L" ? "Baixa" : f.complexidade === "A" ? "Média" : "Alta"}
                    </td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">{f.deflator_mnemonico ?? "—"}</td>
                  </>}
                  {c.metodologia === "sfp" && (
                    <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{f.operacao ?? "—"}</td>
                  )}
                  <td className="px-4 py-2 text-right font-mono text-xs text-muted-foreground">{fmt(f.pf_bruto)}</td>
                  <td className="px-4 py-2 text-right font-mono text-sm font-bold text-primary">{fmt(f.pf_local)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-muted/30">
                <td colSpan={c.metodologia === "ifpug" ? 5 : 4} className="px-4 py-2 text-xs font-semibold text-foreground">
                  Total
                </td>
                <td className="px-4 py-2 text-right font-mono text-xs font-bold text-muted-foreground">{fmt(c.total_pf_bruto)}</td>
                <td className="px-4 py-2 text-right font-mono text-sm font-bold text-primary">{fmt(c.total_pf_local)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div className="bg-card border border-border rounded-xl p-4">
    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
    <p className={`text-2xl font-bold mt-1 ${highlight ? "text-primary" : "text-foreground"}`}>{value}</p>
  </div>
);

export default APFContagemDetalhe;
