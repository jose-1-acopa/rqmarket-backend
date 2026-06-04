/**
 * MisRFQs.tsx
 * Listado privado de las RFQs publicadas por el usuario autenticado.
 *
 * - Si no hay usuario logueado: redirige a /login
 * - Muestra cards con título, fecha, estado_rfq (abierta/cerrada), # cotizaciones
 * - Banner de éxito si llega desde PublicarRFQ con location.state.exitoNuevaRFQ
 * - Click en una card → /rfqs/:id (donde el dueño ve botón cerrar + cotizaciones via M4)
 * - Empty state con CTA "Publicar mi primera RFQ"
 */

import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Lock,
  MessageSquare,
  Package,
  Plus,
  Sparkles,
  X,
  XCircle,
  MapPin,
} from "lucide-react";
import { useAuth } from "../firebase/AuthContext";
import {
  listarMisRFQs,
  listarCategorias,
  tiempoRelativo,
  formatearFechaEs,
  type Categoria,
  type RFQConDueno,
} from "../services/rqmarketApi";
import { Button } from "../components/ui/Button";
import { Reveal } from "../components/ui/Reveal";

type ExitoNuevaRFQ = {
  rfq_id: string;
  titulo: string;
  mensaje?: string;
};

export default function MisRFQs() {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, cargando: cargandoAuth } = useAuth();

  const [rfqs, setRfqs] = useState<RFQConDueno[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Banner de éxito desde PublicarRFQ (location.state)
  const exitoInicial = (location.state as { exitoNuevaRFQ?: ExitoNuevaRFQ } | null)?.exitoNuevaRFQ;
  const [banner, setBanner] = useState<ExitoNuevaRFQ | null>(exitoInicial || null);

  // Limpiar el state de location una vez procesado, para evitar que el banner
  // reaparezca si el usuario refresca la página.
  useEffect(() => {
    if (exitoInicial) {
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redirigir si no hay sesión
  useEffect(() => {
    if (!cargandoAuth && !usuario) {
      navigate("/login", { state: { desde: "/mis-rfqs" } });
    }
  }, [usuario, cargandoAuth, navigate]);

  // Cargar mis RFQs + categorías
  useEffect(() => {
    if (cargandoAuth || !usuario) return;
    setCargando(true);
    setError(null);

    Promise.all([listarMisRFQs(), listarCategorias()])
      .then(([misRfqs, cats]) => {
        setRfqs(misRfqs);
        setCategorias(cats);
        setCargando(false);
      })
      .catch((err) => {
        console.error("Error cargando mis RFQs:", err);
        setError(err.message || "No se pudieron cargar tus RFQs");
        setCargando(false);
      });
  }, [usuario, cargandoAuth]);

  const categoriasMap = useMemo(() => {
    const map = new Map<string, Categoria>();
    for (const c of categorias) map.set(c.slug, c);
    return map;
  }, [categorias]);

  const stats = useMemo(() => {
    let abiertas = 0;
    let cerradas = 0;
    let totalCotizaciones = 0;
    for (const r of rfqs) {
      if (r.estado_rfq === "abierta") abiertas++;
      else cerradas++;
      totalCotizaciones += r.cotizaciones_count || 0;
    }
    return { abiertas, cerradas, totalCotizaciones };
  }, [rfqs]);

  // ── Loading / no auth ──
  if (cargandoAuth) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-ink-500">
        <Loader2 size={18} className="animate-spin mr-2" />
        Verificando sesión…
      </div>
    );
  }
  if (!usuario) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-ink-500">
        <Lock size={18} className="mr-2" />
        Redirigiendo a inicio de sesión…
      </div>
    );
  }

  return (
    <div className="bg-ink-50 min-h-screen">
      {/* Header institucional */}
      <header className="bg-white border-b border-ink-200">
        <Reveal as="div" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-700">
              Mis solicitudes
            </p>
            <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-ink-900 tracking-tight">
              Tus RFQs publicadas
            </h1>
            <p className="mt-1 text-sm text-ink-600">
              Aquí revisas cotizaciones recibidas y cierras solicitudes cuando ya tienes proveedor.
            </p>
          </div>

          <Link
            to="/publicar-rfq"
            className="inline-flex items-center gap-2 h-10 px-4 rounded bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-sm font-medium transition-colors focus:outline-none focus-visible:shadow-focus"
          >
            <Plus size={16} />
            Publicar nueva RFQ
          </Link>
        </Reveal>

        {/* Stats compactas */}
        {!cargando && rfqs.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-5 flex flex-wrap items-center gap-4 text-xs font-mono uppercase tracking-wider text-ink-500">
            <span className="tabular-nums">
              <strong className="text-ink-900">{rfqs.length}</strong> totales
            </span>
            <span className="text-ink-300">·</span>
            <span className="tabular-nums text-success">
              <strong>{stats.abiertas}</strong> abiertas
            </span>
            <span className="text-ink-300">·</span>
            <span className="tabular-nums text-ink-600">
              <strong>{stats.cerradas}</strong> cerradas
            </span>
            <span className="text-ink-300">·</span>
            <span className="tabular-nums">
              <strong className="text-brand-700">{stats.totalCotizaciones}</strong> cotizaciones recibidas
            </span>
          </div>
        )}
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Banner de éxito tras publicar */}
        {banner && (
          <div className="bg-success-bg border border-success-border rounded p-4 flex items-start gap-3">
            <Sparkles size={20} className="text-success shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-ink-900">
                ¡RFQ publicada y notificada!
              </div>
              <p className="mt-1 text-sm text-ink-700">
                {banner.mensaje || "Tu solicitud está abierta. Los proveedores verificados de la categoría recibieron una notificación por email."}
              </p>
              <div className="mt-3">
                <Link
                  to={`/rfqs/${banner.rfq_id}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800"
                >
                  Ver "{banner.titulo}"
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
            <button
              onClick={() => setBanner(null)}
              className="shrink-0 text-ink-500 hover:text-ink-900 transition-colors p-1 -m-1 rounded focus:outline-none focus-visible:shadow-focus"
              aria-label="Cerrar mensaje"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Loading */}
        {cargando && (
          <div className="bg-white border border-ink-200 rounded p-12 flex items-center justify-center text-ink-500">
            <Loader2 size={18} className="animate-spin mr-2" />
            Cargando tus RFQs…
          </div>
        )}

        {/* Error */}
        {error && !cargando && (
          <div className="bg-danger-bg border border-danger-border text-danger px-4 py-3 rounded flex items-start gap-2.5">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">No se pudieron cargar tus RFQs</div>
              <div className="text-sm mt-0.5">{error}</div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!cargando && !error && rfqs.length === 0 && (
          <div className="bg-white border border-dashed border-ink-300 rounded p-12 text-center shadow-card">
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-ink-100 text-ink-500">
              <FileText size={26} strokeWidth={1.5} />
            </span>
            <h3 className="mt-4 text-lg font-semibold text-ink-900">
              Aún no publicas solicitudes
            </h3>
            <p className="mt-2 text-sm text-ink-600 max-w-md mx-auto">
              Publica tu primera RFQ para que los proveedores verificados de tu categoría te coticen.
              Tu nombre y contacto se mantienen privados.
            </p>
            <div className="mt-6">
              <Button
                onClick={() => navigate("/publicar-rfq")}
                leftIcon={<Plus size={16} />}
              >
                Publicar mi primera RFQ
              </Button>
            </div>
          </div>
        )}

        {/* Listado */}
        {!cargando && !error && rfqs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up">
            {rfqs.map((rfq) => (
              <MiRFQCard
                key={rfq.id}
                rfq={rfq}
                categoriaNombre={categoriasMap.get(rfq.categoria)?.nombre || rfq.categoria}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Subcomponentes ──────────────────────────────────────────────────

function MiRFQCard({
  rfq,
  categoriaNombre,
}: {
  rfq: RFQConDueno;
  categoriaNombre: string;
}) {
  const cerrada = rfq.estado_rfq === "cerrada";
  const tieneCotizaciones = rfq.cotizaciones_count > 0;

  return (
    <Link
      to={`/rfqs/${rfq.id}`}
      className={`group bg-white border rounded p-5 flex flex-col h-full shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition duration-200 focus:outline-none focus-visible:shadow-focus ${
        cerrada
          ? "border-ink-200 hover:border-ink-400 opacity-90"
          : tieneCotizaciones
          ? "border-brand-100 hover:border-brand-500"
          : "border-ink-200 hover:border-brand-500"
      }`}
    >
      <header className="flex items-start gap-3">
        <div
          className={`shrink-0 inline-flex items-center justify-center w-10 h-10 rounded border transition-colors ${
            cerrada
              ? "bg-ink-50 text-ink-400 border-ink-200"
              : "bg-ink-100 text-ink-500 group-hover:bg-brand-50 group-hover:text-brand-700 border-ink-200"
          }`}
        >
          <FileText size={18} strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold text-base leading-tight line-clamp-2 transition-colors ${
              cerrada ? "text-ink-600" : "text-ink-900 group-hover:text-brand-700"
            }`}
          >
            {rfq.titulo}
          </h3>
          <div className="mt-1.5 flex items-center gap-2 text-xs">
            <span className="inline-flex items-center bg-ink-50 text-ink-700 px-2 py-0.5 rounded border border-ink-200">
              {categoriaNombre}
            </span>
            <EstadoBadge cerrada={cerrada} />
          </div>
        </div>
      </header>

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
        <DetailRow icon={<Clock size={12} />} label="Publicada">
          {formatearFechaEs(rfq.publicada_en, { day: "numeric", month: "short", year: "numeric" })}
          <span className="text-ink-400"> · </span>
          <span className="text-ink-500">{tiempoRelativo(rfq.publicada_en)}</span>
        </DetailRow>
        <DetailRow icon={<MessageSquare size={12} />} label="Cotizaciones">
          <span
            className={`font-mono tabular-nums font-semibold ${
              tieneCotizaciones ? "text-brand-700" : "text-ink-500"
            }`}
          >
            {rfq.cotizaciones_count}
          </span>
        </DetailRow>
      </dl>

      <footer className="mt-auto pt-3 border-t border-ink-200 flex items-center justify-between">
        <div className="text-xs text-ink-500">
          {tieneCotizaciones && !cerrada ? (
            <span className="text-brand-700 font-medium">
              Tienes {rfq.cotizaciones_count} respuesta{rfq.cotizaciones_count === 1 ? "" : "s"}
            </span>
          ) : cerrada ? (
            <span>RFQ cerrada</span>
          ) : (
            <span>Esperando cotizaciones</span>
          )}
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 group-hover:text-brand-800">
          Ver detalle
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </footer>
    </Link>
  );
}

function EstadoBadge({ cerrada }: { cerrada: boolean }) {
  if (cerrada) {
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm bg-ink-100 text-ink-600 border border-ink-200">
        <XCircle size={11} />
        Cerrada
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm bg-success-bg text-success border border-success-border">
      <CheckCircle2 size={11} />
      Abierta
    </span>
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
