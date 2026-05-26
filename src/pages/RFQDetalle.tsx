/**
 * RFQDetalle.tsx
 * Detalle público de una solicitud de cotización (RFQ).
 *
 * - Cualquier visitante (sin login) ve los detalles públicos.
 * - SOLO proveedores aprobados de la categoría ven el formulario "Cotizar".
 * - Visitantes sin login ven un mensaje invitándolos a iniciar sesión.
 * - Compradores con plan que NO son proveedores ven un mensaje informativo.
 * - El dueño de la RFQ ve un panel propietario con botón "Cerrar RFQ"
 *   y un acceso para revisar las cotizaciones recibidas.
 */

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Lock,
  MapPin,
  MessageSquare,
  Package,
  Sparkles,
  XCircle,
  ShieldCheck,
} from "lucide-react";
import {
  obtenerRFQ,
  obtenerMiPerfilProveedor,
  listarCategorias,
  crearCotizacion,
  cerrarRFQ,
  formatearFechaEs,
  tiempoRelativo,
  type RFQPublica,
  type RFQConDueno,
  type ProveedorCompleto,
  type Categoria,
} from "../services/rqmarketApi";
import { Input, Textarea } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { useAuth } from "../firebase/AuthContext";

export default function RFQDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario, cargando: cargandoAuth } = useAuth();

  const [rfq, setRfq] = useState<RFQPublica | RFQConDueno | null>(null);
  const [esDueno, setEsDueno] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [miProveedor, setMiProveedor] = useState<ProveedorCompleto | null>(null);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cerrando, setCerrando] = useState(false);

  // 1. Cargar la RFQ + las categorías
  useEffect(() => {
    if (!id) return;
    setCargando(true);
    setError(null);

    Promise.all([obtenerRFQ(id), listarCategorias()])
      .then(([resRfq, cats]) => {
        setRfq(resRfq.rfq);
        setEsDueno(resRfq.es_dueno);
        setCategorias(cats);
        setCargando(false);
      })
      .catch((err) => {
        console.error("Error cargando RFQ:", err);
        setError(err.message || "No se pudo cargar la solicitud");
        setCargando(false);
      });
  }, [id]);

  // 2. Si está logueado, intentamos cargar su proveedor (para mostrar form cotización)
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

  const categoriaNombre = useMemo(() => {
    if (!rfq) return "";
    const cat = categorias.find((c) => c.slug === rfq.categoria);
    return cat?.nombre || rfq.categoria;
  }, [rfq, categorias]);

  const esProveedorAprobado =
    !!miProveedor && miProveedor.estado_verificacion === "aprobado";

  const matcheaCategoria =
    !!rfq && !!miProveedor && (miProveedor.categorias || []).includes(rfq.categoria);

  const handleCerrar = async () => {
    if (!id || !rfq) return;
    const confirma = window.confirm(
      "¿Cerrar esta RFQ? Dejará de ser visible públicamente y no se aceptarán nuevas cotizaciones."
    );
    if (!confirma) return;
    setCerrando(true);
    try {
      await cerrarRFQ(id);
      setRfq({ ...rfq, estado_rfq: "cerrada" } as any);
    } catch (err: any) {
      alert(`No se pudo cerrar la RFQ: ${err.message || err}`);
    } finally {
      setCerrando(false);
    }
  };

  // ─── Loading / error / not found ─────────────────────────────────

  if (cargando) {
    return (
      <div className="bg-ink-50 min-h-screen flex items-center justify-center text-ink-500 py-16">
        <Loader2 size={18} className="animate-spin mr-2" />
        Cargando solicitud…
      </div>
    );
  }

  if (error || !rfq) {
    return (
      <div className="bg-ink-50 min-h-screen py-16 px-4">
        <div className="max-w-2xl mx-auto bg-white border border-ink-200 rounded p-8 text-center">
          <AlertTriangle size={28} className="text-danger mx-auto" />
          <h2 className="mt-4 text-xl font-semibold text-ink-900">No se pudo cargar la solicitud</h2>
          <p className="mt-2 text-ink-600">{error || "RFQ no encontrada o ya no está disponible."}</p>
          <Button
            variant="secondary"
            className="mt-6"
            onClick={() => navigate("/rfqs")}
            leftIcon={<ArrowLeft size={16} />}
          >
            Volver al listado
          </Button>
        </div>
      </div>
    );
  }

  const cerrada = rfq.estado_rfq === "cerrada";
  const presupuesto = (rfq as RFQConDueno).presupuesto_aproximado;

  return (
    <div className="bg-ink-50 min-h-screen">
      {/* Header institucional */}
      <header className="bg-white border-b border-ink-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <Link
            to="/rfqs"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-brand-700 transition-colors mb-4"
          >
            <ArrowLeft size={14} />
            Volver al listado
          </Link>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-700">
                Solicitud de cotización
              </p>
              <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-ink-900 tracking-tight leading-tight">
                {rfq.titulo}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center bg-ink-50 text-ink-700 px-2 py-1 rounded border border-ink-200">
                  {categoriaNombre}
                </span>
                <EstadoBadge cerrada={cerrada} />
                <span className="font-mono text-ink-500 tabular-nums">
                  {tiempoRelativo(rfq.publicada_en)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* ───── Columna izquierda: detalles ───── */}
          <main className="space-y-6">
            <section className="bg-white border border-ink-200 rounded p-6">
              <p className="font-mono text-[11px] uppercase tracking-wider text-ink-500">
                Descripción
              </p>
              <p className="mt-2 text-base text-ink-800 leading-relaxed whitespace-pre-wrap">
                {rfq.descripcion}
              </p>
            </section>

            <section className="bg-white border border-ink-200 rounded p-6">
              <p className="font-mono text-[11px] uppercase tracking-wider text-ink-500 mb-4">
                Detalle
              </p>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <DetailItem icon={<MapPin size={16} />} label="Ubicación">
                  {rfq.ciudad}
                  <span className="text-ink-400">, </span>
                  <span className="text-ink-500">{rfq.estado}</span>
                </DetailItem>
                <DetailItem icon={<Package size={16} />} label="Cantidad">
                  <span className="font-mono tabular-nums">
                    {rfq.cantidad.toLocaleString("es-MX")}
                  </span>{" "}
                  {rfq.unidad}
                </DetailItem>
                {rfq.fecha_necesidad && (
                  <DetailItem icon={<Calendar size={16} />} label="Fecha de necesidad">
                    {formatearFechaEs(rfq.fecha_necesidad, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </DetailItem>
                )}
                <DetailItem icon={<Clock size={16} />} label="Publicada">
                  {formatearFechaEs(rfq.publicada_en, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </DetailItem>
                <DetailItem icon={<MessageSquare size={16} />} label="Cotizaciones recibidas">
                  <span className="font-mono tabular-nums">{rfq.cotizaciones_count}</span>
                </DetailItem>
                {esDueno && presupuesto !== undefined && presupuesto !== null && (
                  <DetailItem icon={<ShieldCheck size={16} />} label="Presupuesto (solo tú lo ves)">
                    <span className="font-mono tabular-nums">
                      ${presupuesto.toLocaleString("es-MX")}
                    </span>{" "}
                    MXN
                  </DetailItem>
                )}
              </dl>
            </section>

            {/* Panel de acción según rol */}
            <PanelAccion
              cerrada={cerrada}
              esDueno={esDueno}
              autenticado={!!usuario}
              cargandoAuth={cargandoAuth}
              esProveedorAprobado={esProveedorAprobado}
              matcheaCategoria={!!matcheaCategoria}
              miProveedor={miProveedor}
              rfqId={rfq.id}
              categoriaNombre={categoriaNombre}
            />
          </main>

          {/* ───── Columna derecha: contexto ───── */}
          <aside className="space-y-4">
            {esDueno && (
              <div className="bg-white border border-ink-200 rounded p-5">
                <div className="font-mono text-[11px] uppercase tracking-wider text-brand-700">
                  Tu solicitud
                </div>
                <div className="mt-2 text-sm text-ink-700">
                  Eres el autor de esta RFQ. Puedes revisar las cotizaciones recibidas y cerrar la
                  solicitud cuando quieras.
                </div>
                <Link
                  to="/mis-rfqs"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800"
                >
                  Ver todas mis RFQs
                  <ArrowRight size={14} />
                </Link>
                {!cerrada && (
                  <Button
                    variant="secondary"
                    fullWidth
                    className="mt-4"
                    loading={cerrando}
                    onClick={handleCerrar}
                  >
                    Cerrar esta RFQ
                  </Button>
                )}
              </div>
            )}

            <div className="bg-white border border-ink-200 rounded p-5">
              <div className="font-mono text-[11px] uppercase tracking-wider text-ink-500">
                Sobre las RFQ de RQ MARKET
              </div>
              <ul className="mt-3 space-y-2 text-sm text-ink-700">
                <li className="flex items-start gap-2">
                  <ShieldCheck size={14} className="text-success shrink-0 mt-1" />
                  <span>Solo proveedores con verificación SAT pueden cotizar.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck size={14} className="text-success shrink-0 mt-1" />
                  <span>El comprador no es público — su nombre y datos no se exponen.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck size={14} className="text-success shrink-0 mt-1" />
                  <span>RQ MARKET no cobra comisión por contacto ni transacción.</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// ─── Subcomponentes ──────────────────────────────────────────────────

function EstadoBadge({ cerrada }: { cerrada: boolean }) {
  if (cerrada) {
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm bg-ink-100 text-ink-600 border border-ink-200">
        <XCircle size={11} />
        Cerrada
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm bg-success-bg text-success border border-success-border">
      <CheckCircle2 size={11} />
      Abierta
    </span>
  );
}

function DetailItem({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-ink-500">
        <span>{icon}</span>
        <span className="font-mono text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <div className="mt-1 text-base text-ink-800">{children}</div>
    </div>
  );
}

function PanelAccion({
  cerrada,
  esDueno,
  autenticado,
  cargandoAuth,
  esProveedorAprobado,
  matcheaCategoria,
  miProveedor,
  rfqId,
  categoriaNombre,
}: {
  cerrada: boolean;
  esDueno: boolean;
  autenticado: boolean;
  cargandoAuth: boolean;
  esProveedorAprobado: boolean;
  matcheaCategoria: boolean;
  miProveedor: ProveedorCompleto | null;
  rfqId: string;
  categoriaNombre: string;
}) {
  if (cerrada) {
    return (
      <PanelMensaje
        tono="neutral"
        icon={<XCircle size={20} />}
        titulo="Esta RFQ ya está cerrada"
        descripcion="El comprador la marcó como cerrada y no se aceptan nuevas cotizaciones."
      />
    );
  }

  if (esDueno) {
    return (
      <PanelMensaje
        tono="info"
        icon={<FileText size={20} />}
        titulo="Eres el autor"
        descripcion="Las cotizaciones que reciban se mostrarán en tu panel. Solo tú las ves."
        cta={{
          label: "Ver mis RFQs",
          to: "/mis-rfqs",
        }}
      />
    );
  }

  if (cargandoAuth) {
    return (
      <div className="bg-white border border-ink-200 rounded p-6 flex items-center justify-center text-ink-500">
        <Loader2 size={16} className="animate-spin mr-2" />
        Verificando sesión…
      </div>
    );
  }

  if (!autenticado) {
    return (
      <PanelMensaje
        tono="info"
        icon={<Lock size={20} />}
        titulo="Inicia sesión para cotizar"
        descripcion="Para responder a esta solicitud necesitas una cuenta de proveedor verificada en RQ MARKET."
        cta={{ label: "Iniciar sesión", to: "/login" }}
      />
    );
  }

  if (!miProveedor) {
    return (
      <PanelMensaje
        tono="info"
        icon={<FileText size={20} />}
        titulo="Aún no tienes perfil de proveedor"
        descripcion="Solo proveedores con perfil registrado pueden enviar cotizaciones. Tu RFC se valida automáticamente contra el SAT."
        cta={{ label: "Registrar mi empresa", to: "/registro-proveedor" }}
      />
    );
  }

  if (!esProveedorAprobado) {
    return (
      <PanelMensaje
        tono="warning"
        icon={<Clock size={20} />}
        titulo="Tu registro de proveedor está pendiente de aprobación"
        descripcion="Cuando un administrador apruebe tu perfil podrás enviar cotizaciones."
      />
    );
  }

  if (!matcheaCategoria) {
    return (
      <PanelMensaje
        tono="warning"
        icon={<AlertTriangle size={20} />}
        titulo="Tu empresa no atiende esta categoría"
        descripcion={`Esta RFQ es de la categoría "${categoriaNombre}", que no aparece en tu perfil de proveedor.`}
      />
    );
  }

  return <FormCotizacion rfqId={rfqId} categoriaNombre={categoriaNombre} />;
}

function PanelMensaje({
  tono,
  icon,
  titulo,
  descripcion,
  cta,
}: {
  tono: "info" | "warning" | "danger" | "neutral";
  icon: React.ReactNode;
  titulo: string;
  descripcion: string;
  cta?: { label: string; to: string };
}) {
  const tonos = {
    info: "bg-white border-brand-100 text-brand-700",
    warning: "bg-warning-bg border-warning-border text-warning",
    danger: "bg-danger-bg border-danger-border text-danger",
    neutral: "bg-ink-50 border-ink-200 text-ink-700",
  };
  return (
    <div className={`border rounded p-6 ${tonos[tono]}`}>
      <div className="flex items-start gap-3">
        <span className="shrink-0 mt-0.5">{icon}</span>
        <div className="flex-1">
          <div className="font-semibold">{titulo}</div>
          <p className="mt-1 text-sm text-ink-700">{descripcion}</p>
          {cta && (
            <Link
              to={cta.to}
              className="mt-4 inline-flex items-center gap-1.5 h-9 px-4 rounded bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-sm font-medium transition-colors focus:outline-none focus-visible:shadow-focus"
            >
              {cta.label}
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function FormCotizacion({
  rfqId,
  categoriaNombre,
}: {
  rfqId: string;
  categoriaNombre: string;
}) {
  const [monto, setMonto] = useState("");
  const [tiempoEntrega, setTiempoEntrega] = useState("");
  const [notas, setNotas] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviada, setEnviada] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const montoNum = Number(monto);
    if (!isFinite(montoNum) || montoNum <= 0) {
      setError("El monto debe ser un número positivo.");
      return;
    }
    let tiempoNum: number | undefined;
    if (tiempoEntrega.trim()) {
      tiempoNum = parseInt(tiempoEntrega, 10);
      if (!Number.isInteger(tiempoNum) || tiempoNum < 1) {
        setError("Los días de entrega deben ser un entero ≥ 1.");
        return;
      }
    }

    setEnviando(true);
    try {
      await crearCotizacion(rfqId, {
        monto: montoNum,
        tiempo_entrega_dias: tiempoNum,
        notas: notas.trim(),
      });
      setEnviada(true);
    } catch (err: any) {
      setError(err.message || "No se pudo enviar la cotización");
    } finally {
      setEnviando(false);
    }
  };

  if (enviada) {
    return (
      <div className="bg-white border-2 border-success rounded p-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 size={22} className="text-success shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-ink-900">Cotización enviada</div>
            <p className="mt-1 text-sm text-ink-700">
              El comprador recibió tu cotización y podrá contactarte directamente si le interesa.
              No cobramos comisión por el contacto.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border-2 border-brand-600 rounded p-6 shadow-sm"
    >
      <div className="flex items-start gap-2">
        <Sparkles size={18} className="text-brand-700 mt-1" />
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-brand-700">
            Coincide con tu categoría
          </p>
          <h3 className="mt-1 text-lg font-semibold text-ink-900">
            Enviar cotización
          </h3>
          <p className="mt-1 text-sm text-ink-600">
            Tu empresa está aprobada en{" "}
            <strong className="text-ink-900">{categoriaNombre}</strong>. El comprador verá tu
            cotización y tus datos públicos.
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        <Input
          label="Monto total (MXN)"
          name="monto"
          type="number"
          step="0.01"
          min={0}
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          required
          prefix="$"
          placeholder="Ej: 14500"
        />
        <Input
          label="Días de entrega"
          name="tiempoEntrega"
          type="number"
          min={1}
          value={tiempoEntrega}
          onChange={(e) => setTiempoEntrega(e.target.value)}
          suffix="días"
          placeholder="Opcional"
        />
        <div className="sm:col-span-2">
          <Textarea
            label="Notas para el comprador"
            name="notas"
            rows={3}
            maxLength={1000}
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Disponibilidad, garantía, condiciones de entrega, etc."
            hint={`${notas.length} / 1000 caracteres`}
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-danger-bg border border-danger-border text-danger px-3 py-2.5 rounded flex items-start gap-2.5">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <div className="text-sm">{error}</div>
        </div>
      )}

      <div className="mt-5 flex justify-end">
        <Button
          type="submit"
          loading={enviando}
          rightIcon={!enviando ? <ArrowRight size={16} /> : undefined}
        >
          {enviando ? "Enviando…" : "Enviar cotización"}
        </Button>
      </div>
    </form>
  );
}
