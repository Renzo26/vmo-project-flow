import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { mockUsers } from "@/data/mockData";
import { Building2, Wrench } from "lucide-react";

const DevSelector = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const select = (role: "solicitante" | "fornecedor") => {
    const u = mockUsers[role];
    login(role, u.name, u.team);
    navigate(role === "solicitante" ? "/solicitante/projetos" : "/fornecedor/projetos");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Selecione o perfil</h1>
          <p className="text-muted-foreground mt-1">Escolha como deseja acessar o sistema</p>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <button
            onClick={() => select("solicitante")}
            className="group bg-card border border-border rounded-xl p-8 text-center hover:border-primary hover:shadow-lg transition-all duration-200"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Building2 className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Solicitante</h2>
            <p className="text-sm text-muted-foreground mt-1">Área do cliente / empresa</p>
          </button>
          <button
            onClick={() => select("fornecedor")}
            className="group bg-card border border-border rounded-xl p-8 text-center hover:border-success hover:shadow-lg transition-all duration-200"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-success/10 text-success mb-4 group-hover:bg-success group-hover:text-success-foreground transition-colors">
              <Wrench className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Fornecedor</h2>
            <p className="text-sm text-muted-foreground mt-1">Área do prestador</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DevSelector;
