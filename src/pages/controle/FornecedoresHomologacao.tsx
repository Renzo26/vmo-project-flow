import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import EmptyState from "@/components/EmptyState";

type Etapa = 1 | 2 | 3 | 4 | 5;

interface Fornecedor {
  id: string;
  nome: string;
  recebido: string;
  etapa: Etapa;
  etapaLabel: string;
  progresso: number;
  responsavel: string;
  prazo: string;
  prazoStatus: "atrasado" | "ok";
}

const ETAPA_COLORS: Record<Etapa, string> = {
  1: "bg-blue-100 text-blue-700",
  2: "bg-indigo-100 text-indigo-700",
  3: "bg-yellow-100 text-yellow-700",
  4: "bg-orange-100 text-orange-700",
  5: "bg-green-100 text-green-700",
};

const ETAPA_BAR_COLOR: Record<Etapa, string> = {
  1: "bg-blue-500",
  2: "bg-indigo-500",
  3: "bg-yellow-500",
  4: "bg-orange-500",
  5: "bg-green-500",
};

const FORNECEDORES: Fornecedor[] = [];

const etapas = [
  { num: 1 as Etapa, label: "Pré-cadastro", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { num: 2 as Etapa, label: "Cap. técnica", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { num: 3 as Etapa, label: "Doc. e compliance", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { num: 4 as Etapa, label: "Aprovação CE", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { num: 5 as Etapa, label: "Homologado ✓", color: "bg-green-100 text-green-700 border-green-200" },
];

const alerta = FORNECEDORES.find(f => f.prazoStatus === "atrasado");

const FornecedoresHomologacao = () => {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Qualificação e Homologação</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Pipeline de aprovação — 5 etapas sequenciais</p>
        </div>
      </div>

      {/* Alerta */}
      {alerta && (
        <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 text-sm">
          <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />
          <span>
            <span className="font-semibold text-orange-800">{alerta.nome}</span>
            <span className="text-orange-700"> — análise documental pendente há 12 dias. Etapa 3 aguarda a Governança.</span>
          </span>
        </div>
      )}

      {/* Tabela */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fornecedor</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Etapa atual</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Progresso</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Responsável</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Prazo</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ação</th>
            </tr>
          </thead>
          <tbody>
            {FORNECEDORES.map((f, i) => (
              <tr key={f.id} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{f.nome}</p>
                  <p className="text-xs text-muted-foreground">Recebido {f.recebido}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded text-xs font-medium ${ETAPA_COLORS[f.etapa]}`}>
                    {f.etapaLabel}
                  </span>
                </td>
                <td className="px-4 py-3 w-48">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${ETAPA_BAR_COLOR[f.etapa]}`}
                        style={{ width: `${f.progresso}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {f.progresso}% · {f.etapa}/5
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-foreground">{f.responsavel}</td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded text-xs font-medium ${
                    f.prazoStatus === "atrasado"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {f.prazo}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Button
                    size="sm"
                    className={`h-7 text-xs px-3 border-0 ${
                      f.prazoStatus === "atrasado"
                        ? "bg-orange-500 hover:bg-orange-600 text-white"
                        : "bg-ctrl hover:bg-ctrl/90 text-ctrl-foreground"
                    }`}
                  >
                    {f.prazoStatus === "atrasado" ? "Analisar" : "Continuar"}
                  </Button>
                </td>
              </tr>
            ))}
            {FORNECEDORES.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    title="Nenhum fornecedor em qualificação"
                    description="Os fornecedores em processo de homologação aparecerão aqui."
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pipeline visual */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Etapas do processo de qualificação</h3>
        <div className="flex items-center gap-2">
          {etapas.map((e, i) => (
            <div key={e.num} className="flex items-center flex-1">
              <div className={`flex-1 rounded-xl border px-3 py-3 text-center ${e.color}`}>
                <p className="text-[10px] font-semibold uppercase tracking-wider opacity-60 mb-0.5">Etapa {e.num}</p>
                <p className="text-xs font-bold">{e.label}</p>
              </div>
              {i < etapas.length - 1 && (
                <span className="mx-2 text-muted-foreground text-sm shrink-0">→</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FornecedoresHomologacao;
