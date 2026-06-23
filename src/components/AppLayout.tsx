import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LogOut, FolderKanban, PlusCircle, LayoutDashboard, Settings, History, MessageSquareReply,
  Award, FileText, SlidersHorizontal, Inbox, Calculator, ClipboardList, Building2, UserPlus,
  ShieldCheck, FileCheck2, FileSignature, Table, Calculator as CalcIcon, Briefcase
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
      { label: "Homologação", path: "/controle/fornecedores/homologacao", icon: ShieldCheck },
      { label: "Documentos e certidões", path: "/controle/fornecedores/documentos", icon: FileCheck2 },
      { label: "Scorecard", path: "/controle/scorecard", icon: Award },
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

  const isSolicitante = role === "solicitante";
  const isControle = role === "controle";
  const menu: MenuGroup[] = isControle ? controleMenu : isSolicitante ? solicitanteMenu : fornecedorMenu;
  const sidebarBg = isControle ? "bg-sidebar-ctrl-bg" : isSolicitante ? "bg-sidebar-sol-bg" : "bg-sidebar-forn-bg";
  const sidebarText = isControle ? "text-sidebar-ctrl-fg" : isSolicitante ? "text-sidebar-sol-fg" : "text-sidebar-forn-fg";
  const sidebarWidth = isControle ? "w-[240px]" : "w-[200px]";

  const flatItems: MenuItem[] = menu.flatMap(m => isSection(m) ? m.items : [m]);
  const currentTitle = flatItems.find(m => location.pathname === m.path)?.label
    || flatItems.find(m => location.pathname.startsWith(m.path))?.label
    || "Braesp";

  const renderItem = (item: MenuItem) => {
    const active = location.pathname === item.path;
    return (
      <button
        key={item.label + item.path}
        onClick={() => navigate(item.path)}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
          active ? "bg-white/15 font-medium" : "hover:bg-white/10 opacity-80"
        }`}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        <span className="leading-tight">{item.label}</span>
      </button>
    );
  };

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
            <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center text-[10px] font-bold leading-none">BR</div>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-sm">BRAESP</span>
              <span className="text-[10px] opacity-70">Suprimentos TI</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-none">
          {menu.map((m, idx) => {
            if (isSection(m)) {
              return (
                <div key={m.section} className={idx === 0 ? "" : "pt-3"}>
                  <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider opacity-50">
                    {m.section}
                  </p>
                  <div className="space-y-1">{m.items.map(renderItem)}</div>
                </div>
              );
            }
            return renderItem(m);
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
