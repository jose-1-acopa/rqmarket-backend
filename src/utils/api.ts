// src/utils/api.ts
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

type Opts = RequestInit & { json?: any };

export async function apiFetch<T = any>(path: string, opts: Opts = {}): Promise<T> {
  if (!BASE_URL) {
    throw new Error("VITE_BACKEND_URL no está definido. Revisa tu archivo .env en la raíz del frontend.");
  }

  const { json, headers, ...rest } = opts;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Error ${res.status} ${res.statusText}: ${text}`);
  }

  // Intenta parsear JSON; si no hay contenido, devuelve {}.
  try {
    return (await res.json()) as T;
  } catch {
    return {} as T;
  }
}
