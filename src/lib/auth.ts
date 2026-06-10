export type Role = "solicitante" | "fornecedor" | "controle";

export interface Session {
  token: string;
  role: Role;
  name: string;
  team: string;
  userId: string;
  fornecedorId: string | null;
}

const KEY = "vmo.session";

export function getSession(): Session | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function setSession(s: Session): void {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function clearSession(): void {
  localStorage.removeItem(KEY);
}

export function getToken(): string | null {
  return getSession()?.token ?? null;
}
