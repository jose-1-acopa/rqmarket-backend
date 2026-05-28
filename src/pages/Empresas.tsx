/**
 * Empresas.tsx
 * Página de marketing pública del programa "Primeras 100 Empresas".
 *
 * - Hero institucional + CTA → /registro-empresa
 * - Sección "¿Por qué somos diferentes?" (3 bullets de confianza)
 * - 2 cards de oferta: Iniciales (destacada) + Aliadas
 * - CTA final
 * - Banner condicional "Tu reserva caducó" si llega desde el form con timer expirado
 *
 * Sin contadores dinámicos de cupos. Sin presión visual. Diseño SAP-leaning
 * consistente con /precios.
 */

import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  Award,
  Check,
  Sparkles,
  Clock,
  X,
} from "lucide-react";
import { Badge } from "../components/ui/Badge";

export default function Empresas() {
  const location = useLocation();
  const navigate = useNavigate();

  // Banner "tu reserva caducó" desde RegistroEmpresa cuando expira el timer
  const expiradaInicial = (location.state as { expirada?: boolean } | null)?.expirada;
  const [bannerExpirada, setBannerExpirada] = useState<boolean>(!!expiradaInicial);

  // Limpiar el state al montar para que el banner no reaparezca al refrescar
  useEffect(() => {
    if (expiradaInicial) {
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white">
      {/* Banner condicional: reserva expirada */}
      {bannerExpirada && (
        <div className="bg-warning-bg border-b border-warning-border">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 flex items-start gap-3">
            <Clock size={18} className="text-warning shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <strong className="text-warning">Tu reserva caducó.</strong>{" "}
              <span className="text-ink-700">
                El cupo se liberó. Empieza el registro de nuevo cuando estés listo.
              </span>
            </div>
            <button
              onClick={() => setBannerExpirada(false)}
              className="shrink-0 text-ink-500 hover:text-ink-900 p-1 -m-1 rounded focus:outline-none focus-visible:shadow-focus"
              aria-label="Cerrar mensaje"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* 1. HERO */}
      <section className="bg-brand-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-200/80 mb-5">
              Programa Primeras 100 Empresas
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.1]">
              Las primeras 100 empresas verificadas con el SAT, en RQ MARKET.
            </h1>
            <p className="mt-6 text-lg text-brand-100/90 max-w-2xl leading-relaxed">
              Validación automática contra las 6 listas oficiales del SAT (Art. 69
              del CFF) y la lista 69-B (EFOS). Solo empresas en cumplimiento
              fiscal real. Tu nombre comercial al lado de los proveedores
              auditados de México.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to="/registro-empresa"
                className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded bg-white text-brand-900 hover:bg-brand-50 active:bg-brand-100 font-medium text-sm transition-colors focus:outline-none focus-visible:shadow-focus"
              >
                Registrar mi empresa
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/precios"
                className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded border border-brand-700 hover:border-brand-500 hover:bg-brand-800/60 text-white font-medium text-sm transition-colors focus:outline-none focus-visible:shadow-focus"
              >
                Ver planes regulares
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ¿Por qué somos diferentes? */}
      <section className="border-b border-ink-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <SectionHeader
            eyebrow="Confianza fiscal"
            title="¿Por qué somos diferentes?"
            description="Todo proveedor en el directorio pasa por verificación documental real, no solo un check de email."
          />
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-px bg-ink-200 border border-ink-200 rounded overflow-hidden">
            <DifBlock
              icon={<ShieldCheck size={22} strokeWidth={1.5} />}
              title="Validación automática SAT"
              description="Cruzamos cada RFC contra las 6 listas oficiales del Artículo 69 del CFF + la lista 69-B (EFOS) en tiempo real."
            />
            <DifBlock
              icon={<FileCheck2 size={22} strokeWidth={1.5} />}
              title="Solo cumplimiento fiscal"
              description="Empresas en sentencias firmes o como defraudadoras no pueden registrarse. Tu directorio queda limpio."
            />
            <DifBlock
              icon={<Award size={22} strokeWidth={1.5} />}
              title="Marcador público de verificación"
              description="Apareces con tu tier de verificación visible. Los compradores filtran por confianza."
            />
          </div>
        </div>
      </section>

      {/* 3. 2 cards de oferta */}
      <section className="bg-ink-50 border-b border-ink-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <SectionHeader
            eyebrow="Programa fundador"
            title="Dos formas de entrar"
            description="Solo las primeras 100 empresas obtienen estas condiciones. Después se aplica la tarifa regular del plan PyME."
          />
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-5 items-start">
            <OfertaCard
              tipo="iniciales"
              etiquetaCantidad="Primeras 30"
              nombre="Empresas Iniciales"
              tagline="3 meses gratis · luego $699/mes"
              precioMensual="3 meses sin costo"
              precioRegular="$699 / mes a partir del mes 4"
              destacado
              badge="Sin costo inicial"
              features={[
                "Verificación SAT completa contra 6 listas oficiales",
                "Aparición en directorio público con tier visible",
                "Notificaciones email de nuevas RFQs en tu categoría",
                "Publicar RFQs ilimitadas",
                "Contactos ilimitados de otros proveedores",
                "Sin cargo automático tras los 3 meses sin tu confirmación",
              ]}
            />
            <OfertaCard
              tipo="aliadas"
              etiquetaCantidad="Siguientes 70"
              nombre="Empresas Aliadas"
              tagline="3 meses a $99/mes · luego $699/mes"
              precioMensual="$99 / mes los primeros 3 meses"
              precioRegular="$699 / mes a partir del mes 4"
              destacado={false}
              badge="Precio especial"
              features={[
                "Verificación SAT completa contra 6 listas oficiales",
                "Aparición en directorio público con tier visible",
                "Notificaciones email de nuevas RFQs en tu categoría",
                "Publicar RFQs ilimitadas",
                "Contactos ilimitados de otros proveedores",
                "85.83% de descuento durante el periodo introductorio",
              ]}
            />
          </div>
          <p className="mt-8 text-center text-xs text-ink-500">
            El tipo de cupo se asigna automáticamente según el orden en que las
            empresas se registren. Las primeras 30 obtienen Iniciales; las
            siguientes 70, Aliadas.
          </p>
        </div>
      </section>

      {/* 4. CTA final */}
      <section className="bg-brand-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            ¿Listo para registrar tu empresa?
          </h2>
          <p className="mt-3 text-brand-100/90 max-w-2xl mx-auto">
            El tipo de cupo se confirma al iniciar el registro. Reservamos tu
            lugar por 15 minutos mientras completas tus datos.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/registro-empresa"
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded bg-white text-brand-900 hover:bg-brand-50 active:bg-brand-100 font-medium text-sm transition-colors focus:outline-none focus-visible:shadow-focus"
            >
              Quiero registrar mi empresa
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/contacto"
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded border border-brand-700 hover:border-brand-500 hover:bg-brand-800/60 text-white font-medium text-sm transition-colors focus:outline-none focus-visible:shadow-focus"
            >
              Tengo preguntas
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Subcomponentes ──────────────────────────────────────────────────

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-700">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-2xl sm:text-3xl font-semibold text-ink-900 tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-lg text-ink-600 leading-relaxed">{description}</p>
      )}
    </div>
  );
}

