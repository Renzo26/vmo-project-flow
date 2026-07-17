import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  LogOut, FolderKanban, PlusCircle, LayoutDashboard, Settings, History, MessageSquareReply,
  Award, FileText, SlidersHorizontal, Inbox, Calculator, ClipboardList, Building2, UserPlus,
  FileCheck2, FileSignature, Table, Calculator as CalcIcon, Briefcase,
  Sun, Moon, ChevronDown,
} from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
}

type MenuItem = { label: string; path: string; icon: typeof LayoutDashboard };
type MenuSection = { section: string; items: MenuItem[] };
type MenuGroup = MenuItem | MenuSection;

const isSection = (m: MenuGroup): m is MenuSection => "section" in m;

const solicitanteMenu = [
  { label: "Dashboard", path: "/solicitante/dashboard", icon: LayoutDashboard },
  { label: "Minhas Solicitações", path: "/solicitante/projetos", icon: FolderKanban },
  { label: "Nova Solicitação", path: "/solicitante/nova-analise", icon: PlusCircle },
];

const fornecedorMenu = [
  { label: "Dashboard", path: "/fornecedor/dashboard", icon: LayoutDashboard },
  { label: "Meus Projetos", path: "/fornecedor/projetos", icon: FolderKanban },
  { label: "Documentos e Certidões", path: "/fornecedor/documentos", icon: FileCheck2 },
];

const controleMenu: MenuGroup[] = [
  {
    section: "Dashboard",
    items: [
      { label: "Visão geral", path: "/controle/dashboard", icon: LayoutDashboard },
      { label: "Fornecedores", path: "/controle/fornecedores/dashboard", icon: Building2 },
    ],
  },
  {
    section: "Solicitações de contratação",
    items: [
      { label: "Solicitações recebidas", path: "/controle/solicitacoes/recebidas", icon: Inbox },
    ],
  },
  {
    section: "Fornecedores",
    items: [
      { label: "Base de fornecedores", path: "/controle/fornecedores/base", icon: Building2 },
      { label: "Cadastro de fornecedor", path: "/controle/fornecedores/novo", icon: UserPlus },
      { label: "NPS Fornecedor", path: "/controle/scorecard", icon: Award },
    ],
  },
  {
    section: "APF",
    items: [
      { label: "Nova Contagem", path: "/controle/apf/nova", icon: PlusCircle },
      { label: "Histórico de contagens", path: "/controle/apf/historico", icon: History },
      { label: "Configurar APF", path: "/controle/apf", icon: SlidersHorizontal },
    ],
  },
  {
    section: "Contratos",
    items: [
      { label: "Contratos ativos", path: "/controle/contratos/ativos", icon: FileSignature },
      { label: "Tabela R$/PF", path: "/controle/contratos/tabela-pf", icon: Table },
    ],
  },
  {
    section: "Configurações",
    items: [
      { label: "Configuração de Usuário", path: "/controle/configuracoes", icon: Settings },
    ],
  },
];

const AppLayout = ({ children }: AppLayoutProps) => {
  const { role, userName, userTeam, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { resolvedTheme, setTheme } = useTheme();

  const isSolicitante = role === "solicitante";
  const isControle = role === "controle";
  const menu: MenuGroup[] = isControle ? controleMenu : isSolicitante ? solicitanteMenu : fornecedorMenu;

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Pílula ativa invertida (branca no dark / escura no light) — assinatura do design
  const pillActive = "bg-foreground text-background font-medium shadow-sm";
  const pillIdle = "text-muted-foreground hover:text-foreground";

  const navItem = (item: MenuItem) => {
    const active = location.pathname === item.path;
    return (
      <button
        key={item.label + item.path}
        onClick={() => navigate(item.path)}
        className={`flex items-center gap-2 h-9 px-4 rounded-full text-sm whitespace-nowrap transition-colors ${
          active ? pillActive : pillIdle
        }`}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        <span>{item.label}</span>
      </button>
    );
  };

  const sectionMenu = (m: MenuSection) => {
    const active = m.items.some(i => isActive(i.path));
    return (
      <DropdownMenu key={m.section}>
        <DropdownMenuTrigger asChild>
          <button
            className={`flex items-center gap-1.5 h-9 px-4 rounded-full text-sm whitespace-nowrap outline-none transition-colors ${
              active ? pillActive : pillIdle
            }`}
          >
            {m.section}
            <ChevronDown className="h-3.5 w-3.5 opacity-70" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 rounded-2xl p-1.5">
          {m.items.map(item => (
            <DropdownMenuItem
              key={item.label + item.path}
              onClick={() => navigate(item.path)}
              className={`cursor-pointer rounded-full px-3 ${location.pathname === item.path ? "bg-accent text-accent-foreground font-medium" : ""}`}
            >
              <item.icon className="h-4 w-4 mr-2 shrink-0" />
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Barra superior fundida ao fundo — navegação em pill container (estilo Quark) */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur">
        <div className="h-16 px-4 md:px-6 flex items-center gap-3">
          {/* Marca em chip */}
          <div className="flex items-center gap-2.5 h-11 pl-1.5 pr-4 rounded-full bg-card border border-border shrink-0">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 overflow-hidden">
              <img src="/logo-metri-symbol.png" alt="Metri" className="w-6 h-6 object-contain" />
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-semibold text-sm text-foreground">Metri</span>
              <span className="text-[10px] text-muted-foreground">Vendor Management System</span>
            </div>
          </div>

          {/* Navegação em container pill centralizado */}
          <div className="flex-1 flex justify-center min-w-0">
            <nav className="flex items-center gap-0.5 h-11 px-1.5 rounded-full bg-card border border-border overflow-x-auto scrollbar-none max-w-full">
              {menu.map(m => (isSection(m) ? sectionMenu(m) : navItem(m)))}
            </nav>
          </div>

          {/* Ações à direita */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              title="Alternar tema"
              aria-label="Alternar tema claro/escuro"
              className="w-11 h-11 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <div className="hidden lg:flex items-center gap-2.5 h-11 px-4 rounded-full bg-card border border-border">
              <div className="flex flex-col items-end leading-tight">
                <span className="text-xs font-medium text-foreground truncate max-w-[140px]">{userName}</span>
                {userTeam && <span className="text-[10px] text-muted-foreground truncate max-w-[140px]">{userTeam}</span>}
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sair"
              aria-label="Sair"
              className="flex items-center gap-2 h-11 px-4 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="hidden md:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
