import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, Download, TrendingDown, TrendingUp, Minus } from "lucide-react";

type Parecer = "Aprovado" | "Negociado" | "Recusado" | "Em análise";
type Metodo = "IFPUG PFS" | "NESMA Est." | "COSMIC";

interface Contagem {
  id: string;
  solicitacao: string;
  projeto: string;
  data: string;
  metodo: Metodo;
  pe: number;
  al: number;
  pfs: number;
  valorEstimado: number;
  valorEnviado: number;
  fornecedor: string;
  parecer: Parecer;
}

const HISTORICO: Contagem[] = [
  {
    id: "1",
    solicitacao: "VMO-2026-031",
    projeto: "Portal Vendas B2B",
    data: "02/03/2026",
    metodo: "IFPUG PFS",
    pe: 28,
    al: 8,
    pfs: 184.8,
    valorEstimado: 151536,
    valorEnviado: 148200,
    fornecedor: "TechSoft Ltda",
    parecer: "Aprovado",
  },
  {
    id: "2",
    solicitacao: "VMO-2025-089",
    projeto: "Automação Fiscal",
    data: "15/01/2026",
    metodo: "IFPUG PFS",
    pe: 15,
    al: 5,
    pfs: 104.0,
    valorEstimado: 85280,
    valorEnviado: 85280,
    fornecedor: "DevBrasil S.A.",
    parecer: "Aprovado",
  },
  {
    id: "3",
    solicitacao: "VMO-2025-082",
    projeto: "Dashboard Analytics",
    data: "05/12/2025",
    metodo: "NESMA Est.",
    pe: 8,
    al: 3,
    pfs: 57.8,
    valorEstimado: 47396,
    valorEnviado: 44900,
    fornecedor: "InfoSystems ME",
    parecer: "Negociado",
  },
  {
    id: "4",
    solicitacao: "VMO-2025-071",
    projeto: "Módulo CRM",
    data: "18/11/2025",
    metodo: "IFPUG PFS",
    pe: 22,
    al: 6,
    pfs: 143.2,
    valorEstimado: 117424,
    valorEnviado: 128000,
    fornecedor: "Soluções Corp",
    parecer: "Recusado",
  },
  {
    id: "5",
    solicitacao: "VMO-2025-064",
    projeto: "Sistema RH Mobile",
    data: "03/10/2025",
    metodo: "COSMIC",
    pe: 19,
    al: 7,
    pfs: 136.6,
    valorEstimado: 112012,
    valorEnviado: 109500,
    fornecedor: "TechSoft Ltda",
    parecer: "Em análise",
  },
  {
    id: "6",
    solicitacao: "VMO-2025-058",
    projeto: "Integração Bancária PIX",
    data: "12/09/2025",
    metodo: "IFPUG PFS",
    pe: 11,
    al: 4,
    pfs: 79.2,
    valorEstimado: 64944,
    valorEnviado: 62000,
    fornecedor: "DevBrasil S.A.",
    parecer: "Aprovado",
  },
];

const PARECER_CFG: Record<Parecer, string> = {
  Aprovado: "bg-success/10 text-success border border-success/30",
  Negociado: "bg-warning/10 text-warning border border-warning/30",
  Recusado: "bg-destructive/10 text-destructive border border-destructive/30",
  "Em análise": "bg-primary/10 text-primary border border-primary/30",
};

const METODO_CFG: Record<Metodo, string> = {
  "IFPUG PFS": "bg-blue-50 text-blue-600 border border-blue-200",
  "NESMA Est.": "bg-teal-50 text-teal-600 border border-teal-200",
  COSMIC: "bg-purple-50 text-purple-600 border border-purple-200",
};

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const SavingCell = ({ estimado, enviado }: { estimado: number; enviado: number }) => {
  const diff = estimado - enviado;
  const pct = ((diff / estimado) * 100).toFixed(1);
  if (diff > 0)
    return (
      <span className="flex items-center gap-1 text-success font-medium text-xs">
        <TrendingDown className="h-3.5 w-3.5" />
        {fmt(diff)} <span className="text-muted-foreground font-normal">({pct}%)</span>
      </span>
    );
  if (diff < 0)
    return (
      <span className="flex items-center gap-1 text-destructive font-medium text-xs">
        <TrendingUp className="h-3.5 w-3.5" />
        {fmt(Math.abs(diff))} <span className="text-muted-foreground font-normal">({Math.abs(Number(pct))}%)</span>
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-muted-foreground text-xs">
      <Minus className="h-3.5 w-3.5" />
      R$ 0,00
    </span>
  );
};

