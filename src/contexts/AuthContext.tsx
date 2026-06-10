import React, { createContext, useContext, useState, ReactNode } from "react";
import { clearSession, getSession, setSession, type Role, type Session } from "@/lib/auth";

type UserRole = Role | null;

interface AuthContextType {
  role: UserRole;
  userName: string;
  userTeam: string;
  userId: string;
  fornecedorId: string | null;
  isAuthenticated: boolean;
  /** Persiste a sessão completa (após login real). */
  setSessionData: (s: Session) => void;
  /** Compatibilidade com chamadas antigas (DevSelector). */
  login: (role: UserRole, name: string, team: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  role: null,
  userName: "",
  userTeam: "",
  userId: "",
  fornecedorId: null,
  isAuthenticated: false,
  setSessionData: () => {},
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSessionState] = useState<Session | null>(() => getSession());

  const setSessionData = (s: Session) => {
    setSession(s);
    setSessionState(s);
  };

  const login = (r: UserRole, name: string, team: string) => {
    // Atalho DEV (sem backend) — não persiste token.
    if (!r) return;
    setSessionState({ token: "", role: r, name, team, userId: "", fornecedorId: null });
  };

  const logout = () => {
    clearSession();
    setSessionState(null);
  };

  return (
    <AuthContext.Provider
      value={{
        role: session?.role ?? null,
        userName: session?.name ?? "",
        userTeam: session?.team ?? "",
        userId: session?.userId ?? "",
        fornecedorId: session?.fornecedorId ?? null,
        isAuthenticated: !!session,
        setSessionData,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
