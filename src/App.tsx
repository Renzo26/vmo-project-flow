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
import FornecedorDashboard from "./pages/FornecedorDashboard";
import SolicitanteProjectDetail from "./pages/SolicitanteProjectDetail";
import FornecedorProjectDetail from "./pages/FornecedorProjectDetail";
import ControleScorecard from "./pages/controle/ControleScorecard";
import ControleContratos from "./pages/controle/ControleContratos";
import ControleAPF from "./pages/controle/ControleAPF";
import ControleDashboard from "./pages/controle/ControleDashboard";
import SolicitacoesRecebidas from "./pages/controle/SolicitacoesRecebidas";
import SolicitacoesAnaliseAPF from "./pages/controle/SolicitacoesAnaliseAPF";
import AcompanharProjetos from "./pages/controle/AcompanharProjetos";
import APFNovaContagem from "./pages/controle/APFNovaContagem";
import APFHistorico from "./pages/controle/APFHistorico";
import FornecedoresBase from "./pages/controle/FornecedoresBase";
import FornecedoresDashboard from "./pages/controle/FornecedoresDashboard";
import FornecedoresNovo from "./pages/controle/FornecedoresNovo";
import FornecedoresHomologacao from "./pages/controle/FornecedoresHomologacao";
import FornecedoresDocumentos from "./pages/controle/FornecedoresDocumentos";
import ContratosAtivos from "./pages/controle/ContratosAtivos";
import ContratosTabelaPF from "./pages/controle/ContratosTabelaPF";
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
            <Route path="/solicitante/nova-analise" element={<AppLayout><NovaAnalise /></AppLayout>} />
            <Route path="/solicitante/projeto/:id" element={<AppLayout><SolicitanteProjectDetail /></AppLayout>} />
            <Route path="/fornecedor/projetos" element={<AppLayout><FornecedorProjects /></AppLayout>} />
            <Route path="/fornecedor/dashboard" element={<AppLayout><FornecedorDashboard /></AppLayout>} />
            <Route path="/fornecedor/projeto/:id" element={<AppLayout><FornecedorProjectDetail /></AppLayout>} />
            <Route path="/controle/dashboard" element={<AppLayout><ControleDashboard /></AppLayout>} />
            <Route path="/controle/solicitacoes/recebidas" element={<AppLayout><SolicitacoesRecebidas /></AppLayout>} />
            <Route path="/controle/solicitacoes/analise-apf" element={<AppLayout><SolicitacoesAnaliseAPF /></AppLayout>} />
            <Route path="/controle/solicitacoes/acompanhar" element={<AppLayout><AcompanharProjetos /></AppLayout>} />
            <Route path="/controle/apf/nova-contagem" element={<AppLayout><APFNovaContagem /></AppLayout>} />
            <Route path="/controle/apf/historico" element={<AppLayout><APFHistorico /></AppLayout>} />
            <Route path="/controle/fornecedores/dashboard" element={<AppLayout><FornecedoresDashboard /></AppLayout>} />
            <Route path="/controle/fornecedores/base" element={<AppLayout><FornecedoresBase /></AppLayout>} />
            <Route path="/controle/fornecedores/novo" element={<AppLayout><FornecedoresNovo /></AppLayout>} />
            <Route path="/controle/fornecedores/homologacao" element={<AppLayout><FornecedoresHomologacao /></AppLayout>} />
            <Route path="/controle/fornecedores/documentos" element={<AppLayout><FornecedoresDocumentos /></AppLayout>} />
            <Route path="/controle/scorecard" element={<AppLayout><ControleScorecard /></AppLayout>} />
            <Route path="/controle/contratos/ativos" element={<AppLayout><ContratosAtivos /></AppLayout>} />
            <Route path="/controle/contratos/tabela-pf" element={<AppLayout><ContratosTabelaPF /></AppLayout>} />
            <Route path="/controle/contratos" element={<AppLayout><ControleContratos /></AppLayout>} />
            <Route path="/controle/apf" element={<AppLayout><ControleAPF /></AppLayout>} />
            <Route path="/controle/configuracoes" element={<AppLayout><Configuracoes /></AppLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
