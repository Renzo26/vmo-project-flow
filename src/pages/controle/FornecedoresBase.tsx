import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { FornecedorOut } from "@/lib/types";
import { Loader2, Building2 } from "lucide-react";
import EmptyState from "@/components/EmptyState";

const FornecedoresBase = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["fornecedores"],
    queryFn: () => api.get<FornecedorOut[]>("/fornecedores"),
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Base de fornecedores</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Fornecedores cadastrados e seus logins de acesso.</p>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fornecedor</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">CNPJ</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">E-mail (login)</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Categorias</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>
            )}
            {!isLoading && (data ?? []).map(f => (
              <tr key={f.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="px-4 py-3 font-medium text-foreground flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" /> {f.nome}
                </td>
                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{f.cnpj ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{f.email ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{f.categorias ?? "—"}</td>
              </tr>
            ))}
            {!isLoading && (data ?? []).length === 0 && (
              <tr>
                <td colSpan={4}>
                  <EmptyState
                    title="Nenhum fornecedor cadastrado"
                    description="Cadastre um fornecedor para gerar o login e poder direcionar solicitações a ele."
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

export default FornecedoresBase;
