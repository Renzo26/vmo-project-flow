import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { Role } from "@/lib/auth";

interface RequireAuthProps {
  children: ReactNode;
  /** Se informado, restringe o acesso aos perfis listados. */
  roles?: Role[];
}

/** Protege rotas: redireciona ao login se não autenticado e bloqueia perfis sem permissão. */
const RequireAuth = ({ children, roles }: RequireAuthProps) => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  if (roles && role && !roles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export default RequireAuth;
