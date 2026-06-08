import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { mockUsers } from "@/data/mockData";
import { api, ApiError } from "@/lib/api";
import type { LoginResponse } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, Wrench, Loader2, ArrowLeft } from "lucide-react";

const FornecedorLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setSessionData, login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post<LoginResponse>("/auth/login", { email, senha: password });
      if (res.user.role !== "fornecedor") {
        setError("Este acesso é exclusivo para fornecedores.");
        return;
      }
      setSessionData({
        token: res.access_token,
        role: res.user.role,
        name: res.user.nome,
        team: res.user.team ?? "",
        userId: res.user.id,
        fornecedorId: res.user.fornecedor_id,
      });
      navigate("/fornecedor/projetos");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao conectar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const loginDev = () => {
    const u = mockUsers.fornecedor;
    login("fornecedor", u.name, u.team);
    navigate("/fornecedor/projetos");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-success mb-4">
            <Wrench className="h-8 w-8 text-success-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Portal do Fornecedor</h1>
          <p className="text-muted-foreground mt-1">BRAESP — Suprimentos TI</p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@empresa.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full bg-success hover:bg-success/90 text-success-foreground" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Entrando...</> : "Entrar como Fornecedor"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full border-dashed border-success/40 text-success hover:bg-success/5 hover:border-success"
            onClick={loginDev}
          >
            <Wrench className="mr-2 h-4 w-4" />
            Entrar como Fornecedor (DEV)
          </Button>
        </div>

        {/* Voltar */}
        <button
          onClick={() => navigate("/")}
          className="mt-6 mx-auto flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Voltar para o login principal
        </button>

        <p className="text-xs text-center text-muted-foreground mt-3">
          Acesso criado pelo Controle Econômico da BRAESP
        </p>
      </div>
    </div>
  );
};

export default FornecedorLoginPage;
