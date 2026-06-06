import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Check,
  X,
  ArrowRight,
  ShieldCheck,
  Award,
  FileCheck2,
  Lock,
  Crown,
  Users,
  Sparkles,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Accordion, AccordionItem } from "../components/ui/Accordion";
import { Reveal } from "../components/ui/Reveal";
import { useAuth } from "../firebase/AuthContext";
import { iniciarCheckout } from "../services/rqmarketApi";

type Billing = "mensual" | "anual";

type CTA =
  | { tipo: "link"; label: string; to: string }
  | { tipo: "checkout"; label: string; priceMensual: string; priceAnual: string };

interface PlanInfo {
  slug: string;
  nombre: string;
  tagline: string;
  precioMensual: number;
  precioAnual: number;
  ahorroAnual: number;
  cta: CTA;
  features: string[];
  noIncluye?: string[];
  destacado: boolean;
}

const PLANES: Record<"gratis" | "pyme" | "empresa", PlanInfo> = {
  gratis: {
    slug: "gratis",
    nombre: "Gratis",
    tagline: "Para curiosos y casuales",
    precioMensual: 0,
    precioAnual: 0,
    ahorroAnual: 0,
    cta: { tipo: "link", label: "Empezar gratis", to: "/login" },
    features: [
      "Ver directorio completo con nombres visibles",
      "Filtrar por categoría y estado",
      "1 contacto desbloqueado al mes",
    ],
    noIncluye: [
      "Publicar RFQs",
      "Registrar tu empresa como proveedor",
      "Notificaciones por email",
    ],
    destacado: false,
  },
  pyme: {
    slug: "pyme",
    nombre: "PyME",
    tagline: "El dueño compra y vende",
    precioMensual: 699,
    precioAnual: 7699,
    ahorroAnual: 689,
    cta: {
      tipo: "checkout",
      label: "Quiero el plan PyME",
      priceMensual: "price_1TbN0AJmriLfuvf3GC4gVCl8",
      priceAnual: "price_1TbN0GJmriLfuvf3jla1na6R",
    },
    features: [
      "Todo lo del plan Gratis",
      "Contactos ilimitados (teléfono, email, dirección)",
      "Publicar RFQs ilimitadas",
      "Registrar tu empresa como proveedor (compra y vende)",
      "Notificaciones email de nuevas RFQs en tu categoría",
      "Aparece en el directorio público verificado",
      "1 usuario (el dueño)",
    ],
    destacado: true,
  },
  empresa: {
    slug: "empresa",
    nombre: "Empresa",
    tagline: "Áreas separadas de compras y ventas",
    precioMensual: 2099,
    precioAnual: 23000,
    ahorroAnual: 2188,
    cta: { tipo: "link", label: "Hablar con ventas", to: "/contacto?plan=empresa" },
    features: [
      "Todo lo del plan PyME",
      "Múltiples usuarios con roles separados",
      "Hasta 10 usuarios incluidos",
      "Soporte prioritario por WhatsApp",
      "Dashboard consolidado de la empresa",
    ],
    destacado: false,
  },
};

