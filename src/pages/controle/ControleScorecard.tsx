import { Award, Star, TrendingUp } from "lucide-react";

const suppliers = [
  { name: "TechSoft", projects: 12, score: 4.8, onTime: 95, quality: 4.9 },
  { name: "DevBrasil", projects: 9, score: 4.5, onTime: 88, quality: 4.6 },
  { name: "InfoSystems", projects: 7, score: 4.3, onTime: 82, quality: 4.2 },
  { name: "CodeWorks", projects: 5, score: 4.0, onTime: 75, quality: 4.0 },
  { name: "DataLab", projects: 3, score: 3.7, onTime: 70, quality: 3.8 },
];

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
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ControleScorecard;