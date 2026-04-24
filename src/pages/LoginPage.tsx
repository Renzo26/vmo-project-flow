import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { mockUsers } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, Code2 } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (email === "solicitante@vmo.com" && password === "123456") {
      login("solicitante", mockUsers.solicitante.name, mockUsers.solicitante.team);
      navigate("/solicitante/projetos");
    } else if (email === "fornecedor@vmo.com" && password === "123456") {
      login("fornecedor", mockUsers.fornecedor.name, mockUsers.fornecedor.team);
      navigate("/fornecedor/dashboard");
    } else if (email === "controle@vmo.com" && password === "123456") {
      login("controle", mockUsers.controle.name, mockUsers.controle.team);
      navigate("/controle/dashboard");
    } else {
      setError("Credenciais inválidas. Tente novamente.");
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
            <Button type="submit" className="w-full">Entrar</Button>
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

        <p className="text-xs text-center text-muted-foreground mt-6">
          Dev: solicitante@vmo.com / fornecedor@vmo.com / controle@vmo.com — senha: 123456
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