export default function Precios() {
  const [billing, setBilling] = useState<Billing>("mensual");

  return (
    <div className="bg-white">
      {/* 1. HERO + TOGGLE */}
      <section className="hero-surface text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-3xl">
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-200">
                Planes y precios
              </p>
            </Reveal>
            <Reveal delay={70}>
              <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.1] text-white">
                Planes que crecen con tu empresa.
              </h1>
            </Reveal>
            <Reveal delay={140}>
              <p className="mt-5 text-lg sm:text-xl text-brand-100 leading-relaxed">
                Verificación B2B real para compras industriales. Sin contratos forzados. Cancela cuando quieras.
              </p>
            </Reveal>
          </div>

          {/* Toggle Mensual / Anual */}
          <Reveal delay={210}>
            <div className="mt-10 flex items-center gap-4">
              <BillingToggle value={billing} onChange={setBilling} />
              <span
                className={`font-mono text-[11px] uppercase tracking-wider px-2 py-1 rounded-sm border ${
                  billing === "anual"
                    ? "bg-brand-50 text-brand-700 border-brand-100"
                    : "bg-brand-900/50 text-brand-200 border-brand-700"
                }`}
              >
                Ahorra ~8%
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2. PRICING CARDS */}
      <section className="border-b border-ink-200 bg-ink-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <Reveal className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-5 lg:items-start">
            <PricingCard plan={PLANES.gratis} billing={billing} />
            <PricingCard plan={PLANES.pyme} billing={billing} />
            <PricingCard plan={PLANES.empresa} billing={billing} />
          </Reveal>

          <p className="mt-8 text-center text-xs text-ink-500">
            Precios en pesos mexicanos (MXN). No incluyen IVA. Facturación fiscal mexicana disponible.
          </p>
        </div>
      </section>

      {/* 3. TABLA COMPARATIVA */}
      <section className="border-b border-ink-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <SectionHeader
            eyebrow="Comparativa detallada"
            title="¿Qué incluye cada plan?"
            description="Todas las suscripciones incluyen la validación del RFC contra las 6 listas oficiales del SAT. Los planes pagos desbloquean contactos y acciones."
          />
          <Reveal delay={80} className="mt-10 -mx-4 sm:mx-0 sm:border sm:border-ink-200 sm:rounded sm:shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-ink-50 border-b border-ink-200">
                  <tr>
                    <th className="text-left font-mono text-[11px] uppercase tracking-wider text-ink-500 px-4 py-3 w-2/5">
                      Funcionalidad
                    </th>
                    <th className="text-center font-mono text-[11px] uppercase tracking-wider text-ink-500 px-4 py-3">
                      Gratis
                    </th>
                    <th className="text-center font-mono text-[11px] uppercase tracking-wider text-brand-700 px-4 py-3 border-l border-ink-200 bg-brand-50/40">
                      PyME
                    </th>
                    <th className="text-center font-mono text-[11px] uppercase tracking-wider text-ink-500 px-4 py-3 border-l border-ink-200">
                      Empresa
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-200">
                  {comparativa.map((row) => (
                    <tr key={row.feature} className="hover:bg-ink-50/50 transition-colors">
                      <td className="px-4 py-3 text-ink-800 font-medium align-top">
                        {row.feature}
                      </td>
                      <TableCell value={row.gratis} />
                      <TableCell value={row.pyme} highlight />
                      <TableCell value={row.empresa} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 4. CÓMO DECIDIR */}
      <section className="border-b border-ink-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <SectionHeader
            eyebrow="Cómo decidir"
            title="¿Qué plan elegir?"
            description="Tres perfiles, tres caminos. Si dudas, empieza por el plan gratis y sube cuando lo necesites."
          />
          <Reveal delay={80} className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-px bg-ink-200 border border-ink-200 rounded shadow-card overflow-hidden">
            <DecisionBlock
              icon={<Sparkles size={20} strokeWidth={1.5} />}
              title="Soy curioso"
              description="Quiero explorar el directorio antes de decidir. Probaré contactar a un proveedor antes de pagar."
              ctaLabel="Empezar gratis"
              ctaTo="/login"
            />
            <DecisionBlock
              icon={<Users size={20} strokeWidth={1.5} />}
              title="Soy PyME (1–50 personas)"
              description="Mi empresa compra material industrial y a veces también vende. Una sola persona maneja procura y ventas."
              ctaLabel="Quiero el plan PyME"
              ctaTo="/login?plan=pyme"
              highlight
            />
            <DecisionBlock
              icon={<Crown size={20} strokeWidth={1.5} />}
              title="Soy empresa grande (50+)"
              description="Tenemos áreas separadas de compras y ventas, varios usuarios, y queremos un dashboard consolidado."
              ctaLabel="Hablar con ventas"
              ctaTo="/contacto?plan=empresa"
            />
          </Reveal>
        </div>
      </section>

      {/* 5. VERIFICACIÓN */}
      <section className="bg-ink-50 border-b border-ink-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <SectionHeader
            eyebrow="Incluido en toda suscripción"
            title="Verificación real, no badges decorativos"
            description="Independientemente del plan que elijas, cada proveedor del directorio se valida con el mismo rigor contra las listas del SAT."
          />
          <Reveal delay={80} className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <VerificationItem
              icon={<ShieldCheck size={20} strokeWidth={1.5} />}
              title="Validación contra 6 listas del SAT"
              description="Cada RFC se cruza automáticamente contra las 6 listas oficiales del SAT (EFOS/69-B, firmes, sentencias, no localizados, cancelados y exigibles)."
            />
            <VerificationItem
              icon={<Award size={20} strokeWidth={1.5} />}
              title="Clasificación escalonada"
              description="Bloqueamos los incumplimientos graves y señalamos las observaciones menores. Un filtro justo, no un simple check de existencia."
            />
            <VerificationItem
              icon={<FileCheck2 size={20} strokeWidth={1.5} />}
              title="Actualización diaria"
              description="Las listas del SAT se actualizan automáticamente cada día desde los datos abiertos. Más de 469,000 RFC monitoreados."
            />
            <VerificationItem
              icon={<Lock size={20} strokeWidth={1.5} />}
              title="Garantía de transparencia"
              description="Sin comisión por contacto. El comprador y proveedor se conectan directamente, sin intermediación opaca."
            />
          </Reveal>
        </div>
      </section>

      {/* 6. FAQ */}
      <section className="border-b border-ink-200">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
          <SectionHeader
            eyebrow="Preguntas frecuentes"
            title="Antes de elegir tu plan"
            description=""
          />
          <Reveal className="mt-8">
            <Accordion>
              <AccordionItem question="¿Cómo funciona el plan gratis?">
                Te registras con tu correo y obtienes acceso al directorio completo de proveedores verificados. Puedes filtrar por categoría y estado sin pagar nada. El plan gratis incluye <strong>1 contacto desbloqueado por mes</strong> — es decir, puedes ver los datos de contacto (teléfono, email, dirección) de un proveedor cada 30 días. Para contactos ilimitados, necesitas el plan PyME o Empresa.
              </AccordionItem>
              <AccordionItem question="¿Qué pasa si cancelo mi suscripción?">
                Puedes cancelar en cualquier momento desde tu dashboard. Tu plan sigue activo hasta el final del periodo ya pagado (mes o año, según hayas elegido) y después regresa automáticamente al plan gratis. No hay penalizaciones ni cargos por cancelación.
              </AccordionItem>
              <AccordionItem question="¿Puedo cambiar de plan después?">
                Sí. Subir de plan es inmediato: pagas el prorrateo de la diferencia y tienes acceso al instante. Bajar de plan se aplica al final de tu periodo actual de facturación, sin cargos adicionales.
              </AccordionItem>
              <AccordionItem question="¿Cómo verifican los proveedores?">
                Cada RFC se valida automáticamente contra las 6 listas oficiales del SAT (EFOS/69-B, firmes, sentencias, no localizados, cancelados y exigibles), actualizadas cada día desde los datos abiertos del SAT. La clasificación es escalonada: los incumplimientos graves bloquean el registro de inmediato y las observaciones menores quedan señaladas. Además, un administrador revisa que el registro sea legítimo y coherente antes de publicarlo en el directorio.
              </AccordionItem>
              <AccordionItem question="¿Tienen factura fiscal mexicana?">
                Sí. Emitimos factura electrónica CFDI 4.0 con tu RFC. Una vez confirmado el pago, puedes descargar tu factura desde el dashboard. Si necesitas un complemento de pago específico, escríbenos a informacion@rqmarket.com.mx.
              </AccordionItem>
              <AccordionItem question="¿Qué formas de pago aceptan?">
                Los pagos se procesan con tarjeta de crédito o débito a través de Stripe, nuestro procesador de pagos. RQ MARKET no almacena los datos de tu tarjeta. Si tu empresa tiene un requerimiento de pago particular, escríbenos y lo revisamos.
              </AccordionItem>
              <AccordionItem question="¿Cuál es la diferencia entre PyME y Empresa?">
                El plan <strong>PyME</strong> está pensado para que una sola persona (el dueño o gerente de procura) maneje compras y ventas desde la misma cuenta. Un usuario, todas las funciones.
                <br /><br />
                El plan <strong>Empresa</strong> está pensado para corporativos con áreas separadas: compradores que solo compran, vendedores que solo gestionan el perfil de proveedor, y administradores que ven el dashboard consolidado. Hasta 10 usuarios con roles diferenciados.
              </AccordionItem>
            </Accordion>
          </Reveal>
        </div>
      </section>

      {/* 7. CTA FINAL */}
      <section className="hero-surface text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24 text-center">
          <Reveal>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              ¿Listo para empezar?
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="mt-4 text-lg text-brand-100 max-w-2xl mx-auto leading-relaxed">
              El directorio es público y gratuito. Sube de plan solo cuando necesites desbloquear contactos ilimitados o registrar tu empresa.
            </p>
          </Reveal>
          <Reveal delay={160}>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded bg-white text-brand-900 shadow-sm hover:bg-brand-50 hover:shadow-card-hover hover:-translate-y-px active:bg-brand-100 active:translate-y-0 font-medium text-sm transition duration-150 focus:outline-none focus-visible:shadow-focus"
              >
                Empezar gratis
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/contacto?plan=empresa"
                className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded border border-brand-500/60 text-white hover:border-brand-400 hover:bg-brand-800/60 font-medium text-sm transition-colors focus:outline-none focus-visible:shadow-focus"
              >
                Hablar con ventas
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

// ─── Subcomponentes locales ─────────────────────────────────────────

function BillingToggle({ value, onChange }: { value: Billing; onChange: (v: Billing) => void }) {
  return (
    <div
      className="inline-flex p-1 rounded bg-brand-950/60 border border-brand-700"
      role="tablist"
      aria-label="Periodo de facturación"
    >
      <ToggleButton active={value === "mensual"} onClick={() => onChange("mensual")}>
        Mensual
      </ToggleButton>
      <ToggleButton active={value === "anual"} onClick={() => onChange("anual")}>
        Anual
      </ToggleButton>
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`h-9 px-5 rounded text-sm font-medium transition focus:outline-none focus-visible:shadow-focus ${
        active
          ? "bg-white text-brand-900 shadow-sm"
          : "text-brand-100 hover:text-white hover:bg-brand-800/50"
      }`}
    >
      {children}
    </button>
  );
}

function PricingCard({ plan, billing }: { plan: PlanInfo; billing: Billing }) {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const esGratis = plan.precioMensual === 0;
  const precio = billing === "mensual" ? plan.precioMensual : plan.precioAnual;
  const sufijo = esGratis ? "" : billing === "mensual" ? "/mes" : "/año";

  const [cargandoCheckout, setCargandoCheckout] = useState(false);
  const [errorCheckout, setErrorCheckout] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (plan.cta.tipo !== "checkout") return;

    // Sin sesión → mandar a /login con redirect back a /precios
    if (!usuario) {
      navigate("/login", { state: { desde: "/precios" } });
      return;
    }

    setCargandoCheckout(true);
    setErrorCheckout(null);
    try {
      const priceId =
        billing === "mensual" ? plan.cta.priceMensual : plan.cta.priceAnual;
      const successUrl = `${window.location.origin}/dashboard?pago=ok`;
      const cancelUrl = `${window.location.origin}/precios`;
      const res = await iniciarCheckout({ priceId, successUrl, cancelUrl });
      // Redirect a Stripe Checkout. window.location.href reemplaza la página
      // por lo que no es necesario setCargandoCheckout(false) en el happy path.
      window.location.href = res.url;
    } catch (err: any) {
      setErrorCheckout(
        err?.message || "No se pudo iniciar el pago. Intenta de nuevo."
      );
      setCargandoCheckout(false);
    }
  };

  const ctaClasses = `w-full inline-flex items-center justify-center gap-2 h-11 px-5 rounded font-medium text-sm transition-colors focus:outline-none focus-visible:shadow-focus disabled:opacity-50 disabled:cursor-not-allowed ${
    plan.destacado
      ? "bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white shadow-sm"
      : "bg-white text-ink-900 border border-ink-300 hover:bg-ink-50 active:bg-ink-100"
  }`;

  return (
    <div
      className={`relative bg-white rounded-lg p-7 lg:p-8 flex flex-col h-full transition duration-200 ${
        plan.destacado
          ? "border-2 border-brand-600 shadow-card-hover lg:scale-[1.02] z-10"
          : "border border-ink-200 shadow-card hover:border-brand-500 hover:shadow-card-hover hover:-translate-y-0.5"
      }`}
    >
      {plan.destacado && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="brand" size="md" icon={<Sparkles size={12} />}>
            Más popular
          </Badge>
        </div>
      )}

      <header>
        <h3 className="text-lg font-semibold text-ink-900">{plan.nombre}</h3>
        <p className="mt-1 text-sm text-ink-500">{plan.tagline}</p>
      </header>

      <div className="mt-6 pb-6 border-b border-ink-200">
        <div className="flex items-baseline gap-1.5">
          {esGratis ? (
            <span className="font-mono text-5xl font-semibold text-ink-900 tabular-nums leading-none">
              $0
            </span>
          ) : (
            <>
              <span className="font-mono text-xl text-ink-500 leading-none">$</span>
              <span className="font-mono text-5xl lg:text-6xl font-semibold text-ink-900 tabular-nums leading-none">
                {precio.toLocaleString("es-MX")}
              </span>
              <span className="text-sm text-ink-500 ml-1">MXN{sufijo}</span>
            </>
          )}
        </div>

        {!esGratis && billing === "anual" && plan.ahorroAnual > 0 && (
          <div className="mt-3 inline-flex items-center font-mono text-[11px] uppercase tracking-wider px-2 py-1 rounded-sm bg-success-bg text-success border border-success-border">
            Ahorras ${plan.ahorroAnual.toLocaleString("es-MX")} al año
          </div>
        )}

        {!esGratis && billing === "mensual" && (
          <p className="mt-3 text-xs text-ink-500">
            o ${plan.precioAnual.toLocaleString("es-MX")} MXN/año (ahorra ~8%)
          </p>
        )}

        {esGratis && <p className="mt-3 text-xs text-ink-500">Sin tarjeta de crédito</p>}
      </div>

      <ul className="mt-6 space-y-3 flex-1">
        {plan.features.map((f) => (
          <Feature key={f} text={f} />
        ))}
        {plan.noIncluye?.map((f) => (
          <Feature key={f} text={f} included={false} />
        ))}
      </ul>

      <div className="mt-8">
        {plan.cta.tipo === "link" ? (
          <Link to={plan.cta.to} className={ctaClasses}>
            {plan.cta.label}
            <ArrowRight size={16} />
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleCheckout}
            disabled={cargandoCheckout}
            className={ctaClasses}
          >
            {cargandoCheckout ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Redirigiendo a Stripe…
              </>
            ) : (
              <>
                {plan.cta.label}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        )}

        {errorCheckout && (
          <div className="mt-3 bg-danger-bg border border-danger-border text-danger px-3 py-2 rounded flex items-start gap-2">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span className="text-xs">{errorCheckout}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function Feature({ text, included = true }: { text: string; included?: boolean }) {
  return (
    <li className="flex items-start gap-2.5 text-sm leading-snug">
      {included ? (
        <Check size={16} className="text-success shrink-0 mt-0.5" strokeWidth={2.5} />
      ) : (
        <X size={16} className="text-ink-400 shrink-0 mt-0.5" strokeWidth={2} />
      )}
      <span className={included ? "text-ink-700" : "text-ink-500 line-through"}>{text}</span>
    </li>
  );
}

function TableCell({ value, highlight = false }: { value: React.ReactNode; highlight?: boolean }) {
  const bg = highlight ? "bg-brand-50/40" : "";
  const borderClass = "border-l border-ink-200";

  let content: React.ReactNode = value;
  if (value === true) {
    content = (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-success-bg text-success">
        <Check size={12} strokeWidth={3} />
      </span>
    );
  } else if (value === false) {
    content = <span className="text-ink-300 font-mono text-base">—</span>;
  } else if (typeof value === "string" || typeof value === "number") {
    content = (
      <span className="font-mono text-sm text-ink-800 tabular-nums">{value}</span>
    );
  }

  return (
    <td className={`px-4 py-3 text-center align-top ${borderClass} ${bg}`}>
      {content}
    </td>
  );
}

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
    <Reveal as="div" className="max-w-3xl">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-700">{eyebrow}</p>
      <h2 className="mt-3 text-2xl sm:text-3xl font-semibold text-ink-900 tracking-tight">{title}</h2>
      {description && (
        <p className="mt-3 text-lg text-ink-600 leading-relaxed">{description}</p>
      )}
    </Reveal>
  );
}

function DecisionBlock({
  icon,
  title,
  description,
  ctaLabel,
  ctaTo,
  highlight = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  ctaLabel: string;
  ctaTo: string;
  highlight?: boolean;
}) {
  return (
    <div className={`p-6 flex flex-col transition-colors ${highlight ? "bg-brand-50/50" : "bg-white hover:bg-ink-50/40"}`}>
      <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-brand-50 text-brand-700 border border-brand-100">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold text-ink-900">{title}</h3>
      <p className="mt-2 text-md text-ink-600 leading-relaxed flex-1">{description}</p>
      <Link
        to={ctaTo}
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800 group focus:outline-none focus-visible:shadow-focus rounded"
      >
        {ctaLabel}
        <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

function VerificationItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white border border-ink-200 rounded p-5 flex items-start gap-4 shadow-card transition duration-200 hover:border-brand-300 hover:shadow-card-hover hover:-translate-y-0.5">
      <span className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-lg bg-brand-50 text-brand-700 border border-brand-100">
        {icon}
      </span>
      <div>
        <h3 className="text-base font-semibold text-ink-900">{title}</h3>
        <p className="mt-1 text-md text-ink-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ─── Datos de la tabla comparativa ──────────────────────────────────

const comparativa: { feature: string; gratis: React.ReactNode; pyme: React.ReactNode; empresa: React.ReactNode }[] = [
  { feature: "Ver directorio completo", gratis: true, pyme: true, empresa: true },
  { feature: "Filtrar por categoría / estado", gratis: true, pyme: true, empresa: true },
  { feature: "Contactos desbloqueados al mes", gratis: "1", pyme: "Ilimitados", empresa: "Ilimitados" },
  { feature: "Publicar RFQs", gratis: false, pyme: "Ilimitadas", empresa: "Ilimitadas" },
  { feature: "Registrar tu empresa como proveedor", gratis: false, pyme: true, empresa: true },
  { feature: "Notificaciones email de nuevas RFQs", gratis: false, pyme: true, empresa: true },
  { feature: "Usuarios incluidos", gratis: "1", pyme: "1", empresa: "Hasta 10" },
  { feature: "Roles separados (comprador/vendedor/admin)", gratis: false, pyme: false, empresa: true },
  { feature: "Soporte", gratis: "Comunidad", pyme: "Email", empresa: "WhatsApp prioritario" },
  { feature: "Factura fiscal CFDI 4.0", gratis: false, pyme: true, empresa: true },
];
