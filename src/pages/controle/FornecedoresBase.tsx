import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, PlusCircle } from "lucide-react";

type StatusForn = "Homologado" | "Qualificação" | "Pré-cadastro" | "Bloqueado";
type Risco = "Baixo" | "Médio" | "Alto";

interface Fornecedor {
  id: string;
  nome: string;
  nomeFantasia: string;
  cnpj: string;
  categorias: string[];
  score: number | null;
  risco: Risco;
  status: StatusForn;
}

const FORNECEDORES: Fornecedor[] = [
  { id: "1", nome: "TechSoft Ltda", nomeFantasia: "TechSoft Soluções", cnpj: "12.345.678/0001-99", categorias: ["Dev", "QA"], score: 92, risco: "Baixo", status: "Homologado" },
  { id: "2", nome: "DevBrasil S.A.", nomeFantasia: "DevBrasil S.A.", cnpj: "98.765.432/0001-10", categorias: ["Dev", "Infra"], score: 85, risco: "Baixo", status: "Homologado" },
  { id: "3", nome: "InfoTech Brasil ME", nomeFantasia: "InfoTech Brasil ME", cnpj: "55.123.456/0001-78", categorias: ["Dev"], score: null, risco: "Médio", status: "Qualificação" },
  { id: "4", nome: "CyberSec Ltda", nomeFantasia: "CyberSec", cnpj: "33.987.654/0001-22", categorias: ["Seg"], score: 78, risco: "Baixo", status: "Homologado" },
  { id: "5", nome: "DataMind S.A.", nomeFantasia: "DataMind Analytics", cnpj: "44.123.789/0001-55", categorias: ["Dados", "Dev"], score: 88, risco: "Baixo", status: "Homologado" },
  { id: "6", nome: "CloudBase ME", nomeFantasia: "CloudBase", cnpj: "77.654.321/0001-11", categorias: ["Infra"], score: null, risco: "Médio", status: "Pré-cadastro" },
  { id: "7", nome: "AgileWorks Ltda", nomeFantasia: "AgileWorks", cnpj: "22.333.444/0001-66", categorias: ["AGL", "PMO"], score: 91, risco: "Baixo", status: "Homologado" },
  { id: "8", nome: "SupportHub S.A.", nomeFantasia: "SupportHub", cnpj: "11.222.333/0001-44", categorias: ["SUP"], score: null, risco: "Alto", status: "Bloqueado" },
];

const STATUS_CONFIG: Record<StatusForn, { dot: string; text: string; badge: string }> = {
  Homologado:   { dot: "bg-green-500",  text: "text-green-700",  badge: "text-green-700" },
  Qualificação: { dot: "bg-yellow-500", text: "text-yellow-700", badge: "text-yellow-700" },
  "Pré-cadastro": { dot: "bg-blue-500", text: "text-blue-700",   badge: "text-blue-700" },
  Bloqueado:    { dot: "bg-red-500",    text: "text-red-700",    badge: "text-red-700" },
};

const RISCO_CONFIG: Record<Risco, string> = {
  Baixo: "bg-green-100 text-green-700",
  Médio: "bg-yellow-100 text-yellow-700",
  Alto:  "bg-red-100 text-red-700",
};

const CAT_COLORS: Record<string, string> = {
  Dev:   "bg-blue-100 text-blue-700",
  QA:    "bg-purple-100 text-purple-700",
  Infra: "bg-cyan-100 text-cyan-700",
  Seg:   "bg-red-100 text-red-700",
  Dados: "bg-orange-100 text-orange-700",
  AGL:   "bg-indigo-100 text-indigo-700",
  PMO:   "bg-teal-100 text-teal-700",
  SUP:   "bg-gray-100 text-gray-600",
};

type Filtro = "Todos" | StatusForn;

const FornecedoresBase = () => {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<Filtro>("Todos");
  const [busca, setBusca] = useState("");

  const counts = {
    Todos: FORNECEDORES.length,
    Homologado: FORNECEDORES.filter(f => f.status === "Homologado").length,
    Qualificação: FORNECEDORES.filter(f => f.status === "Qualificação").length,
    "Pré-cadastro": FORNECEDORES.filter(f => f.status === "Pré-cadastro").length,
    Bloqueado: FORNECEDORES.filter(f => f.status === "Bloqueado").length,
  };

  const filtrados = FORNECEDORES.filter(f => {
    const matchFiltro = filtro === "Todos" || f.status === filtro;
    const matchBusca = busca === "" ||
      f.nome.toLowerCase().includes(busca.toLowerCase()) ||
      f.cnpj.includes(busca);
    return matchFiltro && matchBusca;
  });

  const tabs: { key: Filtro; label: string }[] = [
    { key: "Todos",         label: `Todos (${counts.Todos})` },
    { key: "Homologado",    label: `Homologados (${counts.Homologado})` },
    { key: "Qualificação",  label: `Em qualificação (${counts.Qualificação})` },
    { key: "Pré-cadastro",  label: `Pré-cadastro (${counts["Pré-cadastro"]})` },
    { key: "Bloqueado",     label: `Bloqueados (${counts.Bloqueado})` },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Fornecedores cadastrados</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {counts.Todos} fornecedores · atualizado 23/04/2026
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar por nome/CNPJ..."
              className="pl-8 h-8 text-sm w-52"
            />
          </div>
          <Button
            size="sm"
            className="gap-1.5 bg-ctrl hover:bg-ctrl/90 text-ctrl-foreground border-0 text-xs h-8"
            onClick={() => navigate("/controle/fornecedores/novo")}
          >
            <PlusCircle className="h-3.5 w-3.5" /> Novo fornecedor
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setFiltro(t.key)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              filtro === t.key
                ? "bg-ctrl text-ctrl-foreground border-ctrl"
                : "bg-background text-muted-foreground border-border hover:border-ctrl/40"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fornecedor</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">CNPJ</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Categorias</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Score</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Risco</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ação</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  Nenhum fornecedor encontrado.
                </td>
              </tr>
            )}
            {filtrados.map(f => {
              const st = STATUS_CONFIG[f.status];
              return (
                <tr key={f.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground">{f.nome}</p>
                    {f.nomeFantasia !== f.nome && (
                      <p className="text-xs text-muted-foreground">{f.nomeFantasia}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{f.cnpj}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {f.categorias.map(c => (
                        <span key={c} className={`px-2 py-0.5 rounded text-[11px] font-medium ${CAT_COLORS[c] ?? "bg-muted text-muted-foreground"}`}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {f.score !== null
                      ? <span className="font-semibold text-foreground">{f.score}/100</span>
                      : <span className="text-muted-foreground">—</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded text-xs font-medium ${RISCO_CONFIG[f.risco]}`}>
                      {f.risco}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${st.dot}`} />
                      <span className={`text-sm font-medium ${st.text}`}>{f.status}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      className={`h-7 text-xs px-3 border-0 ${
                        f.status === "Qualificação"
                          ? "bg-orange-500 hover:bg-orange-600 text-white"
                          : "bg-ctrl hover:bg-ctrl/90 text-ctrl-foreground"
                      }`}
                    >
                      {f.status === "Qualificação" ? "Analisar" : "Ver"}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FornecedoresBase;
