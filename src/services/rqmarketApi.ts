/**
 * rqmarketApi.ts
 * Cliente HTTP para hablar con el backend RQ MARKET API.
 *
 * AUTENTICACIÓN AUTOMÁTICA:
 * Si hay un usuario logueado en Firebase, automáticamente se incluye su token JWT
 * en el header Authorization. Esto permite que el backend lo identifique
 * y valide su rol (comprador / proveedor / admin).
 *
 * Si no hay usuario logueado, no se manda token (endpoints públicos funcionan,
 * endpoints autenticados devuelven 401).
 */

import { auth } from "../firebase/firebaseConfig";

const API_BASE = import.meta.env.VITE_API_URL || 'https://rqmarket-api-production.up.railway.app';

// ── Tipos TypeScript ──────────────────────────────────────────────────

export interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  padre_id: string | null;
  icono?: string;
  activa: boolean;
  orden: number;
}

export type ProveedorTier = 'bronze' | 'silver' | 'gold';
export type EstadoVerificacion = 'pendiente' | 'aprobado' | 'rechazado';

export interface ProveedorPublico {
  id: string;
  nombre_comercial: string;
  rfc_publico: string;
  categorias: string[];
  ciudad: string;
  estado: string;
  tier: ProveedorTier;
  verificacion_rfc: boolean;
  verificacion_csf: boolean;
  año_fundacion?: number;
  descripcion_corta?: string;
  transacciones_completadas: number;
  calificacion_promedio: number;
}

/** Datos completos del proveedor (solo para admin, incluye campos sensibles) */
export interface ProveedorCompleto extends ProveedorPublico {
  rfc: string;
  razon_social?: string;
  telefono?: string;
  email?: string;
  whatsapp?: string;
  direccion_exacta?: string;
  contacto_comercial?: string;
  sitio_web?: string;
  estado_verificacion: EstadoVerificacion;
  alerta_sat?: string | null;
  motivo_rechazo?: string;
  creado_por?: string;
  aprobado_por?: string;
  rechazado_por?: string;
}

export interface FiltrosProveedores {
  categoria?: string;
  ciudad?: string;
  estado?: string;
  tier?: ProveedorTier;
  limit?: number;
}

export interface EstadisticasAdmin {
  total: number;
  pendiente: number;
  aprobado: number;
  rechazado: number;
  bronze: number;
  silver: number;
  gold: number;
}

export interface CrearProveedorInput {
  nombre_comercial: string;
  razon_social?: string;
  rfc: string;
  categorias: string[];
  ciudad: string;
  estado: string;
  telefono?: string;
  email?: string;
  whatsapp?: string;
  direccion_exacta?: string;
  sitio_web?: string;
  año_fundacion?: number;
  descripcion_corta?: string;
}

// ── Helper de fetch CON autenticación automática ─────────────────────

/**
 * fetchJSON envía el token JWT del usuario logueado automáticamente.
 * Si no hay usuario logueado, manda la request sin token (los endpoints
 * públicos seguirán funcionando, los autenticados devolverán 401).
 */
async function fetchJSON<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;

  // Construir headers, agregando Authorization si hay usuario logueado
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  };

  // Obtener token de Firebase si hay sesión activa
  if (auth.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    } catch (err) {
      console.warn('No se pudo obtener token de Firebase:', err);
    }
  }

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(error.error || `Error en ${path}`);
  }

  return res.json();
}

// ── API pública ──────────────────────────────────────────────────────

export async function listarCategorias(): Promise<Categoria[]> {
  const data = await fetchJSON<{ ok: boolean; categorias: Categoria[] }>('/api/categorias');
  return data.categorias;
}

export async function listarProveedores(filtros: FiltrosProveedores = {}): Promise<ProveedorPublico[]> {
  const params = new URLSearchParams();
  if (filtros.categoria) params.append('categoria', filtros.categoria);
  if (filtros.ciudad) params.append('ciudad', filtros.ciudad);
  if (filtros.estado) params.append('estado', filtros.estado);
  if (filtros.tier) params.append('tier', filtros.tier);
  if (filtros.limit) params.append('limit', String(filtros.limit));

  const qs = params.toString();
  const path = qs ? `/api/proveedores?${qs}` : '/api/proveedores';

  const data = await fetchJSON<{ ok: boolean; proveedores: ProveedorPublico[] }>(path);
  return data.proveedores;
}

export async function obtenerProveedor(id: string): Promise<ProveedorPublico> {
  const data = await fetchJSON<{ ok: boolean; proveedor: ProveedorPublico }>(`/api/proveedores/${id}`);
  return data.proveedor;
}

/**
 * Validar RFC contra lista 69-B del SAT.
 */
export async function validarRFC(rfc: string): Promise<{
  ok: boolean;
  rfc: string;
  estado: string;
  encontrado: boolean;
  detalle?: any;
}> {
  return fetchJSON('/api/validar-rfc', {
    method: 'POST',
    body: JSON.stringify({ rfc }),
  });
}

/**
 * Crear un proveedor (auto-registro). Requiere usuario logueado.
 */
export async function crearProveedor(datos: CrearProveedorInput): Promise<{
  ok: boolean;
  proveedor_id: string;
  alerta_sat?: string | null;
}> {
  return fetchJSON('/api/proveedores', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

// ── API ADMIN (requiere rol admin) ───────────────────────────────────

export async function obtenerEstadisticasAdmin(): Promise<EstadisticasAdmin> {
  const data = await fetchJSON<{ ok: boolean; estadisticas: EstadisticasAdmin }>(
    '/api/admin/estadisticas'
  );
  return data.estadisticas;
}

export async function listarProveedoresAdmin(
  estado?: EstadoVerificacion | 'todos'
): Promise<ProveedorCompleto[]> {
  const params = new URLSearchParams();
  if (estado && estado !== 'todos') params.append('estado', estado);

  const qs = params.toString();
  const path = qs ? `/api/admin/proveedores?${qs}` : '/api/admin/proveedores';

  const data = await fetchJSON<{ ok: boolean; proveedores: ProveedorCompleto[] }>(path);
  return data.proveedores;
}

export async function obtenerProveedorAdmin(id: string): Promise<ProveedorCompleto> {
  const data = await fetchJSON<{ ok: boolean; proveedor: ProveedorCompleto }>(
    `/api/admin/proveedores/${id}`
  );
  return data.proveedor;
}

export async function aprobarProveedor(id: string, tier: ProveedorTier = 'silver'): Promise<void> {
  await fetchJSON(`/api/proveedores/${id}/aprobar`, {
    method: 'POST',
    body: JSON.stringify({ tier }),
  });
}

export async function rechazarProveedor(id: string, motivo?: string): Promise<void> {
  await fetchJSON(`/api/admin/proveedores/${id}/rechazar`, {
    method: 'POST',
    body: JSON.stringify({ motivo: motivo || '' }),
  });
}
