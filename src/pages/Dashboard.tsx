// src/pages/Dashboard.tsx
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  PackageCheck,
  FileText,
  FileSearch,
  AlertCircle,
  ShieldCheck,
  Users,
  Upload,
  ArrowRight,
  Loader2,
  CheckCircle2,
  XCircle,
  Sparkles,
  X,
} from "lucide-react";
import { collection, addDoc, doc, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import { obtenerRQDelMes } from "../utils/limiteRQ";
import { generarPropuestaOCR } from "../utils/iaOCR";
import { onAuthStateChanged } from "firebase/auth";
import jsPDF from "jspdf";
import { Input, Select, Textarea } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { FormSection, FormFieldFull } from "../components/ui/FormSection";
import { Reveal } from "../components/ui/Reveal";

// Fuente de verdad: usuarios/{uid}.suscripcion (escrito por el webhook de Stripe).
// Las keys de `planesInfo` deben coincidir con los plan_tipo que escribe el webhook.
type SuscripcionData = {
  activa?: boolean;
  plan_tipo?: "pyme" | "empresa" | null;
  facturacion?: "mensual" | "anual" | null;
  estado?: string;
};

type Estado = { tipo: "info" | "loading" | "success" | "error"; texto: string } | null;

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [rqMesActual, setRqMesActual] = useState(0);
  const [uid, setUid] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [estado, setEstado] = useState<Estado>(null);

  // Suscripción real (escrita por webhook Stripe). Real-time vía onSnapshot.
  const [suscripcion, setSuscripcion] = useState<SuscripcionData | null>(null);

  // ¿El usuario se registró como empresa/proveedor (programa Primeras 100)?
  // Si tiene `empresa_temprana`, su proveedor queda pendiente de revisión.
  const [esEmpresaTemprana, setEsEmpresaTemprana] = useState(false);

  // Banner "¡Bienvenido!" / "Procesando…" tras pago Stripe
  const [bannerPagoVisible, setBannerPagoVisible] = useState(
    searchParams.get("pago") === "ok"
  );

  const [formData, setFormData] = useState({
    producto: "",
    cantidad: "",
    detalles: "",
    marca: "",
    modelo: "",
    unidad: "",
    ubicacion: "",
    proveedorPreferido: "",
    tiempoEntrega: "",
    presupuesto: "",
  });

  const planesInfo: Record<string, any> = {
    pyme: {
      nombre: "Plan PyME",
      tagline: "Para empresas en crecimiento",
      beneficios: [
        { icon: <PackageCheck size={18} />, titulo: "RFQ ilimitadas", desc: "Publica solicitudes sin límite mensual." },
        { icon: <FileSearch size={18} />, titulo: "Directorio completo", desc: "Acceso a todos los proveedores verificados." },
        { icon: <FileText size={18} />, titulo: "Contactos ilimitados", desc: "Conecta con cualquier proveedor del directorio." },
        { icon: <AlertCircle size={18} />, titulo: "Notificaciones email", desc: "Alertas de nuevas RFQs en tu categoría." },
        { icon: <ShieldCheck size={18} />, titulo: "Verificación SAT", desc: "Tu empresa validada contra 6 listas oficiales." },
      ],
      acciones: {
        subirRQ: true,
      },
    },
    empresa: {
      nombre: "Plan Empresa",
      tagline: "Operación a escala",
      beneficios: [
        { icon: <PackageCheck size={18} />, titulo: "RFQ ilimitadas", desc: "Publica solicitudes sin límite mensual." },
        { icon: <FileSearch size={18} />, titulo: "Directorio completo", desc: "Acceso total al directorio verificado." },
        { icon: <ShieldCheck size={18} />, titulo: "Verificación SAT", desc: "Tu empresa validada contra las 6 listas oficiales del SAT." },
        { icon: <Users size={18} />, titulo: "Panel multiusuario", desc: "Gestiona equipos de compras." },
        { icon: <AlertCircle size={18} />, titulo: "Soporte prioritario", desc: "Atención directa por WhatsApp." },
      ],
      acciones: {
        subirRQ: true,
      },
    },
  };

  // Fallback genérico si suscripcion.activa pero plan_tipo es null (edge case
  // si el webhook no pudo derivar el plan). Evita crash sin nombre.
  const planFallback = {
    nombre: "Plan activo",
    tagline: "Acceso completo",
    beneficios: [
      { icon: <CheckCircle2 size={18} />, titulo: "Suscripción activa", desc: "Tu plan está al día." },
    ],
    acciones: { subirRQ: true },
  };

  const tienePlan = !!suscripcion?.activa;
  const planTipo = suscripcion?.plan_tipo || null;
  const selected = tienePlan ? planesInfo[planTipo || ""] || planFallback : null;
  // Sin límite mensual de RQ en los nuevos planes (pyme/empresa).
  const limiteRQ = tienePlan ? Infinity : 0;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUid(user.uid);
    });
    return () => unsubscribe();
  }, []);

  // Suscripción real-time desde Firestore (mismo patrón que MiSuscripcion.tsx)
  useEffect(() => {
    if (!uid) return;
    const userRef = doc(db, "usuarios", uid);
    const unsubscribe = onSnapshot(
      userRef,
      (snap) => {
        if (!snap.exists()) {
          setSuscripcion(null);
          setEsEmpresaTemprana(false);
        } else {
          const data = snap.data() as {
            suscripcion?: SuscripcionData;
            empresa_temprana?: { status?: string };
          };
          setSuscripcion(data.suscripcion || null);
          setEsEmpresaTemprana(!!data.empresa_temprana);
        }
      },
      (err) => {
        console.error("Error en onSnapshot suscripción (dashboard):", err);
      }
    );
    return () => unsubscribe();
  }, [uid]);

  useEffect(() => {
    if (!uid || !tienePlan) return;
    obtenerRQDelMes(uid).then(setRqMesActual);
  }, [uid, tienePlan]);

  // Cerrar banner de pago + limpiar el query param para que F5 no lo re-muestre
  const cerrarBannerPago = () => {
    setBannerPagoVisible(false);
    navigate("/dashboard", { replace: true });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEstado({ tipo: "loading", texto: "Generando propuesta inteligente… por favor espera." });
    setEnviando(true);

    if (tienePlan && limiteRQ !== Infinity && rqMesActual >= limiteRQ) {
      setEstado({ tipo: "error", texto: "Has alcanzado el límite de requisiciones de tu plan este mes." });
      setEnviando(false);
      return;
    }

    try {
      const propuestaIA = await generarPropuestaOCR(formData.producto);

      if (!propuestaIA || propuestaIA.toLowerCase().includes("error")) {
        setEstado({ tipo: "error", texto: "Ocurrió un problema al generar la propuesta." });
        setEnviando(false);
        return;
      }

      const fechaActual = new Date();
      const mes = fechaActual.getMonth() + 1;
      const anio = fechaActual.getFullYear();

      await addDoc(collection(db, "requisiciones"), {
        ...formData,
        fecha: fechaActual.toISOString(),
        uid: uid || null,
        propuestaIA,
        modelo: "saas",
        servicio: null,
        plan: planTipo || "desconocido",
        mes,
        anio,
      });

      // Genera PDF profesional con logo, folio y fecha
      const doc = new jsPDF();
      const fechaHoy = new Date().toLocaleDateString("es-MX");
      const folio = `RQ-${Date.now()}`;

      const img = new Image();
      img.src = "/logo-rqmarket.png";
      doc.addImage(img, "PNG", 10, 10, 40, 15);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Propuesta Inteligente de RQ MARKET", 105, 30, { align: "center" });

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Folio: ${folio}`, 160, 15);
      doc.text(`Fecha: ${fechaHoy}`, 160, 20);

      doc.setFontSize(11);
      doc.text(propuestaIA, 10, 40, { maxWidth: 180 });

      doc.save(`Propuesta_${formData.producto}.pdf`);

      setEstado({ tipo: "success", texto: "Tu solicitud fue enviada y el PDF se descargó." });
      setFormData({
        producto: "",
        cantidad: "",
        detalles: "",
        marca: "",
        modelo: "",
        unidad: "",
        ubicacion: "",
        proveedorPreferido: "",
        tiempoEntrega: "",
        presupuesto: "",
      });
      setRqMesActual((prev) => prev + 1);
    } catch (error) {
      console.error("Error al enviar:", error);
      setEstado({ tipo: "error", texto: "Error al conectar con el servidor." });
    } finally {
      setEnviando(false);
    }
  };

  const rqRestantes = limiteRQ === Infinity ? Infinity : Math.max(0, limiteRQ - rqMesActual);
  const porcentajeUsado = limiteRQ === Infinity ? 0 : Math.min(100, Math.round((rqMesActual / limiteRQ) * 100));
  const limiteAlcanzado = limiteRQ !== Infinity && rqMesActual >= limiteRQ;

  // ── Sin plan: mensaje informativo ──
  if (!selected) {
    return (
      <div className="bg-ink-50 min-h-screen">
        {bannerPagoVisible && (
          <BannerPago
            activa={false}
            planTipo={planTipo}
            esEmpresaTemprana={esEmpresaTemprana}
            onClose={cerrarBannerPago}
          />
        )}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
          <Reveal as="div" className="bg-white border border-ink-200 rounded-lg shadow-card p-8 sm:p-10">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-brand-50 text-brand-700 border border-brand-100">
              <Sparkles size={22} strokeWidth={1.5} />
            </span>
            <p className="mt-5 font-mono text-xs uppercase tracking-[0.2em] text-brand-700">Dashboard</p>
            <h1 className="mt-2 text-2xl font-semibold text-ink-900 tracking-tight">
              Selecciona un plan para activar tu dashboard
            </h1>
            <p className="mt-3 text-ink-600 leading-relaxed">
              Aún no tienes un plan asignado. Una vez que actives un plan, podrás generar requisiciones y acceder a la base de proveedores.
            </p>
            <Button className="mt-6" onClick={() => navigate("/precios")} rightIcon={<ArrowRight size={16} />}>
              Ver planes disponibles
            </Button>
          </Reveal>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ink-50 min-h-screen">
      {bannerPagoVisible && (
        <BannerPago
          activa={true}
          planTipo={planTipo}
          esEmpresaTemprana={esEmpresaTemprana}
          onClose={cerrarBannerPago}
        />
      )}
      {/* Header institucional */}
      <header className="bg-white border-b border-ink-200">
        <Reveal as="div" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-start justify-between flex-wrap gap-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-700">
              {selected.tagline}
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-ink-900 tracking-tight">
              {selected.nombre}
            </h1>
          </div>
          <span className="inline-flex items-center font-mono text-[11px] uppercase tracking-wider px-2 py-1 rounded-sm bg-brand-50 text-brand-700 border border-brand-100">
            Plan activo
          </span>
        </Reveal>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Reveal as="div" className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
          {/* Sidebar plan */}
          <aside className="space-y-6">
            {/* Límite de RQ */}
            <div className="bg-white border border-ink-200 rounded p-5 shadow-card">
              <div className="font-mono text-[11px] uppercase tracking-wider text-ink-500">
                Requisiciones este mes
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-mono text-3xl font-semibold text-ink-900 tabular-nums leading-none">
                  {rqMesActual}
                </span>
                <span className="text-ink-400 font-mono text-sm">/</span>
                <span className="font-mono text-sm text-ink-500 tabular-nums">
                  {limiteRQ === Infinity ? "∞" : limiteRQ}
                </span>
              </div>
              {limiteRQ !== Infinity && (
                <div className="mt-4">
                  <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        porcentajeUsado >= 100
                          ? "bg-danger"
                          : porcentajeUsado >= 75
                          ? "bg-warning"
                          : "bg-success"
                      }`}
                      style={{ width: `${porcentajeUsado}%` }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-ink-500">
                    {limiteAlcanzado
                      ? "Límite alcanzado"
                      : `${rqRestantes} restantes este mes`}
                  </div>
                </div>
              )}
              {limiteRQ === Infinity && (
                <div className="mt-3 text-xs text-ink-500">Sin límite mensual.</div>
              )}
            </div>

            {/* Beneficios del plan */}
            <div className="bg-white border border-ink-200 rounded p-5 shadow-card">
              <div className="font-mono text-[11px] uppercase tracking-wider text-ink-500 mb-3">
                Tu plan incluye
              </div>
              <ul className="space-y-3">
                {selected.beneficios.map((b: any, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-brand-700 shrink-0 mt-0.5">{b.icon}</span>
                    <div>
                      <div className="text-sm font-medium text-ink-900">{b.titulo}</div>
                      <div className="text-xs text-ink-600 mt-0.5 leading-snug">{b.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Contenido principal */}
          <main className="space-y-6">
            {/* Acciones */}
            {!mostrarFormulario && (
              <div className="bg-white border border-ink-200 rounded p-6 shadow-card animate-fade-in-up">
                <h2 className="text-lg font-semibold text-ink-900">¿Qué deseas hacer?</h2>
                <p className="mt-1 text-sm text-ink-600">
                  Envía una nueva requisición y recibe una propuesta generada con IA en segundos.
                </p>
                <div className="mt-5">
                  {selected.acciones.subirRQ && (
                    <Button
                      onClick={() => setMostrarFormulario(true)}
                      leftIcon={<Upload size={16} />}
                      disabled={limiteAlcanzado}
                    >
                      Subir una nueva requisición
                    </Button>
                  )}
                </div>

                {limiteAlcanzado && (
                  <div className="mt-5 bg-danger-bg border border-danger-border rounded p-4 flex items-start gap-3">
                    <XCircle size={18} className="text-danger shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-danger">Límite mensual alcanzado</div>
                      <p className="mt-1 text-sm text-ink-700">
                        Has alcanzado el límite de <strong>{limiteRQ}</strong> requisiciones este mes según tu {selected.nombre}.
                        Para enviar más, cambia de plan o espera al próximo mes.
                      </p>
                      <Button
                        variant="secondary"
                        className="mt-3"
                        onClick={() => navigate("/contacto")}
                        rightIcon={<ArrowRight size={14} />}
                      >
                        Contactar para ampliar plan
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Formulario de requisición */}
            {mostrarFormulario && !limiteAlcanzado && (
              <form onSubmit={handleSubmit} className="bg-white border border-ink-200 rounded p-6 sm:p-8 space-y-8 shadow-card animate-fade-in-up">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-700">
                      Nueva requisición
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-ink-900 tracking-tight">
                      Formulario de RQ
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMostrarFormulario(false)}
                    className="text-sm text-ink-500 hover:text-ink-700 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>

                <FormSection title="Producto" description="Qué necesitas cotizar y en qué cantidad.">
                  <Input
                    label="Producto"
                    name="producto"
                    required
                    value={formData.producto}
                    onChange={handleChange}
                    placeholder="Ej: Válvula de bola 2'' acero inox"
                  />
                  <Input
                    label="Cantidad"
                    name="cantidad"
                    type="number"
                    required
                    value={formData.cantidad}
                    onChange={handleChange}
                    placeholder="Ej: 50"
                  />
                  <Select
                    label="Unidad"
                    name="unidad"
                    required
                    value={formData.unidad}
                    onChange={handleChange}
                    placeholder="Selecciona una unidad"
                    options={[
                      { value: "pieza", label: "Pieza" },
                      { value: "kg", label: "Kilogramo" },
                      { value: "litro", label: "Litro" },
                      { value: "metro", label: "Metro" },
                      { value: "caja", label: "Caja" },
                      { value: "tonelada", label: "Tonelada" },
                      { value: "otro", label: "Otro" },
                    ]}
                  />
                  <Input
                    label="Marca"
                    name="marca"
                    value={formData.marca}
                    onChange={handleChange}
                    placeholder="Opcional"
                  />
                  <Input
                    label="Modelo"
                    name="modelo"
                    value={formData.modelo}
                    onChange={handleChange}
                    placeholder="Opcional"
                  />
                  <Input
                    label="Presupuesto por unidad (MXN)"
                    name="presupuesto"
                    type="number"
                    step="0.01"
                    value={formData.presupuesto}
                    onChange={handleChange}
                    prefix="$"
                  />
                </FormSection>

                <FormSection title="Entrega" description="Dónde y para cuándo necesitas el material.">
                  <Input
                    label="Ubicación de entrega"
                    name="ubicacion"
                    value={formData.ubicacion}
                    onChange={handleChange}
                    placeholder="Ciudad, estado o dirección"
                  />
                  <Input
                    label="Días de entrega"
                    name="tiempoEntrega"
                    type="number"
                    value={formData.tiempoEntrega}
                    onChange={handleChange}
                    placeholder="Ej: 7"
                    suffix="días"
                  />
                  <FormFieldFull>
                    <Input
                      label="Proveedor preferido"
                      name="proveedorPreferido"
                      value={formData.proveedorPreferido}
                      onChange={handleChange}
                      placeholder="Opcional"
                    />
                  </FormFieldFull>
                </FormSection>

                <FormSection title="Detalles" description="Información adicional para refinar la propuesta.">
                  <FormFieldFull>
                    <Textarea
                      label="Detalles adicionales"
                      name="detalles"
                      rows={4}
                      value={formData.detalles}
                      onChange={handleChange}
                      placeholder="Especificaciones técnicas, normas requeridas, condiciones de pago, etc."
                    />
                  </FormFieldFull>
                </FormSection>

                {estado && (
                  <EstadoMensaje estado={estado} />
                )}

                <div className="flex justify-end gap-3 pt-2 border-t border-ink-200">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setMostrarFormulario(false)}
                    disabled={enviando}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    loading={enviando}
                    rightIcon={!enviando ? <ArrowRight size={16} /> : undefined}
                  >
                    {enviando ? "Enviando…" : "Enviar requisición"}
                  </Button>
                </div>
              </form>
            )}
          </main>
        </Reveal>
      </div>
    </div>
  );
}

function EstadoMensaje({ estado }: { estado: NonNullable<Estado> }) {
  const config = {
    info: { bg: "bg-ink-50", border: "border-ink-200", text: "text-ink-700", icon: <AlertCircle size={18} /> },
    loading: { bg: "bg-brand-50", border: "border-brand-100", text: "text-brand-700", icon: <Loader2 size={18} className="animate-spin" /> },
    success: { bg: "bg-success-bg", border: "border-success-border", text: "text-success", icon: <CheckCircle2 size={18} /> },
    error: { bg: "bg-danger-bg", border: "border-danger-border", text: "text-danger", icon: <XCircle size={18} /> },
  } as const;
  const c = config[estado.tipo];
  return (
    <div className={`${c.bg} border ${c.border} ${c.text} px-4 py-3 rounded flex items-start gap-2.5`}>
      <span className="shrink-0 mt-0.5">{c.icon}</span>
      <span className="text-sm">{estado.texto}</span>
    </div>
  );
}

/**
 * Banner que aparece tras volver de Stripe Checkout con ?pago=ok.
 * - Si la suscripción ya está activa (webhook procesó) → verde "¡Bienvenido!"
 * - Si activa=false aún (race contra webhook async) → azul "Procesando…".
 *   El onSnapshot del Dashboard detectará el cambio y este banner cambiará
 *   automáticamente al verde sin F5.
 */
function BannerPago({
  activa,
  planTipo,
  esEmpresaTemprana,
  onClose,
}: {
  activa: boolean;
  planTipo: "pyme" | "empresa" | null;
  esEmpresaTemprana: boolean;
  onClose: () => void;
}) {
  const nombrePlan =
    planTipo === "pyme" ? "PyME" : planTipo === "empresa" ? "Empresa" : "activo";

  if (activa) {
    return (
      <div className="bg-success-bg border-b border-success-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-start gap-3">
          <Sparkles size={18} className="text-success shrink-0 mt-0.5" />
          <div className="flex-1 text-sm text-ink-800">
            <strong className="text-ink-900">¡Bienvenido!</strong>{" "}
            Tu plan <strong>{nombrePlan}</strong> está activo. Ya puedes publicar
            RFQs y contactar proveedores sin límite.
            {esEmpresaTemprana && (
              <span className="block mt-1 text-ink-700">
                Tu registro fue recibido. Un equipo lo revisará en máximo 24 horas
                hábiles y luego aparecerás en el directorio.
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 text-ink-500 hover:text-ink-900 p-1 -m-1 rounded focus:outline-none focus-visible:shadow-focus"
            aria-label="Cerrar mensaje"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-50 border-b border-brand-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-start gap-3">
        <Loader2 size={18} className="text-brand-700 shrink-0 mt-0.5 animate-spin" />
        <div className="flex-1 text-sm text-ink-800">
          <strong className="text-ink-900">Procesando tu pago…</strong>{" "}
          Stripe está confirmando la transacción. En unos segundos verás tu plan
          activo aquí (sin necesidad de refrescar).
        </div>
        <button
          onClick={onClose}
          className="shrink-0 text-ink-500 hover:text-ink-900 p-1 -m-1 rounded focus:outline-none focus-visible:shadow-focus"
          aria-label="Cerrar mensaje"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
