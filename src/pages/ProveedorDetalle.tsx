/**
 * ProveedorDetalle.tsx
 * Detalle público de un proveedor del directorio (ruta /directorio/:id).
 *
 * ENTREGA 2 (B1): solo la VITRINA (datos públicos vía obtenerProveedor) + un
 * botón "Ver datos de contacto" que todavía es placeholder. El desbloqueo real
 * (3 ramas: suscriptor / logueado-sin-sub / anónimo) es la Entrega 3.
 *
 * Los datos de contacto NO se cargan aquí — viven detrás de
 * GET /api/proveedores/:id/contacto (auth + suscripción), que se cablea en B1-E3.
 */

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
  Calendar,
  FileCheck2,
  Lock,
  Loader2,
  AlertTriangle,
  Phone,
  Mail,
  MessageCircle,
  Globe,
  User,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../firebase/AuthContext";
import {
  obtenerProveedor,
  listarCategorias,
  obtenerContactoProveedor,
  type ProveedorPublico,
  type Categoria,
  type ContactoProveedor,
} from "../services/rqmarketApi";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Reveal } from "../components/ui/Reveal";

type VistaContacto = "inicial" | "cargando" | "contacto" | "upsell" | "login" | "error";

export default function ProveedorDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario, cargando: cargandoAuth } = useAuth();

  const [proveedor, setProveedor] = useState<ProveedorPublico | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Suscripción del usuario — SOLO para decidir qué rama mostrar (UX).
  // La barrera real es el endpoint server-side.
  const [suscripcionActiva, setSuscripcionActiva] = useState(false);

  // Estado de la card de contacto (las 3 ramas)
  const [vista, setVista] = useState<VistaContacto>("inicial");
  const [contacto, setContacto] = useState<ContactoProveedor | null>(null);
  const [errorContacto, setErrorContacto] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setCargando(true);
    setError(null);

    Promise.all([obtenerProveedor(id), listarCategorias()])
      .then(([prov, cats]) => {
        setProveedor(prov);
        setCategorias(cats);
        setCargando(false);
      })
      .catch((err) => {
        console.error("Error cargando proveedor:", err);
        setError(err.message || "No se pudo cargar el proveedor");
        setCargando(false);
      });
  }, [id]);

  const nombresCategorias = useMemo(() => {
    if (!proveedor) return [];
    return proveedor.categorias.map((slug) => {
      const cat = categorias.find((c) => c.slug === slug);
      return cat?.nombre || slug;
    });
  }, [proveedor, categorias]);

  // Suscripción en tiempo real (mismo patrón que MiSuscripcion/Dashboard).
  useEffect(() => {
    if (!usuario) {
      setSuscripcionActiva(false);
      return;
    }
    const unsub = onSnapshot(
      doc(db, "usuarios", usuario.uid),
      (snap) => {
        const data = snap.exists() ? (snap.data() as any) : null;
        setSuscripcionActiva(data?.suscripcion?.activa === true);
      },
      (err) => {
        console.error("Error leyendo suscripción:", err);
        setSuscripcionActiva(false);
      }
    );
    return () => unsub();
  }, [usuario]);

  // ─── Botón "Ver datos de contacto": las 3 ramas ──────────────────
  const handleVerContacto = async () => {
    if (cargandoAuth || !id) return;

    // RAMA 3 — anónimo
    if (!usuario) {
      setVista("login");
      return;
    }
    // RAMA 2 — logueado sin suscripción (snapshot → no llamamos al endpoint)
    if (!suscripcionActiva) {
      setVista("upsell");
      return;
    }
    // RAMA 1 — suscriptor (el endpoint es la barrera real)
    setVista("cargando");
    setErrorContacto(null);
    const r = await obtenerContactoProveedor(id);
    if (r.ok) {
      setContacto(r.contacto);
      setVista("contacto");
    } else if (r.code === "SUSCRIPCION_REQUERIDA") {
      // El servidor discrepa del snapshot (la verdad es el servidor) → upsell.
      setVista("upsell");
    } else if (r.code === "NO_ENCONTRADO") {
      setErrorContacto("Este proveedor ya no está disponible.");
      setVista("error");
    } else {
      setErrorContacto("No se pudo cargar el contacto. Intenta de nuevo.");
      setVista("error");
    }
  };

  // ─── Loading / error / not found ─────────────────────────────────

  if (cargando) {
    return (
      <div className="bg-ink-50 min-h-screen flex items-center justify-center text-ink-500 py-16">
        <Loader2 size={18} className="animate-spin mr-2" />
        Cargando proveedor…
      </div>
    );
  }

  if (error || !proveedor) {
    return (
      <div className="bg-ink-50 min-h-screen py-16 px-4">
        <div className="max-w-2xl mx-auto bg-white border border-ink-200 rounded p-8 text-center shadow-card">
          <AlertTriangle size={28} className="text-danger mx-auto" />
          <h2 className="mt-4 text-xl font-semibold text-ink-900">No se pudo cargar el proveedor</h2>
          <p className="mt-2 text-ink-600">
            {error || "Este proveedor no existe o aún no está aprobado en el directorio."}
          </p>
          <Button
            variant="secondary"
            className="mt-6"
            onClick={() => navigate("/directorio")}
            leftIcon={<ArrowLeft size={16} />}
          >
            Volver al directorio
          </Button>
        </div>
      </div>
    );
  }

  // ─── Vitrina ──────────────────────────────────────────────────────

  return (
    <div className="bg-ink-50 min-h-screen">
      {/* Header institucional */}
      <header className="bg-white border-b border-ink-200">
        <Reveal as="div" className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <Link
            to="/directorio"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-brand-700 transition-colors mb-4"
          >
            <ArrowLeft size={14} />
            Volver al directorio
          </Link>

          <div className="flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 rounded-lg bg-ink-100 border border-ink-200 flex items-center justify-center font-mono text-lg font-semibold text-ink-700">
              {proveedor.nombre_comercial.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-700">
                Proveedor verificado
              </p>
              <h1 className="mt-1.5 text-2xl sm:text-3xl font-semibold text-ink-900 tracking-tight leading-tight">
                {proveedor.nombre_comercial}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-mono text-ink-500 tabular-nums">{proveedor.rfc_publico}</span>
                {proveedor.verificacion_rfc && (
                  <Badge variant="success" size="sm" icon={<ShieldCheck size={11} />}>
                    RFC validado
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* ───── Columna izquierda: vitrina ───── */}
          <main className="space-y-6">
            {proveedor.descripcion_corta && (
              <section className="bg-white border border-ink-200 rounded p-6 shadow-card">
                <p className="font-mono text-[11px] uppercase tracking-wider text-ink-500">
                  Descripción
                </p>
                <p className="mt-2 text-base text-ink-800 leading-relaxed whitespace-pre-wrap">
                  {proveedor.descripcion_corta}
                </p>
              </section>
            )}

            <section className="bg-white border border-ink-200 rounded p-6 shadow-card">
              <p className="font-mono text-[11px] uppercase tracking-wider text-ink-500 mb-4">
                Detalle
              </p>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <DetailItem icon={<MapPin size={16} />} label="Ubicación">
                  {proveedor.ciudad}
                  <span className="text-ink-400">, </span>
                  <span className="text-ink-500">{proveedor.estado}</span>
                </DetailItem>
                <DetailItem icon={<ShieldCheck size={16} />} label="Validación SAT">
                  {proveedor.verificacion_rfc
                    ? "RFC validado contra las listas del SAT"
                    : "Con observación menor (ver registro)"}
                </DetailItem>
                {proveedor.año_fundacion && (
                  <DetailItem icon={<Calendar size={16} />} label="Desde">
                    <span className="tabular-nums">{proveedor.año_fundacion}</span>
                  </DetailItem>
                )}
                <DetailItem icon={<FileCheck2 size={16} />} label="Transacciones">
                  <span className="tabular-nums">{proveedor.transacciones_completadas}</span>
                </DetailItem>
              </dl>

              {nombresCategorias.length > 0 && (
                <div className="mt-5 pt-5 border-t border-ink-200">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-ink-500 mb-2">
                    Categorías
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {nombresCategorias.map((nombre) => (
                      <span
                        key={nombre}
                        className="inline-flex items-center bg-ink-50 text-ink-700 text-xs px-2 py-0.5 rounded border border-ink-200"
                      >
                        {nombre}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </main>

          {/* ───── Columna derecha: contacto (placeholder, Entrega 3) ───── */}
          <aside className="space-y-4">
            <div className="bg-white border border-ink-200 rounded p-5 shadow-card">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-brand-50 text-brand-700 border border-brand-100">
                <Lock size={18} strokeWidth={1.5} />
              </div>
              <h2 className="mt-3 text-base font-semibold text-ink-900">Datos de contacto</h2>

              {/* RAMA según estado del usuario (decisión UX; barrera real = endpoint) */}
              {(vista === "inicial" || vista === "cargando") && (
                <>
                  <p className="mt-1 text-sm text-ink-600 leading-relaxed">
                    Teléfono, email, WhatsApp y sitio web de este proveedor.
                  </p>
                  <Button
                    fullWidth
                    className="mt-4"
                    leftIcon={vista === "cargando" ? undefined : <Lock size={16} />}
                    loading={vista === "cargando"}
                    disabled={cargandoAuth}
                    onClick={handleVerContacto}
                  >
                    {vista === "cargando" ? "Cargando…" : "Ver datos de contacto"}
                  </Button>
                </>
              )}

              {vista === "contacto" && contacto && (
                <ul className="mt-4 space-y-3">
                  <ContactoFila icon={<Phone size={16} />} label="Teléfono">
                    {contacto.telefono ? (
                      <a href={`tel:${contacto.telefono}`} className="text-brand-700 hover:underline font-medium">
                        {contacto.telefono}
                      </a>
                    ) : null}
                  </ContactoFila>
                  <ContactoFila icon={<Mail size={16} />} label="Email">
                    {contacto.email ? (
                      <a href={`mailto:${contacto.email}`} className="text-brand-700 hover:underline font-medium break-all">
                        {contacto.email}
                      </a>
                    ) : null}
                  </ContactoFila>
                  <ContactoFila icon={<MessageCircle size={16} />} label="WhatsApp">
                    {contacto.whatsapp ? (
                      <a
                        href={`https://wa.me/${contacto.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-700 hover:underline font-medium"
                      >
                        {contacto.whatsapp}
                      </a>
                    ) : null}
                  </ContactoFila>
                  <ContactoFila icon={<Globe size={16} />} label="Sitio web">
                    {contacto.sitio_web ? (
                      <a
                        href={contacto.sitio_web}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-700 hover:underline font-medium break-all"
                      >
                        {contacto.sitio_web}
                      </a>
                    ) : null}
                  </ContactoFila>
                  <ContactoFila icon={<User size={16} />} label="Responsable">
                    {contacto.responsable ? (
                      <span className="text-ink-800">{contacto.responsable}</span>
                    ) : null}
                  </ContactoFila>
                </ul>
              )}

              {vista === "upsell" && (
                <div className="mt-3">
                  <div className="flex items-start gap-2 text-sm text-ink-700">
                    <Sparkles size={16} className="text-brand-700 shrink-0 mt-0.5" />
                    <span>Suscríbete para ver los datos de contacto de cualquier proveedor del directorio.</span>
                  </div>
                  <Link
                    to="/precios"
                    className="mt-4 inline-flex items-center justify-center gap-2 w-full h-11 px-5 rounded bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-medium text-sm transition-colors focus:outline-none focus-visible:shadow-focus"
                  >
                    Ver planes
                    <ArrowRight size={16} />
                  </Link>
                </div>
              )}

              {vista === "login" && (
                <div className="mt-3">
                  <p className="text-sm text-ink-700">
                    Inicia sesión y suscríbete para ver el contacto de este proveedor.
                  </p>
                  <Link
                    to="/login"
                    state={{ desde: `/directorio/${id}` }}
                    className="mt-4 inline-flex items-center justify-center gap-2 w-full h-11 px-5 rounded bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-medium text-sm transition-colors focus:outline-none focus-visible:shadow-focus"
                  >
                    Iniciar sesión
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    to="/precios"
                    className="mt-2 inline-flex items-center justify-center w-full text-sm font-medium text-brand-700 hover:text-brand-800"
                  >
                    Ver planes
                  </Link>
                </div>
              )}

              {vista === "error" && (
                <div className="mt-3">
                  <div className="flex items-start gap-2 text-sm text-danger">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <span>{errorContacto || "No se pudo cargar el contacto."}</span>
                  </div>
                  <Button
                    fullWidth
                    variant="secondary"
                    className="mt-4"
                    onClick={handleVerContacto}
                  >
                    Reintentar
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-white border border-ink-200 rounded p-5 shadow-card">
              <div className="font-mono text-[11px] uppercase tracking-wider text-ink-500">
                Sobre los proveedores
              </div>
              <ul className="mt-3 space-y-2 text-sm text-ink-700">
                <li className="flex items-start gap-2">
                  <ShieldCheck size={14} className="text-success shrink-0 mt-1" />
                  <span>RFC validado contra las 6 listas oficiales del SAT.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck size={14} className="text-success shrink-0 mt-1" />
                  <span>Revisado por un administrador antes de publicarse.</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// ─── Subcomponente ───────────────────────────────────────────────────

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

function ContactoFila({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="text-ink-400 shrink-0 mt-0.5">{icon}</span>
      <div className="min-w-0">
        <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">{label}</div>
        <div className="mt-0.5 text-sm">
          {children || <span className="text-ink-400">No disponible</span>}
        </div>
      </div>
    </li>
  );
}
