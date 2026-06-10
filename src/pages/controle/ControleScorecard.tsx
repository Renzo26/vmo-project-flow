import { Award, Star, TrendingUp } from "lucide-react";
import EmptyState from "@/components/EmptyState";

const suppliers: { name: string; projects: number; score: number; onTime: number; quality: number }[] = [];

const ControleScorecard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Scorecard de Fornecedores</h2>
        <p className="text-sm text-muted-foreground mt-1">Avaliação consolidada de desempenho</p>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fornecedor</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Projetos</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nota Geral</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Pontualidade</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Qualidade</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s, i) => (
              <tr key={s.name} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-medium text-foreground flex items-center gap-2">
                  {i === 0 && <Award className="h-4 w-4 text-warning" />}
                  {s.name}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{s.projects}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                    <Star className="h-3.5 w-3.5 text-warning fill-warning" />
                    {s.score.toFixed(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{s.onTime}%</td>
                <td className="px-4 py-3 text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-success" />
                    {s.quality.toFixed(1)}
                  </span>
                </td>
              </tr>
            ))}
            {suppliers.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <EmptyState
                    title="Nenhum fornecedor avaliado"
                    description="As avaliações de desempenho aparecerão aqui conforme os projetos forem concluídos."
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ControleScorecard;