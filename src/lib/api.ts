import { clearSession, getToken } from "./auth";

const BASE = "/api";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function handle<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    clearSession();
    if (!location.pathname.endsWith("/")) {
      // evita loop caso já esteja no login
    }
  }
  if (!res.ok) {
    let detail = `Erro ${res.status}`;
    try {
      const body = await res.json();
      if (Array.isArray(body?.detail)) {
        detail = body.detail
          .map((e: Record<string, unknown>) => String(e.msg ?? e))
          .join("; ");
      } else if (typeof body?.detail === "string") {
        detail = body.detail;
      }
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, detail);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  async get<T>(path: string): Promise<T> {
    const res = await fetch(`${BASE}${path}`, { headers: { ...authHeaders() } });
    return handle<T>(res);
  },

  async post<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return handle<T>(res);
  },

  async patch<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return handle<T>(res);
  },

  /** Envio multipart (uploads). Não definir Content-Type — o browser cuida do boundary. */
  async upload<T>(path: string, form: FormData, method: "POST" | "PATCH" = "POST"): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: { ...authHeaders() },
      body: form,
    });
    return handle<T>(res);
  },
};
