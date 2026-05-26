/**
 * RFQs.tsx
 * Listado público de solicitudes de cotización (RFQ) abiertas.
 *
 * - Visible sin autenticación.
 * - Filtros: categoría, estado (entidad federativa).
 * - NO muestra el nombre del comprador (publicada_por nunca llega del backend).
 * - Si el usuario está logueado Y es proveedor aprobado de la categoría,
 *   se muestra el badge "Coincide contigo" en las cards aplicables.
 */

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  X,
  Loader2,
  AlertTriangle,
  SearchX,
  MapPin,
  Package,
  Calendar,
  Sparkles,
  FileText,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import {
  listarCategorias,
  listarRFQs,
  obtenerMiPerfilProveedor,
  tiempoRelativo,
  formatearFechaEs,
  type Categoria,
  type RFQPublica,
  type FiltrosRFQ,
  type ProveedorCompleto,
} from "../services/rqmarketApi";
import { Select } from "../components/ui/Input";
import { useAuth } from "../firebase/AuthContext";

const ESTADOS_MEXICO = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche",
  "Chiapas", "Chihuahua", "Ciudad de México", "Coahuila", "Colima",
  "Durango", "Estado de México", "Guanajuato", "Guerrero", "Hidalgo",
  "Jalisco", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca",
  "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa",
  "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán",
  "Zacatecas",
];

