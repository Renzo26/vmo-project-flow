import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import DevSelector from "./pages/DevSelector";
import SolicitanteProjects from "./pages/SolicitanteProjects";
import SolicitanteDashboard from "./pages/SolicitanteDashboard";
import Configuracoes from "./pages/Configuracoes";
import NovaAnalise from "./pages/NovaAnalise";
import FornecedorProjects from "./pages/FornecedorProjects";
import SolicitanteProjectDetail from "./pages/SolicitanteProjectDetail";
import FornecedorProjectDetail from "./pages/FornecedorProjectDetail";
import AppLayout from "./components/AppLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/dev" element={<DevSelector />} />
            <Route path="/solicitante/projetos" element={<AppLayout><SolicitanteProjects /></AppLayout>} />
            <Route path="/solicitante/dashboard" element={<AppLayout><SolicitanteDashboard /></AppLayout>} />
            <Route path="/solicitante/configuracoes" element={<AppLayout><Configuracoes /></AppLayout>} />
            <Route path="/solicitante/nova-analise" element={<AppLayout><NovaAnalise /></AppLayout>} />
            <Route path="/fornecedor/projetos" element={<AppLayout><FornecedorProjects /></AppLayout>} />
            <Route path="/fornecedor/projeto/:id" element={<AppLayout><FornecedorProjectDetail /></AppLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
