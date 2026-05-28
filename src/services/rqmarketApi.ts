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
 * públicos seguirán funcionando; los autenticados devolverán 401; los
 * "auth opcional" del backend tratarán al cliente como anónimo).
 *
 * Importante: esperamos `auth.authStateReady()` antes de leer
 * `auth.currentUser` para evitar la race condition en la primera carga
 * de la página, cuando Firebase aún no ha restaurado la sesión persistente.
 * Sin esto, las requests disparadas en el primer useEffect salen sin token
 * incluso para usuarios ya logueados — síntoma observable como `es_dueno=false`
 * en endpoints con auth opcional.
 */
async function fetchJSON<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;

  // Construir headers, agregando Authorization si hay usuario logueado
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  };

  // Esperar a que Firebase termine la restauración inicial de la sesión.
  // Resuelve instantáneo después de la primera vez.
  try {
    await auth.authStateReady();
  } catch (err) {
    console.warn('auth.authStateReady() falló:', err);
  }

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

// ── RFQ (Solicitudes de Cotización) ──────────────────────────────────

/**
 * Timestamp serializado de Firestore que llega vía HTTP.
 * Puede venir como ISO string, objeto {_seconds,_nanoseconds} o {seconds,nanoseconds}.
 */
export type FirestoreTimestamp =
  | string
  | { _seconds: number; _nanoseconds: number }
  | { seconds: number; nanoseconds: number };

export type EstadoRFQ = 'abierta' | 'cerrada';

/** Lo que devuelve la API pública: SIN publicada_por ni presupuesto. */
export interface RFQPublica {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  ciudad: string;
  estado: string;
  cantidad: number;
  unidad: string;
  fecha_necesidad?: FirestoreTimestamp | null;
  publicada_en?: FirestoreTimestamp | null;
  estado_rfq: EstadoRFQ;
  cotizaciones_count: number;
}

/** Vista que recibe el dueño (mis RFQs o GET /rfqs/:id si es_dueno). */
export interface RFQConDueno extends RFQPublica {
  publicada_por?: string;
  presupuesto_aproximado?: number;
}

export interface CrearRFQInput {
  titulo: string;
  descripcion: string;
  categoria: string;
  ciudad: string;
  estado: string;
  cantidad: number;
  unidad: string;
  fecha_necesidad?: string; // ISO date "YYYY-MM-DD"
  presupuesto_aproximado?: number;
}

export interface FiltrosRFQ {
  categoria?: string;
  estado?: string;
  limit?: number;
}

export interface CrearCotizacionInput {
  monto: number;
  tiempo_entrega_dias?: number;
  notas?: string;
}

export interface CotizacionProveedor {
  id: string;
  nombre_comercial: string;
  ciudad: string;
  estado: string;
  tier: ProveedorTier;
  rfc_publico: string;
}

export interface Cotizacion {
  id: string;
  rfq_id: string;
  monto: number;
  tiempo_entrega_dias: number | null;
  notas: string;
  creado_en?: FirestoreTimestamp | null;
  proveedor: CotizacionProveedor | null;
}

