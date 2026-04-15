import React, { createContext, useContext, useState, ReactNode } from "react";

type UserRole = "solicitante" | "fornecedor" | null;

interface AuthContextType {
  role: UserRole;
  userName: string;
  userTeam: string;
  login: (role: UserRole, name: string, team: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  role: null,
  userName: "",
  userTeam: "",
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<UserRole>(null);
  const [userName, setUserName] = useState("");
  const [userTeam, setUserTeam] = useState("");

  const login = (r: UserRole, name: string, team: string) => {
    setRole(r);
    setUserName(name);
    setUserTeam(team);
  };

  const logout = () => {
    setRole(null);
    setUserName("");
    setUserTeam("");
  };

  return (
    <AuthContext.Provider value={{ role, userName, userTeam, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
