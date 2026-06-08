import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api, ApiError } from "@/lib/api";
import type { LoginResponse } from "@/lib/types";
import { mockUsers } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, Building2, Wrench, BarChart3, Loader2 } from "lucide-react";

const ROUTE_BY_ROLE: Record<string, string> = {
  solicitante: "/solicitante/projetos",
  fornecedor: "/fornecedor/projetos",
  controle: "/controle/solicitacoes/recebidas",
};

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setSessionData, login } = useAuth();

  const DEV_ROLES = [
    { role: "solicitante" as const, label: "Solicitante", icon: Building2, route: "/solicitante/projetos", color: "hover:border-primary hover:text-primary" },
    { role: "fornecedor" as const, label: "Fornecedor", icon: Wrench, route: "/fornecedor/projetos", color: "hover:border-success hover:text-success" },
    { role: "controle" as const, label: "Controle", icon: BarChart3, route: "/controle/dashboard", color: "hover:border-ctrl hover:text-ctrl" },
  ];

  const loginDev = (role: "solicitante" | "fornecedor" | "controle", route: string) => {
    const u = mockUsers[role];
    login(role, u.name, u.team);
    navigate(route);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post<LoginResponse>("/auth/login", { email, senha: password });
      setSessionData({
        token: res.access_token,
        role: res.user.role,
        name: res.user.nome,
        team: res.user.team ?? "",
        userId: res.user.id,
        fornecedorId: res.user.fornecedor_id,
      });
      navigate(ROUTE_BY_ROLE[res.user.role] ?? "/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao conectar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <span className="text-lg font-bold text-primary-foreground">BR</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">BRAESP</h1>
          <p className="text-muted-foreground mt-1">Suprimentos TI</p>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••" value={password} onChange={e => setPassword(e.target.value)} className="pl-10" />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Entrando...</> : "Entrar"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">acesso rápido DEV</span></div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {DEV_ROLES.map(({ role, label, icon: Icon, route, color }) => (
              <button
                key={role}
                onClick={() => loginDev(role, route)}
                className={`flex flex-col items-center gap-1.5 rounded-lg border border-dashed border-muted-foreground/30 px-2 py-3 text-muted-foreground transition-colors ${color}`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-6">
          Demo: solicitante@vmo.com / controle@vmo.com — senha: 123456
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