/** POST /api/rfqs (auth) */
export async function crearRFQ(datos: CrearRFQInput): Promise<{
  ok: boolean;
  mensaje: string;
  rfq_id: string;
}> {
  return fetchJSON('/api/rfqs', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

/** GET /api/rfqs (público) */
export async function listarRFQs(filtros: FiltrosRFQ = {}): Promise<RFQPublica[]> {
  const params = new URLSearchParams();
  if (filtros.categoria) params.append('categoria', filtros.categoria);
  if (filtros.estado) params.append('estado', filtros.estado);
  if (filtros.limit) params.append('limit', String(filtros.limit));

  const qs = params.toString();
  const path = qs ? `/api/rfqs?${qs}` : '/api/rfqs';

  const data = await fetchJSON<{ ok: boolean; rfqs: RFQPublica[] }>(path);
  return data.rfqs;
}

/** GET /api/rfqs/mias (auth) */
export async function listarMisRFQs(): Promise<RFQConDueno[]> {
  const data = await fetchJSON<{ ok: boolean; rfqs: RFQConDueno[] }>('/api/rfqs/mias');
  return data.rfqs;
}

/** GET /api/rfqs/:id (público; devuelve flag es_dueno si está autenticado) */
export async function obtenerRFQ(id: string): Promise<{
  rfq: RFQPublica | RFQConDueno;
  es_dueno: boolean;
}> {
  const data = await fetchJSON<{
    ok: boolean;
    rfq: RFQPublica | RFQConDueno;
    es_dueno: boolean;
  }>(`/api/rfqs/${id}`);
  return { rfq: data.rfq, es_dueno: data.es_dueno };
}

/** POST /api/rfqs/:id/cerrar (auth, solo dueño) */
export async function cerrarRFQ(id: string): Promise<void> {
  await fetchJSON(`/api/rfqs/${id}/cerrar`, { method: 'POST' });
}

/** POST /api/rfqs/:id/cotizar (auth + proveedor aprobado de la categoría) */
export async function crearCotizacion(
  rfqId: string,
  datos: CrearCotizacionInput
): Promise<{ ok: boolean; cotizacion_id: string }> {
  return fetchJSON(`/api/rfqs/${rfqId}/cotizar`, {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

/** GET /api/rfqs/:id/cotizaciones (auth, solo dueño RFQ) */
export async function listarCotizacionesDeRFQ(rfqId: string): Promise<Cotizacion[]> {
  const data = await fetchJSON<{ ok: boolean; cotizaciones: Cotizacion[] }>(
    `/api/rfqs/${rfqId}/cotizaciones`
  );
  return data.cotizaciones;
}

/**
 * GET /api/proveedores/mi-perfil (auth)
 * Devuelve el proveedor del usuario logueado o `null` si aún no ha registrado uno.
 */
export async function obtenerMiPerfilProveedor(): Promise<ProveedorCompleto | null> {
  const data = await fetchJSON<{ ok: boolean; proveedor: ProveedorCompleto | null }>(
    '/api/proveedores/mi-perfil'
  );
  return data.proveedor;
}

// ── Helpers de fechas Firestore (para UI) ────────────────────────────

export function tsToDate(ts?: FirestoreTimestamp | null): Date | null {
  if (!ts) return null;
  try {
    if (typeof ts === 'string') {
      const d = new Date(ts);
      return isNaN(d.getTime()) ? null : d;
    }
    if ('_seconds' in ts) return new Date(ts._seconds * 1000);
    if ('seconds' in ts) return new Date(ts.seconds * 1000);
    return null;
  } catch {
    return null;
  }
}

export function formatearFechaEs(ts?: FirestoreTimestamp | null, opts?: Intl.DateTimeFormatOptions): string {
  const d = tsToDate(ts);
  if (!d) return '—';
  return d.toLocaleDateString('es-MX', opts || { year: 'numeric', month: 'short', day: 'numeric' });
}

// ── Stripe Checkout (suscripciones) ──────────────────────────────────

export interface CrearCheckoutInput {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CrearCheckoutResponse {
  ok: boolean;
  url: string;
  sessionId: string;
}

/**
 * POST /api/stripe/checkout (auth requerida).
 * Devuelve la URL hospedada de Stripe Checkout. El frontend redirige con
 * `window.location.href = res.url`.
 */
export async function iniciarCheckout(
  datos: CrearCheckoutInput
): Promise<CrearCheckoutResponse> {
  return fetchJSON<CrearCheckoutResponse>('/api/stripe/checkout', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

export interface CrearPortalInput {
  returnUrl: string;
}

export interface CrearPortalResponse {
  ok: boolean;
  url: string;
}

/**
 * POST /api/stripe/customer-portal (auth requerida).
 * Abre el Customer Portal hospedado por Stripe para gestionar la suscripción
 * (cambiar tarjeta, cambiar plan, cancelar, ver facturas). El frontend redirige
 * con `window.location.href = res.url`.
 *
 * Si el usuario no tiene `stripe_customer_id` el backend devuelve 404.
 */
export async function abrirCustomerPortal(
  datos: CrearPortalInput
): Promise<CrearPortalResponse> {
  return fetchJSON<CrearPortalResponse>('/api/stripe/customer-portal', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

// ─────────────────────────────────────────────────────────────────────

export function tiempoRelativo(ts?: FirestoreTimestamp | null): string {
  const d = tsToDate(ts);
  if (!d) return '';
  const diffMs = Date.now() - d.getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'hace unos segundos';
  if (min < 60) return `hace ${min} min`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  const dias = Math.floor(hrs / 24);
  if (dias < 30) return `hace ${dias} d`;
  const meses = Math.floor(dias / 30);
  return `hace ${meses} mes${meses > 1 ? 'es' : ''}`;
}

// ── Programa "Primeras 100 Empresas" (Sprint 1.B) ────────────────────

export type TipoCupo = 'iniciales' | 'aliadas';

export interface EstadoCupos {
  ok: boolean;
  iniciales_actual: number;
  iniciales_disponibles: number;
  iniciales_max: number;
  aliadas_actual: number;
  aliadas_disponibles: number;
  aliadas_max: number;
  tipo_proximo: TipoCupo | null;
}

export interface ReservaCupo {
  ok: boolean;
  tipo: TipoCupo;
  cupo_numero: number;
  expira_en: string; // ISO datetime
  reutilizada: boolean;
}

export type PersonaTipo = 'M' | 'F' | 'INVALIDO' | 'ERROR';

export interface ValidacionRfcEmpresa {
  valido: boolean;
  con_advertencia: boolean;
  listas: string[];
  persona_tipo: PersonaTipo;
  razon?: string;
  advertencias?: string[];
}

export interface RegistrarEmpresaInput {
  rfc: string;
  razon_social: string;
  email: string;
  telefono: string;
  responsable: string;
  descripcion: string;
  categorias: string[];
  estado: string;
  ciudad: string;
  sitio_web?: string;
  acepta_terminos: true;
  acepta_emails: true;
}

export interface RegistrarEmpresaResponse {
  ok: boolean;
  siguiente_paso?: 'checkout';
  con_advertencia?: boolean;
  listas?: string[];
}

export interface CheckoutTempranaResponse {
  ok: boolean;
  url: string;
  sessionId: string;
  tipo_cupo: TipoCupo;
  cupon: string;
}

/** GET /api/empresas/cupos (público) */
export async function obtenerCupos(): Promise<EstadoCupos> {
  return fetchJSON<EstadoCupos>('/api/empresas/cupos');
}

/**
 * POST /api/empresas/validar-rfc (público).
 * El backend devuelve 400 cuando el RFC tiene formato inválido. Lo
 * capturamos y devolvemos el shape esperado en lugar de lanzar — la UI
 * de live-validation lo trata como estado "bloqueado" o "error".
 */
export async function validarRfcEmpresa(rfc: string): Promise<ValidacionRfcEmpresa> {
  try {
    return await fetchJSON<ValidacionRfcEmpresa>('/api/empresas/validar-rfc', {
      method: 'POST',
      body: JSON.stringify({ rfc }),
    });
  } catch (err: any) {
    // El mensaje viene de res.json().error en fetchJSON
    return {
      valido: false,
      con_advertencia: false,
      listas: [],
      persona_tipo: 'ERROR',
      razon: err?.message || 'No se pudo validar',
    };
  }
}

/** POST /api/empresas/reservar-cupo (auth) */
export async function reservarCupo(): Promise<ReservaCupo> {
  return fetchJSON<ReservaCupo>('/api/empresas/reservar-cupo', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

/** POST /api/empresas/registrar (auth) */
export async function registrarEmpresa(
  datos: RegistrarEmpresaInput
): Promise<RegistrarEmpresaResponse> {
  return fetchJSON<RegistrarEmpresaResponse>('/api/empresas/registrar', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

/** POST /api/empresas/checkout-temprana (auth) */
export async function checkoutTemprana(urls: {
  successUrl: string;
  cancelUrl: string;
}): Promise<CheckoutTempranaResponse> {
  return fetchJSON<CheckoutTempranaResponse>('/api/empresas/checkout-temprana', {
    method: 'POST',
    body: JSON.stringify(urls),
  });
}
