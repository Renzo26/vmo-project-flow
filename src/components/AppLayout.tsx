import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, FolderKanban, PlusCircle, LayoutDashboard, Settings, History, MessageSquareReply, BarChart3, Award, FileText, SlidersHorizontal } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
}

const solicitanteMenu = [
  { label: "Dashboard", path: "/solicitante/dashboard", icon: LayoutDashboard },
  { label: "Meus Projetos", path: "/solicitante/projetos", icon: FolderKanban },
  { label: "Nova Solicitação", path: "/solicitante/nova-analise", icon: PlusCircle },
];

const fornecedorMenu = [
  { label: "Dashboard", path: "/fornecedor/dashboard", icon: LayoutDashboard },
  { label: "Meus Projetos", path: "/fornecedor/projetos", icon: FolderKanban },
  { label: "Responder Pedido", path: "/fornecedor/projetos", icon: MessageSquareReply },
  { label: "Histórico", path: "/fornecedor/projetos", icon: History },
];

const controleMenu = [
  { label: "Dashboard", path: "/controle/dashboard", icon: LayoutDashboard },
  { label: "Scorecard Fornecedores", path: "/controle/scorecard", icon: Award },
  { label: "Contratos e Preços", path: "/controle/contratos", icon: FileText },
  { label: "Config APF", path: "/controle/apf", icon: SlidersHorizontal },
  { label: "Configuração de Usuário", path: "/controle/configuracoes", icon: Settings },
];

const AppLayout = ({ children }: AppLayoutProps) => {
  const { role, userName, userTeam, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isSolicitante = role === "solicitante";
  const isControle = role === "controle";
  const menu = isControle ? controleMenu : isSolicitante ? solicitanteMenu : fornecedorMenu;
  const sidebarBg = isControle ? "bg-sidebar-ctrl-bg" : isSolicitante ? "bg-sidebar-sol-bg" : "bg-sidebar-forn-bg";
  const sidebarText = isControle ? "text-sidebar-ctrl-fg" : isSolicitante ? "text-sidebar-sol-fg" : "text-sidebar-forn-fg";
  const sidebarWidth = isControle ? "w-[230px]" : "w-[200px]";

  const currentTitle = menu.find(m => location.pathname.startsWith(m.path))?.label || "VMO";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className={`${sidebarWidth} h-screen sticky top-0 flex flex-col ${sidebarBg} ${sidebarText} shrink-0`}>
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-xs font-bold">VMO</div>
            <span className="font-semibold text-sm">VMO</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menu.map(item => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                  active ? "bg-white/15 font-medium" : "hover:bg-white/10 opacity-80"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="leading-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <div className="px-3 py-2">
            <p className="text-xs font-medium truncate">{userName}</p>
            <p className="text-xs opacity-60 truncate">{userTeam}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-white/10 opacity-70 hover:opacity-100 transition-all"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6 shrink-0">
          <h1 className="text-lg font-semibold text-foreground">{currentTitle}</h1>
          <span className="text-sm text-muted-foreground">{userName}</span>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
