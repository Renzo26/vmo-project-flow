import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api";
import type { FornecedorOut } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Loader2, Building2 } from "lucide-react";
import EmptyState from "@/components/EmptyState";

const FornecedoresBase = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nome: "", cnpj: "", email: "", telefone: "", categorias: "", senha: "" });
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["fornecedores"],
    queryFn: () => api.get<FornecedorOut[]>("/fornecedores"),
  });

  const criar = useMutation({
    mutationFn: () => api.post<FornecedorOut>("/fornecedores", form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fornecedores"] });
      setOpen(false);
      setForm({ nome: "", cnpj: "", email: "", telefone: "", categorias: "", senha: "" });
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : "Falha ao cadastrar fornecedor."),
  });

  const set = (k: keyof typeof form, v: string) => setForm(prev => ({ ...prev, [k]: v }));
  const canSubmit = form.nome.trim() && form.email.trim() && form.senha.length >= 6;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Base de fornecedores</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Cadastre fornecedores e gere o login de acesso de cada um.</p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); setError(null); }}>
          <DialogTrigger asChild>
            <Button className="gap-1.5"><Plus className="h-4 w-4" /> Cadastrar fornecedor</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Cadastrar fornecedor</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-2">
              <div>
                <Label>Razão social / Nome *</Label>
                <Input value={form.nome} onChange={e => set("nome", e.target.value)} className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>CNPJ</Label>
                  <Input value={form.cnpj} onChange={e => set("cnpj", e.target.value)} className="mt-1" placeholder="00.000.000/0001-00" />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input value={form.telefone} onChange={e => set("telefone", e.target.value)} className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Categorias (opcional)</Label>
                <Input value={form.categorias} onChange={e => set("categorias", e.target.value)} className="mt-1" placeholder="Dev, QA, Infra..." />
              </div>
              <div className="border-t border-border pt-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Login de acesso</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>E-mail *</Label>
                    <Input type="email" value={form.email} onChange={e => set("email", e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label>Senha *</Label>
                    <Input type="password" value={form.senha} onChange={e => set("senha", e.target.value)} className="mt-1" placeholder="mín. 6 caracteres" />
                  </div>
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button onClick={() => { setError(null); criar.mutate(); }} disabled={!canSubmit || criar.isPending} className="w-full">
                {criar.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cadastrar e criar login"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
