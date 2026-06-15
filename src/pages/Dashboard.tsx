// src/pages/Dashboard.tsx
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  PackageCheck,
  FileText,
  FileSearch,
  AlertCircle,
  ShieldCheck,
  Users,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Sparkles,
  X,
  Store,
} from "lucide-react";
import { useAuth } from "../firebase/AuthContext";
import { useSuscripcion } from "../hooks/useSuscripcion";
import { Button } from "../components/ui/Button";
import { Reveal } from "../components/ui/Reveal";

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { puedeComprar, puedeVender, esAdminOrg, orgRol } = useAuth();

  // Suscripción org-aware (Empresa → org; PyME → user) + bandera empresa_temprana.
  const { suscripcion, empresaTemprana: esEmpresaTemprana } = useSuscripcion();

  // Banner "¡Bienvenido!" / "Procesando…" tras pago Stripe
  const [bannerPagoVisible, setBannerPagoVisible] = useState(
    searchParams.get("pago") === "ok"
  );

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
  };

  const tienePlan = !!suscripcion?.activa;
  const planTipo = suscripcion?.plan_tipo || null;
  const selected = tienePlan ? planesInfo[planTipo || ""] || planFallback : null;

  // Cerrar banner de pago + limpiar el query param para que F5 no lo re-muestre
  const cerrarBannerPago = () => {
    setBannerPagoVisible(false);
    navigate("/dashboard", { replace: true });
  };

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
              Aún no tienes un plan asignado. Una vez que actives un plan, podrás publicar RFQs y acceder al directorio de proveedores.
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

          {/* Contenido principal — acciones adaptadas por rol de organización */}
          <main className="space-y-6">
            {/* Banner de rol — solo para miembros de una organización (Empresa) */}
            {orgRol && (
              <div className="bg-white border border-ink-200 rounded p-4 shadow-card flex items-center gap-3 animate-fade-in-up">
                <span className="font-mono text-[11px] uppercase tracking-wider px-2 py-1 rounded-sm bg-brand-50 text-brand-700 border border-brand-100">
                  {orgRol === "admin" ? "Admin de organización" : orgRol === "compras" ? "Compras" : "Ventas"}
                </span>
                <span className="text-sm text-ink-600">
                  {orgRol === "compras"
                    ? "Tu rol gestiona el lado de compras."
                    : orgRol === "ventas"
                      ? "Tu rol gestiona el lado de ventas."
                      : "Acceso completo a compras y ventas de tu organización."}
                </span>
              </div>
            )}

            {/* Lado COMPRADOR (admin/compras, o PyME) */}
            {puedeComprar && (
              <div className="bg-white border border-ink-200 rounded p-6 shadow-card animate-fade-in-up">
                <h2 className="text-lg font-semibold text-ink-900">¿Qué deseas comprar?</h2>
                <p className="mt-1 text-sm text-ink-600">
                  Publica una RFQ y recibe cotizaciones de proveedores verificados del directorio.
                </p>
                <div className="mt-5">
                  <Button
                    onClick={() => navigate("/publicar-rfq")}
                    rightIcon={<ArrowRight size={16} />}
                  >
                    Publicar una RFQ
                  </Button>
                </div>
              </div>
            )}

            {/* Lado VENDEDOR (admin/ventas, o PyME) */}
            {puedeVender && (
              <div className="bg-white border border-ink-200 rounded p-6 shadow-card animate-fade-in-up">
                <div className="flex items-start gap-3">
                  <span className="text-brand-700 shrink-0 mt-0.5"><Store size={18} /></span>
                  <div>
                    <h2 className="text-lg font-semibold text-ink-900">Lado de ventas</h2>
                    <p className="mt-1 text-sm text-ink-600">
                      Responde solicitudes de cotización (RFQ) en tus categorías y gestiona tu perfil de proveedor.
                    </p>
                    <Button
                      variant="secondary"
                      className="mt-4"
                      onClick={() => navigate("/rfqs")}
                      rightIcon={<ArrowRight size={16} />}
                    >
                      Ver RFQs para cotizar
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Gestión de equipo (solo admin de organización Empresa) */}
            {esAdminOrg && (
              <div className="bg-white border border-ink-200 rounded p-6 shadow-card animate-fade-in-up">
                <div className="flex items-start gap-3">
                  <span className="text-brand-700 shrink-0 mt-0.5"><Users size={18} /></span>
                  <div>
                    <h2 className="text-lg font-semibold text-ink-900">Tu equipo</h2>
                    <p className="mt-1 text-sm text-ink-600">
                      Invita usuarios a tu organización y asígnales un rol (compras o ventas).
                    </p>
                    <Button
                      className="mt-4"
                      onClick={() => navigate("/equipo")}
                      rightIcon={<ArrowRight size={16} />}
                    >
                      Gestionar equipo
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </Reveal>
      </div>
    </div>
  );
}

/**
 * Banner que aparece tras volver de Stripe Checkout con ?pago=ok.
 * - Si la suscripción ya está activa (webhook procesó) → verde "¡Bienvenido!"
 * - Si activa=false aún (race contra webhook async) → azul "Procesando…".
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