function DifBlock({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-6">
      <div className="inline-flex items-center justify-center w-10 h-10 rounded bg-brand-50 text-brand-700 border border-brand-100">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold text-ink-900">{title}</h3>
      <p className="mt-2 text-sm text-ink-600 leading-relaxed">{description}</p>
    </div>
  );
}

function OfertaCard({
  tipo,
  etiquetaCantidad,
  nombre,
  tagline,
  precioMensual,
  precioRegular,
  destacado,
  badge,
  features,
}: {
  tipo: "iniciales" | "aliadas";
  etiquetaCantidad: string;
  nombre: string;
  tagline: string;
  precioMensual: string;
  precioRegular: string;
  destacado: boolean;
  badge: string;
  features: string[];
}) {
  return (
    <div
      className={`relative bg-white rounded-lg p-7 lg:p-8 flex flex-col h-full transition-shadow ${
        destacado
          ? "border-2 border-brand-600 shadow-lg"
          : "border border-ink-200 hover:border-ink-300"
      }`}
    >
      {destacado && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="brand" size="md" icon={<Sparkles size={12} />}>
            {badge}
          </Badge>
        </div>
      )}
      {!destacado && (
        <div className="mb-3 inline-flex items-center self-start font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm bg-ink-100 text-ink-700 border border-ink-200">
          {badge}
        </div>
      )}

      <header>
        <p className="font-mono text-xs uppercase tracking-wider text-brand-700">
          {etiquetaCantidad}
        </p>
        <h3 className="mt-1.5 text-xl font-semibold text-ink-900">{nombre}</h3>
        <p className="mt-1 text-sm text-ink-500">{tagline}</p>
      </header>

      <div className="mt-6 pb-6 border-b border-ink-200">
        <div className="font-mono text-2xl font-semibold text-ink-900 leading-tight">
          {precioMensual}
        </div>
        <p className="mt-2 text-xs text-ink-500">{precioRegular}</p>
      </div>

      <ul className="mt-6 space-y-3 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm leading-snug">
            <Check
              size={16}
              className="text-success shrink-0 mt-0.5"
              strokeWidth={2.5}
            />
            <span className="text-ink-700">{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <Link
          to="/registro-empresa"
          className={`w-full inline-flex items-center justify-center gap-2 h-11 px-5 rounded font-medium text-sm transition-colors focus:outline-none focus-visible:shadow-focus ${
            destacado
              ? "bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white shadow-sm"
              : "bg-white text-ink-900 border border-ink-300 hover:bg-ink-50 active:bg-ink-100"
          }`}
        >
          Registrar mi empresa como {tipo === "iniciales" ? "Inicial" : "Aliada"}
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
