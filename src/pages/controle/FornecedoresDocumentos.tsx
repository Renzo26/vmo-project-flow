import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

type TipoDoc = "Fiscal" | "Trabalhista" | "Certificação" | "Jurídico" | "Técnico";
type StatusDoc = "Vencido" | "Vencendo" | "Válido";

interface Documento {
  id: string;
  fornecedor: string;
  documento: string;
  tipo: TipoDoc;
  vencimento: string;
  vencimentoTs: number;
  status: StatusDoc;
  diasRestantes: number | null;
}

const TIPO_CONFIG: Record<TipoDoc, string> = {
  Fiscal:       "bg-yellow-100 text-yellow-700",
  Trabalhista:  "bg-orange-100 text-orange-700",
  Certificação: "bg-purple-100 text-purple-700",
  Jurídico:     "bg-blue-100 text-blue-700",
  Técnico:      "bg-cyan-100 text-cyan-700",
};

const DOCUMENTOS: Documento[] = [
  { id: "1", fornecedor: "TechSoft Ltda",    documento: "CND Federal",   tipo: "Fiscal",       vencimento: "08/04/2026", vencimentoTs: 1, status: "Vencido",   diasRestantes: null },
  { id: "2", fornecedor: "DevBrasil S.A.",   documento: "CNDT — TST",    tipo: "Trabalhista",  vencimento: "28/04/2026", vencimentoTs: 2, status: "Vencendo",  diasRestantes: 5 },
  { id: "3", fornecedor: "InfoSystems ME",   documento: "ISO 27001",     tipo: "Certificação", vencimento: "30/06/2026", vencimentoTs: 3, status: "Válido",    diasRestantes: 68 },
  { id: "4", fornecedor: "TechSoft Ltda",    documento: "CND Estadual",  tipo: "Fiscal",       vencimento: "15/05/2026", vencimentoTs: 4, status: "Vencendo",  diasRestantes: 17 },
  { id: "5", fornecedor: "CyberSec Ltda",    documento: "FGTS",          tipo: "Trabalhista",  vencimento: "01/03/2026", vencimentoTs: 5, status: "Vencido",   diasRestantes: null },
  { id: "6", fornecedor: "DataMind S.A.",    documento: "Contrato Social",tipo: "Jurídico",    vencimento: "31/12/2026", vencimentoTs: 6, status: "Válido",    diasRestantes: 247 },
  { id: "7", fornecedor: "AgileWorks Ltda",  documento: "ISO 9001",      tipo: "Certificação", vencimento: "20/05/2026", vencimentoTs: 7, status: "Vencendo",  diasRestantes: 22 },
  { id: "8", fornecedor: "CloudBase ME",     documento: "CND Federal",   tipo: "Fiscal",       vencimento: "10/02/2026", vencimentoTs: 8, status: "Vencido",   diasRestantes: null },
];

const statusLabel = (doc: Documento): string => {
  if (doc.status === "Vencido") return "Vencido";
  if (doc.status === "Vencendo") return `${doc.diasRestantes} dias`;
  return `Válido ${doc.diasRestantes}d`;
};

const statusClass = (doc: Documento): string => {
  if (doc.status === "Vencido")  return "bg-red-100 text-red-700";
  if (doc.status === "Vencendo") return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-700";
};

const vencimentoClass = (doc: Documento): string => {
  if (doc.status === "Vencido")  return "text-red-600 font-semibold";
  if (doc.status === "Vencendo") return "text-orange-600 font-semibold";
  return "text-foreground";
};

const FornecedoresDocumentos = () => {
  const [filtro, setFiltro] = useState<StatusDoc | "Todos">("Todos");

  const validos   = DOCUMENTOS.filter(d => d.status === "Válido").length;
  const vencidos  = DOCUMENTOS.filter(d => d.status === "Vencido").length;
  const vencendo  = DOCUMENTOS.filter(d => d.status === "Vencendo").length;
  const total     = DOCUMENTOS.length;

  const lista = filtro === "Todos" ? DOCUMENTOS : DOCUMENTOS.filter(d => d.status === filtro);

  const kpis = [
    { label: "Documentos válidos", value: validos,  color: "border-t-green-500",  filtro: "Válido" as const },
    { label: "Vencidos",           value: vencidos, color: "border-t-red-500",    filtro: "Vencido" as const },
    { label: "Vencendo 30d",       value: vencendo, color: "border-t-yellow-500", filtro: "Vencendo" as const },
    { label: "Total monitorados",  value: total,    color: "border-t-blue-500",   filtro: "Todos" as const },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Documentos e certidões</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Monitoramento automático</span>
          <Button size="sm" className="gap-1.5 bg-ctrl hover:bg-ctrl/90 text-ctrl-foreground border-0 text-xs">
            <PlusCircle className="h-3.5 w-3.5" /> Analisar solicitação
          </Button>
        </div>
      </div>

      {/* Subtítulo */}
      <h3 className="text-lg font-bold text-foreground -mb-2">Documentos e certidões</h3>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map(k => (
          <button
            key={k.label}
            onClick={() => setFiltro(k.filtro)}
            className={`bg-card border border-border border-t-4 ${k.color} rounded-xl p-4 text-left transition-all hover:shadow-sm ${
              filtro === k.filtro ? "ring-2 ring-ctrl/30" : ""
            }`}
          >
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className="text-3xl font-bold text-foreground mt-1">{k.value}</p>
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fornecedor</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Documento</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tipo</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vencimento</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ação</th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">
                  Nenhum documento encontrado.
                </td>
              </tr>
            )}
            {lista.map(doc => (
              <tr key={doc.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-6 py-4 font-semibold text-foreground">{doc.fornecedor}</td>
                <td className="px-6 py-4 text-foreground">{doc.documento}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${TIPO_CONFIG[doc.tipo]}`}>
                    {doc.tipo}
                  </span>
                </td>
                <td className={`px-6 py-4 font-medium ${vencimentoClass(doc)}`}>{doc.vencimento}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusClass(doc)}`}>
                    {statusLabel(doc)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {doc.status !== "Válido" ? (
                    <Button
                      size="sm"
                      className={`h-8 text-xs px-4 border-0 rounded-lg ${
                        doc.status === "Vencido"
                          ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                          : "bg-orange-500 hover:bg-orange-600 text-white"
                      }`}
                    >
                      Notificar
                    </Button>
                  ) : (
                    <button className="text-sm text-muted-foreground hover:text-foreground transition-colors px-1">
                      Ver
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FornecedoresDocumentos;
