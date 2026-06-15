/**
 * MiSuscripcion.tsx
 * Página privada donde el usuario ve su suscripción actual y abre el
 * Customer Portal hosted by Stripe.
 *
 * Flow:
 *   1. Auth required → redirect a /login si no hay sesión
 *   2. Lee usuarios/{uid}.suscripcion directamente de Firestore (client SDK)
 *      Patrón idéntico a AuthContext.tsx:87
 *   3. Render condicional:
 *      a. cargando         → spinner
 *      b. error            → bloque rojo
 *      c. sin suscripción  → empty state + link a /precios
 *      d. con suscripción  → card con datos + botón "Gestionar"
 *   4. Botón "Gestionar" → POST /api/stripe/customer-portal → redirect a Stripe
 */

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  Lock,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useAuth } from "../firebase/AuthContext";
import { abrirCustomerPortal, formatearFechaEs } from "../services/rqmarketApi";
import { useSuscripcion, type SuscripcionData, type EstadoSuscripcion } from "../hooks/useSuscripcion";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Reveal } from "../components/ui/Reveal";

export default function MiSuscripcion() {
  const navigate = useNavigate();
  const { usuario, cargando: cargandoAuth, esAdminOrg, orgRol } = useAuth();

  // Org-aware: para Empresa lee la suscripción de la organización.
  const { suscripcion, cargando, error: errorCarga } = useSuscripcion();

  const [abriendoPortal, setAbriendoPortal] = useState(false);
  const [errorPortal, setErrorPortal] = useState<string | null>(null);

  // Solo el admin de la org gestiona la facturación (PyME no tiene orgRol → puede).
  const puedeGestionar = !orgRol || esAdminOrg;

  // ── Auth guard ──
  useEffect(() => {
    if (!cargandoAuth && !usuario) {
      navigate("/login", { state: { desde: "/mi-suscripcion" } });
    }
  }, [usuario, cargandoAuth, navigate]);

  const handleGestionar = async () => {
    setAbriendoPortal(true);
    setErrorPortal(null);
    try {
      const returnUrl = `${window.location.origin}/mi-suscripcion`;
      const res = await abrirCustomerPortal({ returnUrl });
      window.location.href = res.url;
    } catch (err: any) {
      setErrorPortal(
        err?.message || "No se pudo abrir el portal. Intenta de nuevo."
      );
      setAbriendoPortal(false);
    }
  };

  // ── Loading / sin auth ──
  if (cargandoAuth || cargando) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-ink-500">
        <Loader2 size={18} className="animate-spin mr-2" />
        Cargando tu suscripción…
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

  const tieneActiva = !!suscripcion?.activa;

  return (
    <div className="bg-ink-50 min-h-screen">
      {/* Header institucional */}
      <header className="bg-white border-b border-ink-200">
        <Reveal as="div" className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-700">
            Mi cuenta
          </p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-ink-900 tracking-tight">
            Mi suscripción
          </h1>
          <p className="mt-1 text-sm text-ink-600">
            Gestiona tu plan, tarjeta y facturas desde el portal seguro de Stripe.
          </p>
        </Reveal>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {errorCarga && (
          <div className="bg-danger-bg border border-danger-border text-danger px-4 py-3 rounded flex items-start gap-2.5">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">No se pudo cargar tu suscripción</div>
              <div className="text-sm mt-0.5">{errorCarga}</div>
            </div>
          </div>
        )}

        {!errorCarga && !tieneActiva && <EmptyStateSinSuscripcion />}

        {!errorCarga && tieneActiva && suscripcion && (
          <SuscripcionActivaCard
            suscripcion={suscripcion}
            abriendoPortal={abriendoPortal}
            errorPortal={errorPortal}
            onGestionar={handleGestionar}
            puedeGestionar={puedeGestionar}
          />
        )}
      </div>
    </div>
  );
}

// ─── Empty state: sin suscripción activa ──────────────────────────────