const APFHistorico = () => {
  const [busca, setBusca] = useState("");

  const filtered = HISTORICO.filter((c) => {
    const q = busca.toLowerCase();
    return (
      !busca ||
      c.solicitacao.toLowerCase().includes(q) ||
      c.projeto.toLowerCase().includes(q) ||
      c.fornecedor.toLowerCase().includes(q)
    );
  });

  const totalPFS = filtered.reduce((s, c) => s + c.pfs, 0);
  const totalEstimado = filtered.reduce((s, c) => s + c.valorEstimado, 0);
  const totalEnviado = filtered.reduce((s, c) => s + c.valorEnviado, 0);
  const totalSaving = totalEstimado - totalEnviado;

  return (
    <div className="space-y-5">

      {/* Header + actions */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-foreground">Histórico de contagens APF</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Todas as contagens realizadas com comparativo de valores
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar projeto ou fornecedor..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-8 h-8 text-sm w-60"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 h-8">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filtros
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 h-8">
            <Download className="h-3.5 w-3.5" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Solicitação</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Projeto</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Data</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Método</th>
                <th className="text-center px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">PE</th>
                <th className="text-center px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">AL</th>
                <th className="text-center px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">PFS</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Valor estimado</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">Valor enviado</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Saving</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Fornecedor</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Parecer</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={12} className="text-center py-10 text-sm text-muted-foreground">
                    Nenhuma contagem encontrada.
                  </td>
                </tr>
              )}
              {filtered.map((c, i) => (
                <tr
                  key={c.id}
                  className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${
                    i % 2 === 0 ? "" : "bg-muted/10"
                  }`}
                >
                  <td className="px-4 py-3 text-primary font-medium text-xs whitespace-nowrap">{c.solicitacao}</td>
                  <td className="px-4 py-3 text-foreground font-medium min-w-[120px]">{c.projeto}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{c.data}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5 items-start">
                      {c.metodo.split(" ").map((part) => (
                        <span key={part} className={`px-2 py-0.5 rounded text-[11px] font-medium ${METODO_CFG[c.metodo]}`}>
                          {part}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-foreground">{c.pe}</td>
                  <td className="px-4 py-3 text-center text-foreground">{c.al}</td>
                  <td className="px-4 py-3 text-center font-semibold text-foreground">{c.pfs.toFixed(1)}</td>
                  <td className="px-4 py-3 text-right text-foreground whitespace-nowrap">{fmt(c.valorEstimado)}</td>
                  <td className="px-4 py-3 text-right text-foreground whitespace-nowrap">{fmt(c.valorEnviado)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <SavingCell estimado={c.valorEstimado} enviado={c.valorEnviado} />
                  </td>
                  <td className="px-4 py-3 text-foreground whitespace-nowrap text-xs">{c.fornecedor}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${PARECER_CFG[c.parecer]}`}>
                      {c.parecer}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-border bg-muted/30">
                  <td colSpan={7} className="px-4 py-3 text-xs font-semibold text-foreground">
                    Totais ({filtered.length} contagens)
                  </td>
                  <td className="px-4 py-3 text-right text-xs font-bold text-foreground whitespace-nowrap">
                    {fmt(totalEstimado)}
                  </td>
                  <td className="px-4 py-3 text-right text-xs font-bold text-foreground whitespace-nowrap">
                    {fmt(totalEnviado)}
                  </td>
                  <td className="px-4 py-3">
                    <SavingCell estimado={totalEstimado} enviado={totalEnviado} />
                  </td>
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
