import { useParams, useNavigate } from "react-router-dom";
import { mockProjects, statusLabels, statusColors } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Calendar, User, Tag, Clock, DollarSign } from "lucide-react";

const SolicitanteProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = mockProjects.find(p => p.id === id);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-muted-foreground">Projeto não encontrado.</p>
        <Button variant="outline" onClick={() => navigate("/solicitante/projetos")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
      </div>
    );
  }

  const timeline = [
    { date: "10/03/2024", event: "Análise criada pelo solicitante" },
    { date: "11/03/2024", event: "Enviada para Fornecedor" },
    { date: "13/03/2024", event: "Proposta recebida" },
    ...(project.status === "corrigir" ? [{ date: "14/03/2024", event: "Proposta devolvida para correção" }] : []),
    ...(project.status === "contratado" ? [{ date: "15/03/2024", event: "Proposta aprovada e contratada" }] : []),
    ...(project.status === "concluido" ? [
      { date: "15/03/2024", event: "Proposta aprovada e contratada" },
      { date: "20/04/2024", event: "Projeto concluído" },
    ] : []),
  ];

  return (
    <div>
      <Button variant="ghost" className="mb-4 text-muted-foreground" onClick={() => navigate("/solicitante/projetos")}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Voltar aos projetos
      </Button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
          <p className="text-sm text-muted-foreground">{project.id}</p>
        </div>
        <Badge variant="outline" className={`text-sm px-3 py-1 ${statusColors[project.status]}`}>
          {statusLabels[project.status]}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info principal */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Informações do Projeto</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Tipo</p>
                  <p className="text-sm font-medium text-foreground">{project.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Fornecedor</p>
                  <p className="text-sm font-medium text-foreground">{project.supplier}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Classificação</p>
                  <p className="text-sm font-medium text-foreground">{project.capex ? "CAPEX" : "OPEX"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Urgência</p>
                  <p className="text-sm font-medium text-foreground">{project.urgent ? "Emergencial" : "Normal"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Escopo</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Este projeto contempla a análise, desenvolvimento e entrega do módulo "{project.name}".
              A equipe do fornecedor deverá seguir os padrões de qualidade e prazos estabelecidos no contrato vigente.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>Documento de escopo anexado (escopo_{project.id}.pdf)</span>
            </div>
          </div>

          {/* Proposta recebida */}
          {(project.status === "contratado" || project.status === "concluido" || project.status === "corrigir") && (
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Proposta do Fornecedor</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium">Atividade</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Horas</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Custo/h</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="py-2 text-foreground">Análise</td>
                    <td className="py-2 text-right text-foreground">20</td>
                    <td className="py-2 text-right text-foreground">R$ 160</td>
                    <td className="py-2 text-right font-medium text-foreground">R$ 3.200</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2 text-foreground">Codificação</td>
                    <td className="py-2 text-right text-foreground">40</td>
                    <td className="py-2 text-right text-foreground">R$ 200</td>
                    <td className="py-2 text-right font-medium text-foreground">R$ 8.000</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-foreground">Testes</td>
                    <td className="py-2 text-right text-foreground">15</td>
                    <td className="py-2 text-right text-foreground">R$ 180</td>
                    <td className="py-2 text-right font-medium text-foreground">R$ 2.700</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t border-border">
                    <td colSpan={3} className="py-3 font-semibold text-foreground">Total</td>
                    <td className="py-3 text-right font-bold text-primary">R$ 13.900</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Sidebar - Timeline e ações */}
        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Histórico</h2>
            <div className="space-y-4">
              {timeline.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5" />
                    {i < timeline.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                    <p className="text-sm text-foreground">{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {project.status === "aguardando" && (
            <div className="bg-warning/10 border border-warning/30 rounded-xl p-4">
              <p className="text-sm font-medium text-warning">Aguardando proposta do fornecedor</p>
              <p className="text-xs text-muted-foreground mt-1">O fornecedor tem até 5 dias úteis para responder.</p>
            </div>
          )}

          {project.status === "corrigir" && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4">
              <p className="text-sm font-medium text-destructive">Proposta devolvida para correção</p>
              <p className="text-xs text-muted-foreground mt-1">Valores acima do contrato vigente. Aguardando nova proposta.</p>
            </div>
          )}

          {project.status === "aguardando" && (
            <Button variant="destructive" className="w-full">Cancelar Pedido</Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SolicitanteProjectDetail;