export default function RFQs() {
  const { usuario, cargando: cargandoAuth } = useAuth();

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [rfqs, setRfqs] = useState<RFQPublica[]>([]);
  const [miProveedor, setMiProveedor] = useState<ProveedorCompleto | null>(null);

  const [filtroCategoria, setFiltroCategoria] = useState<string>("");
  const [filtroEstado, setFiltroEstado] = useState<string>("");
  const [busquedaTitulo, setBusquedaTitulo] = useState<string>("");

  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listarCategorias()
      .then(setCategorias)
      .catch((err) => console.error("Error cargando categorías:", err));
  }, []);

  // Si está logueado, intentamos cargar su perfil de proveedor para mostrar
  // el badge "Coincide contigo" en las RFQs cuya categoría matchea.
  useEffect(() => {
    if (cargandoAuth || !usuario) {
      setMiProveedor(null);
      return;
    }
    obtenerMiPerfilProveedor()
      .then(setMiProveedor)
      .catch((err) => {
        console.warn("No se pudo obtener perfil de proveedor:", err);
        setMiProveedor(null);
      });
  }, [usuario, cargandoAuth]);

  useEffect(() => {
    setCargando(true);
    setError(null);

    const filtros: FiltrosRFQ = {};
    if (filtroCategoria) filtros.categoria = filtroCategoria;
    if (filtroEstado) filtros.estado = filtroEstado;

    listarRFQs(filtros)
      .then((data) => {
        setRfqs(data);
        setCargando(false);
      })
      .catch((err) => {
        console.error("Error cargando RFQs:", err);
        setError(err.message || "No se pudieron cargar las RFQs");
        setCargando(false);
      });
  }, [filtroCategoria, filtroEstado]);

  const rfqsFiltradas = useMemo(() => {
    if (!busquedaTitulo.trim()) return rfqs;
    const q = busquedaTitulo.toLowerCase().trim();
    return rfqs.filter(
      (r) =>
        r.titulo.toLowerCase().includes(q) ||
        r.descripcion.toLowerCase().includes(q)
    );
  }, [rfqs, busquedaTitulo]);

  const categoriasMap = useMemo(() => {
    const map = new Map<string, Categoria>();
    for (const c of categorias) map.set(c.slug, c);
    return map;
  }, [categorias]);

  const limpiarFiltros = () => {
    setFiltroCategoria("");
    setFiltroEstado("");
    setBusquedaTitulo("");
  };

  const hayFiltrosActivos = Boolean(filtroCategoria || filtroEstado || busquedaTitulo);

  const esProveedorAprobado =
    !!miProveedor && miProveedor.estado_verificacion === "aprobado";

  const matcheaCategoria = (categoriaSlug: string): boolean => {
    if (!esProveedorAprobado || !miProveedor) return false;
    return (miProveedor.categorias || []).includes(categoriaSlug);
  };

  return (
    <div className="bg-ink-50 min-h-screen">
      {/* Header institucional */}
      <header className="bg-white border-b border-ink-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-700">
            Solicitudes públicas
          </p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-ink-900 tracking-tight">
            Solicitudes de cotización abiertas
          </h1>
          <p className="mt-2 text-ink-600 max-w-3xl">
            Empresas verificadas publican aquí sus necesidades de compra industrial. Las RFQ son
            anónimas — solo proveedores con plan activo ven los datos del comprador.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-mono uppercase tracking-wider text-ink-500">
            <span className="tabular-nums">
              <strong className="text-ink-900">{rfqs.length}</strong> abiertas
            </span>
            {hayFiltrosActivos && (
              <>
                <span className="text-ink-300">·</span>
                <span className="text-brand-700 tabular-nums">
                  {rfqsFiltradas.length} en vista
                </span>
              </>
            )}
            {esProveedorAprobado && (
              <>
                <span className="text-ink-300">·</span>
                <span className="text-success normal-case font-sans">
                  Eres proveedor verificado · te marcamos las que coinciden con tu categoría
                </span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Filtros sticky */}
      <div className="sticky top-14 z-30 bg-white border-b border-ink-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_240px_220px_auto] gap-3 items-end">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">
                Buscar
              </label>
              <div className="flex items-center bg-white border border-ink-300 hover:border-ink-400 focus-within:border-brand-500 focus-within:shadow-focus rounded transition-colors">
                <span className="pl-3 text-ink-500"><Search size={16} /></span>
                <input
                  type="search"
                  value={busquedaTitulo}
                  onChange={(e) => setBusquedaTitulo(e.target.value)}
                  placeholder="Por título o descripción"
                  className="flex-1 px-3 py-2 text-base bg-transparent focus:outline-none placeholder:text-ink-400"
                />
              </div>
            </div>
            <Select
              label="Categoría"
              name="categoria"
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              placeholder="Todas las categorías"
              options={categorias.map((cat) => ({
                value: cat.slug,
                label: cat.icono ? `${cat.icono} ${cat.nombre}` : cat.nombre,
              }))}
            />
            <Select
              label="Estado"
              name="estado"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              placeholder="Todos los estados"
              options={ESTADOS_MEXICO.map((est) => ({ value: est, label: est }))}
            />
            <div className="flex">
              {hayFiltrosActivos ? (
                <button
                  onClick={limpiarFiltros}
                  className="inline-flex items-center gap-1.5 h-10 px-3 rounded text-sm text-ink-600 hover:text-ink-900 hover:bg-ink-50 transition-colors focus:outline-none focus-visible:shadow-focus"
                >
                  <X size={14} />
                  Limpiar
                </button>
              ) : (
                <span className="text-xs text-ink-400 self-end pb-2.5">
                  Sin filtros activos
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Listado */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {cargando && (
          <div className="bg-white border border-ink-200 rounded p-12 flex items-center justify-center text-ink-500">
            <Loader2 size={18} className="animate-spin mr-2" />
            Cargando solicitudes…
          </div>
        )}

        {error && (
          <div className="bg-danger-bg border border-danger-border text-danger px-4 py-3 rounded flex items-start gap-2.5">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">No se pudieron cargar las RFQs</div>
              <div className="text-sm mt-0.5">{error}</div>
            </div>
          </div>
        )}

        {!cargando && !error && rfqsFiltradas.length === 0 && (
          <div className="bg-white border border-dashed border-ink-300 rounded p-12 text-center">
            <SearchX size={32} strokeWidth={1.25} className="mx-auto text-ink-400" />
            <h3 className="mt-4 text-lg font-semibold text-ink-900">
              No hay solicitudes que coincidan
            </h3>
            <p className="mt-2 text-sm text-ink-600 max-w-md mx-auto">
              {hayFiltrosActivos
                ? "Prueba ajustando los filtros o limpiando la búsqueda."
                : "Aún no hay solicitudes de cotización abiertas. Vuelve más tarde."}
            </p>
            {hayFiltrosActivos && (
              <button
                onClick={limpiarFiltros}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800"
              >
                <X size={14} />
                Limpiar filtros
              </button>
            )}
          </div>
        )}

        {!cargando && !error && rfqsFiltradas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rfqsFiltradas.map((rfq) => (
              <RFQCard
                key={rfq.id}
                rfq={rfq}
                categoriaNombre={categoriasMap.get(rfq.categoria)?.nombre || rfq.categoria}
                coincide={matcheaCategoria(rfq.categoria)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ─── Subcomponentes ──────────────────────────────────────────────────

function RFQCard({
  rfq,
  categoriaNombre,
  coincide,
}: {
  rfq: RFQPublica;
  categoriaNombre: string;
  coincide: boolean;
}) {
  return (
    <Link
      to={`/rfqs/${rfq.id}`}
      className={`group bg-white border rounded p-5 flex flex-col h-full transition-colors focus:outline-none focus-visible:shadow-focus ${
        coincide
          ? "border-success-border hover:border-success"
          : "border-ink-200 hover:border-brand-500"
      }`}
    >
      {/* Badge "Coincide contigo" */}
      {coincide && (
        <div className="mb-3">
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm bg-success-bg text-success border border-success-border">
            <Sparkles size={11} />
            Coincide con tu categoría
          </span>
        </div>
      )}

      <header className="flex items-start gap-3">
        <div className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded bg-ink-100 text-ink-500 group-hover:bg-brand-50 group-hover:text-brand-700 transition-colors border border-ink-200">
          <FileText size={18} strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base text-ink-900 leading-tight line-clamp-2 group-hover:text-brand-700 transition-colors">
            {rfq.titulo}
          </h3>
          <div className="mt-1.5 flex items-center gap-2 text-xs">
            <span className="inline-flex items-center bg-ink-50 text-ink-700 px-2 py-0.5 rounded border border-ink-200">
              {categoriaNombre}
            </span>
            <span className="font-mono text-ink-500 tabular-nums">
              {tiempoRelativo(rfq.publicada_en)}
            </span>
          </div>
        </div>
      </header>

      {rfq.descripcion && (
        <p className="mt-3 text-sm text-ink-600 line-clamp-2 leading-snug">
          {rfq.descripcion}
        </p>
      )}

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        <DetailRow icon={<MapPin size={12} />} label="Ubicación">
          {rfq.ciudad}
          <span className="text-ink-400">, </span>
          <span className="text-ink-500">{rfq.estado}</span>
        </DetailRow>
        <DetailRow icon={<Package size={12} />} label="Cantidad">
          <span className="font-mono tabular-nums">
            {rfq.cantidad.toLocaleString("es-MX")}
          </span>{" "}
          {rfq.unidad}
        </DetailRow>
        {rfq.fecha_necesidad && (
          <DetailRow icon={<Calendar size={12} />} label="Para">
            {formatearFechaEs(rfq.fecha_necesidad)}
          </DetailRow>
        )}
        <DetailRow icon={<MessageSquare size={12} />} label="Cotizaciones">
          <span className="font-mono tabular-nums">{rfq.cotizaciones_count}</span>
        </DetailRow>
      </dl>

      <footer className="mt-auto pt-3 border-t border-ink-200 flex items-center justify-end">
        <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 group-hover:text-brand-800">
          Ver y cotizar
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </footer>
    </Link>
  );
}

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1 text-ink-500">
        <span>{icon}</span>
        <span className="font-mono text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <div className="mt-0.5 text-ink-800 text-sm truncate">{children}</div>
    </div>
  );
}