function EmptyStateSinSuscripcion() {
  return (
    <div className="bg-white border border-dashed border-ink-300 rounded p-10 sm:p-12 text-center shadow-card animate-fade-in-up">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-ink-100 text-ink-500 border border-ink-200">
        <CreditCard size={26} strokeWidth={1.5} />
      </div>
      <h2 className="mt-5 text-xl font-semibold text-ink-900">
        Aún no tienes una suscripción activa
      </h2>
      <p className="mt-2 text-sm text-ink-600 max-w-md mx-auto leading-relaxed">
        Suscríbete a un plan PyME o Empresa para desbloquear contactos ilimitados,
        publicar RFQs y recibir notificaciones por email cuando aparezcan
        solicitudes en tus categorías.
      </p>
      <div className="mt-6">
        <Link
          to="/precios"
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-medium text-sm transition-colors focus:outline-none focus-visible:shadow-focus"
        >
          Ver planes
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

// ─── Card con suscripción activa ──────────────────────────────────────

function SuscripcionActivaCard({
  suscripcion,
  abriendoPortal,
  errorPortal,
  onGestionar,
  puedeGestionar,
}: {
  suscripcion: SuscripcionData;
  abriendoPortal: boolean;
  errorPortal: string | null;
  onGestionar: () => void;
  puedeGestionar: boolean;
}) {
  const planLabel =
    suscripcion.plan_tipo === "pyme"
      ? "Plan PyME"
      : suscripcion.plan_tipo === "empresa"
        ? "Plan Empresa"
        : "Plan activo";

  const facturacionLabel =
    suscripcion.facturacion === "mensual"
      ? "Mensual"
      : suscripcion.facturacion === "anual"
        ? "Anual"
        : "—";

  const estadoConfig = obtenerConfigEstado(suscripcion.estado);

  return (
    <div className="bg-white border border-ink-200 rounded overflow-hidden shadow-card animate-fade-in-up">
      {/* Aviso especial según estado (past_due, trialing, incomplete) */}
      {estadoConfig.aviso && (
        <div
          className={`px-5 py-3 border-b ${estadoConfig.avisoBg} ${estadoConfig.avisoBorder} ${estadoConfig.avisoText} flex items-start gap-2.5`}
        >
          <span className="shrink-0 mt-0.5">{estadoConfig.avisoIcon}</span>
          <div className="text-sm">
            <strong>{estadoConfig.avisoTitulo}</strong> — {estadoConfig.aviso}
          </div>
        </div>
      )}

      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-brand-700">
              Tu plan actual
            </p>
            <h2 className="mt-1.5 text-2xl font-semibold text-ink-900">
              {planLabel}
            </h2>
          </div>
          {estadoConfig.badge}
        </div>

        <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 pt-6 border-t border-ink-200">
          <Campo
            label="Facturación"
            value={facturacionLabel}
          />
          <Campo
            label="Próximo cobro"
            value={formatearFechaEs(suscripcion.fecha_proximo_cobro, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          />
          <Campo
            label="Inicio de suscripción"
            value={formatearFechaEs(suscripcion.fecha_inicio, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          />
          <Campo
            label="ID de suscripción"
            value={suscripcion.stripe_subscription_id || "—"}
            mono
            small
          />
        </dl>

        <div className="mt-8 pt-6 border-t border-ink-200">
          {puedeGestionar ? (
            <>
              <Button
                onClick={onGestionar}
                loading={abriendoPortal}
                leftIcon={!abriendoPortal ? <CreditCard size={16} /> : undefined}
                rightIcon={!abriendoPortal ? <ArrowUpRight size={16} /> : undefined}
              >
                {abriendoPortal ? "Abriendo portal…" : "Gestionar suscripción"}
              </Button>
              <p className="mt-3 text-xs text-ink-500 leading-relaxed max-w-xl">
                Te llevamos al portal seguro de Stripe. Ahí puedes cambiar de tarjeta,
                cambiar entre PyME y Empresa, descargar facturas o cancelar tu
                suscripción en cualquier momento.
              </p>

              {errorPortal && (
                <div className="mt-4 bg-danger-bg border border-danger-border text-danger px-3 py-2 rounded flex items-start gap-2">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span className="text-xs">{errorPortal}</span>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-ink-600 leading-relaxed max-w-xl">
              La facturación de tu organización la gestiona el administrador. Si
              necesitas cambios en el plan o la tarjeta, contáctalo.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Helper: campo de detalle ────────────────────────────────────────

function Campo({
  label,
  value,
  mono = false,
  small = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  small?: boolean;
}) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
        {label}
      </div>
      <div
        className={`mt-1 text-ink-900 ${mono ? "font-mono tabular-nums" : ""} ${
          small ? "text-xs break-all" : "text-base"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

// ─── Helper: config visual por estado ─────────────────────────────────

interface EstadoConfig {
  badge: React.ReactNode;
  avisoTitulo?: string;
  aviso?: string;
  avisoIcon?: React.ReactNode;
  avisoBg?: string;
  avisoBorder?: string;
  avisoText?: string;
}

function obtenerConfigEstado(estado?: EstadoSuscripcion): EstadoConfig {
  switch (estado) {
    case "active":
      return {
        badge: (
          <Badge variant="success" size="md" icon={<CheckCircle2 size={12} />}>
            Activa
          </Badge>
        ),
      };
    case "trialing":
      return {
        badge: (
          <Badge variant="brand" size="md" icon={<Sparkles size={12} />}>
            En prueba
          </Badge>
        ),
        avisoTitulo: "Periodo de prueba",
        aviso:
          "Estás en tu periodo de prueba. Al terminar, se cobrará automáticamente con tu tarjeta registrada.",
        avisoIcon: <Sparkles size={16} />,
        avisoBg: "bg-brand-50/60",
        avisoBorder: "border-brand-100",
        avisoText: "text-brand-700",
      };
    case "past_due":
      return {
        badge: (
          <Badge variant="warning" size="md" icon={<Clock size={12} />}>
            Pago atrasado
          </Badge>
        ),
        avisoTitulo: "Pago atrasado",
        aviso:
          "El último intento de cobro falló. Actualiza tu tarjeta desde el portal para que tu plan siga activo.",
        avisoIcon: <AlertTriangle size={16} />,
        avisoBg: "bg-warning-bg",
        avisoBorder: "border-warning-border",
        avisoText: "text-warning",
      };
    case "incomplete":
      return {
        badge: (
          <Badge variant="warning" size="md" icon={<Clock size={12} />}>
            Pago incompleto
          </Badge>
        ),
        avisoTitulo: "Pago incompleto",
        aviso:
          "Tu primer pago aún no se ha completado. Abre el portal para finalizarlo.",
        avisoIcon: <AlertTriangle size={16} />,
        avisoBg: "bg-warning-bg",
        avisoBorder: "border-warning-border",
        avisoText: "text-warning",
      };
    case "canceled":
      return {
        badge: (
          <Badge variant="neutral" size="md" icon={<XCircle size={12} />}>
            Cancelada
          </Badge>
        ),
      };
    default:
      return {
        badge: (
          <Badge variant="default" size="md">
            {estado || "—"}
          </Badge>
        ),
      };
  }
}
