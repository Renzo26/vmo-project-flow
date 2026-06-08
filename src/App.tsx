import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import FornecedorLoginPage from "./pages/FornecedorLoginPage";
import DevSelector from "./pages/DevSelector";
import SolicitanteProjects from "./pages/SolicitanteProjects";
import SolicitanteDashboard from "./pages/SolicitanteDashboard";
import Configuracoes from "./pages/Configuracoes";
import NovaAnalise from "./pages/NovaAnalise";
import FornecedorProjects from "./pages/FornecedorProjects";
import FornecedorDashboard from "./pages/FornecedorDashboard";
import SolicitanteProjectDetail from "./pages/SolicitanteProjectDetail";
import FornecedorProjectDetail from "./pages/FornecedorProjectDetail";
import FornecedorDocumentos from "./pages/FornecedorDocumentos";
import ControleScorecard from "./pages/controle/ControleScorecard";
import ControleContratos from "./pages/controle/ControleContratos";
import ControleAPF from "./pages/controle/ControleAPF";
import ControleDashboard from "./pages/controle/ControleDashboard";
import SolicitacoesRecebidas from "./pages/controle/SolicitacoesRecebidas";
import SolicitacoesRecebidasDetalhe from "./pages/controle/SolicitacoesRecebidasDetalhe";
import APFHistorico from "./pages/controle/APFHistorico";
import FornecedoresBase from "./pages/controle/FornecedoresBase";
import FornecedoresDashboard from "./pages/controle/FornecedoresDashboard";
import FornecedoresNovo from "./pages/controle/FornecedoresNovo";
import FornecedoresHomologacao from "./pages/controle/FornecedoresHomologacao";
import FornecedoresDocumentos from "./pages/controle/FornecedoresDocumentos";
import ContratosAtivos from "./pages/controle/ContratosAtivos";
import ContratosTabelaPF from "./pages/controle/ContratosTabelaPF";
import AppLayout from "./components/AppLayout";
import RequireAuth from "./components/RequireAuth";
import type { Role } from "@/lib/auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const Guard = ({ roles, children }: { roles: Role[]; children: React.ReactNode }) => (
  <RequireAuth roles={roles}>
    <AppLayout>{children}</AppLayout>
  </RequireAuth>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/fornecedor-login" element={<FornecedorLoginPage />} />
            <Route path="/dev" element={<DevSelector />} />
            <Route path="/solicitante/projetos" element={<Guard roles={["solicitante"]}><SolicitanteProjects /></Guard>} />
            <Route path="/solicitante/dashboard" element={<Guard roles={["solicitante"]}><SolicitanteDashboard /></Guard>} />
            <Route path="/solicitante/nova-analise" element={<Guard roles={["solicitante"]}><NovaAnalise /></Guard>} />
            <Route path="/solicitante/projeto/:id" element={<Guard roles={["solicitante"]}><SolicitanteProjectDetail /></Guard>} />
            <Route path="/fornecedor/projetos" element={<Guard roles={["fornecedor"]}><FornecedorProjects /></Guard>} />
            <Route path="/fornecedor/dashboard" element={<Guard roles={["fornecedor"]}><FornecedorDashboard /></Guard>} />
            <Route path="/fornecedor/projeto/:id" element={<Guard roles={["fornecedor"]}><FornecedorProjectDetail /></Guard>} />
            <Route path="/fornecedor/documentos" element={<Guard roles={["fornecedor"]}><FornecedorDocumentos /></Guard>} />
            <Route path="/controle/dashboard" element={<Guard roles={["controle"]}><ControleDashboard /></Guard>} />
            <Route path="/controle/solicitacoes/recebidas" element={<Guard roles={["controle"]}><SolicitacoesRecebidas /></Guard>} />
            <Route path="/controle/solicitacoes/recebidas/:id" element={<Guard roles={["controle"]}><SolicitacoesRecebidasDetalhe /></Guard>} />
            <Route path="/controle/apf/historico" element={<Guard roles={["controle"]}><APFHistorico /></Guard>} />
            <Route path="/controle/fornecedores/dashboard" element={<Guard roles={["controle"]}><FornecedoresDashboard /></Guard>} />
            <Route path="/controle/fornecedores/base" element={<Guard roles={["controle"]}><FornecedoresBase /></Guard>} />
            <Route path="/controle/fornecedores/novo" element={<Guard roles={["controle"]}><FornecedoresNovo /></Guard>} />
            <Route path="/controle/fornecedores/homologacao" element={<Guard roles={["controle"]}><FornecedoresHomologacao /></Guard>} />
            <Route path="/controle/fornecedores/documentos" element={<Guard roles={["controle"]}><FornecedoresDocumentos /></Guard>} />
            <Route path="/controle/scorecard" element={<Guard roles={["controle"]}><ControleScorecard /></Guard>} />
            <Route path="/controle/contratos/ativos" element={<Guard roles={["controle"]}><ContratosAtivos /></Guard>} />
            <Route path="/controle/contratos/tabela-pf" element={<Guard roles={["controle"]}><ContratosTabelaPF /></Guard>} />
            <Route path="/controle/contratos" element={<Guard roles={["controle"]}><ControleContratos /></Guard>} />
            <Route path="/controle/apf" element={<Guard roles={["controle"]}><ControleAPF /></Guard>} />
            <Route path="/controle/configuracoes" element={<Guard roles={["controle"]}><Configuracoes /></Guard>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
