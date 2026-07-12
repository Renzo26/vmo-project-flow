import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api, ApiError } from "@/lib/api";
import type { LoginResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, Code2, Loader2, Wrench } from "lucide-react";

const ROUTE_BY_ROLE: Record<string, string> = {
  solicitante: "/solicitante/dashboard",
  fornecedor: "/fornecedor/dashboard",
  controle: "/controle/dashboard",
};

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setSessionData } = useAuth();

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
          <img src="/logo-metri.png" alt="Metri" className="h-24 w-auto mx-auto mb-3" />
          <p className="text-muted-foreground">Suprimentos TI</p>
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
            <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">ou</span></div>
          </div>

          <Button variant="outline" className="w-full border-dashed border-muted-foreground/40 text-muted-foreground hover:text-foreground" onClick={() => navigate("/dev")}>
            <Code2 className="mr-2 h-4 w-4" />
            Entrar como DEV (sem login)
          </Button>
        </div>

        <button
          onClick={() => navigate("/fornecedor-login")}
          className="mt-6 mx-auto flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <Wrench className="h-3 w-3" />
          Sou fornecedor — acessar portal do fornecedor
        </button>

        <p className="text-xs text-center text-muted-foreground mt-3">
          Demo: solicitante@vmo.com / controle@vmo.com — senha: 123456
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
