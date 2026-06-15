import { Link } from "react-router-dom";
import {
  ArrowRight,
  Factory,
  FlaskConical,
  Warehouse,
  Wrench,
  FileCheck2,
  Building2,
  Award,
  Check,
  X,
} from "lucide-react";
import { Reveal } from "../components/ui/Reveal";

export default function Home() {
  return (
    <div className="bg-white">
      {/* 1. HERO INSTITUCIONAL */}
      <section className="hero-surface text-white border-b border-brand-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28">
          <div className="max-w-4xl">
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-200 mb-5">
                RQ MARKET · Infraestructura de verificación
              </p>
            </Reveal>
            <Reveal delay={70}>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.1] text-white">
                La capa de confianza para compras B2B industrial en México.
              </h1>
            </Reveal>
            <Reveal delay={140}>
              <p className="mt-6 text-lg sm:text-xl text-brand-100 max-w-2xl leading-relaxed">
                Directorio de proveedores cuyo RFC se valida automáticamente contra las 6 listas
                oficiales del SAT, con clasificación escalonada y acceso inmediato para
                departamentos de procura.
              </p>
            </Reveal>
            <Reveal delay={210}>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/directorio"
                  className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded bg-white text-brand-900 shadow-sm hover:bg-brand-50 hover:shadow-card-hover hover:-translate-y-px active:bg-brand-100 active:translate-y-0 font-medium text-sm transition duration-150 focus:outline-none focus-visible:shadow-focus"
                >
                  Acceder al directorio
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/registro-proveedor"
                  className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded border border-brand-500/60 text-white hover:border-brand-400 hover:bg-brand-800/60 font-medium text-sm transition-colors focus:outline-none focus-visible:shadow-focus"
                >
                  Registrarme como proveedor
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Stats institucionales */}
          <Reveal delay={280}>
            <dl className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-px bg-brand-800/70 border border-brand-800/70 rounded overflow-hidden">
              <HeroStat
                label="Listas oficiales del SAT"
                value="6"
                hint="EFOS/69-B, firmes, sentencias, no localizados, cancelados y exigibles"
              />
              <HeroStat
                label="RFC monitoreados"
                value="+469k"
                hint="Actualizados automáticamente cada día desde datos abiertos del SAT"
              />
              <HeroStat
                label="Directorio público"
                value="Gratis"
                hint="Explora proveedores verificados sin cuenta. Contactar y publicar requiere suscripción."
              />
            </dl>
          </Reveal>
        </div>
      </section>

      {/* 2. TRUST STRIP GENÉRICO */}
      <section className="bg-ink-50 border-b border-ink-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-500 text-center">
              Diseñado para departamentos de procura de empresas industriales mexicanas
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-px bg-ink-200 border border-ink-200 rounded overflow-hidden">
              <SectorTile icon={<Factory size={28} strokeWidth={1.25} />} label="Refinería" />
              <SectorTile icon={<FlaskConical size={28} strokeWidth={1.25} />} label="Planta química" />
              <SectorTile icon={<Warehouse size={28} strokeWidth={1.25} />} label="Almacén / Logística" />
              <SectorTile icon={<Wrench size={28} strokeWidth={1.25} />} label="Manufactura" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* 3. CÓMO FUNCIONA */}
      <section className="border-b border-ink-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
          <SectionHeader
            eyebrow="Proceso"
            title="Cómo funciona RQ MARKET"
            description="Cuatro pasos para conectar compradores con proveedores verificados. Sin intermediarios opacos."
          />
          <Reveal delay={80}>
            <ol className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-ink-200 border border-ink-200 rounded shadow-card overflow-hidden bg-white">
              <Step
                number="01"
                title="El proveedor se registra"
                description="Completa su RFC, datos fiscales y documentación. El sistema valida automáticamente el RFC contra las 6 listas oficiales del SAT."
              />
              <Step
                number="02"
                title="Clasificación del RFC"
                description="El sistema clasifica el resultado: bloquea los incumplimientos graves y señala las observaciones menores. Además, un administrador revisa que el registro sea legítimo antes de publicarlo."
              />
              <Step
                number="03"
                title="Publicación en directorio"
                description="El proveedor aparece en el directorio público con su RFC validado contra el SAT. Los compradores filtran por categoría y estado."
              />
              <Step
                number="04"
                title="Contacto directo"
                description="El comprador contacta al proveedor sin intermediarios. RQ MARKET nunca cobra comisión por la transacción."
              />
            </ol>
          </Reveal>
        </div>
      </section>

      {/* 4. VERIFICACIÓN REAL */}
      <section className="bg-ink-50 border-b border-ink-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
          <SectionHeader
            eyebrow="Por qué confiar"
            title="Verificación real, no badges decorativos"
            description="Cada RFC se valida automáticamente contra el SAT antes de que el proveedor aparezca en el directorio."
          />
          <Reveal delay={80}>
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-px bg-ink-200 border border-ink-200 rounded shadow-card overflow-hidden">
              <VerificationBlock
                icon={<FileCheck2 size={22} strokeWidth={1.5} />}
                title="Validación contra 6 listas del SAT"
                description="Cada RFC se cruza automáticamente contra las 6 listas oficiales del SAT: EFOS (69-B), firmes, sentencias, no localizados, cancelados y exigibles. Si aparece en un incumplimiento grave, el registro se bloquea al instante."
              />
              <VerificationBlock
                icon={<Building2 size={22} strokeWidth={1.5} />}
                title="Clasificación escalonada"
                description="No tratamos todo igual: bloqueamos los incumplimientos graves (EFOS, sentencias y firmes) y señalamos las observaciones menores (no localizados, cancelados, exigibles). Un filtro justo y riguroso, no un simple check de existencia."
              />
              <VerificationBlock
                icon={<Award size={22} strokeWidth={1.5} />}
                title="Actualización diaria"
                description="Las listas se actualizan automáticamente cada día desde los datos abiertos del SAT. Más de 469,000 RFC monitoreados, siempre al corriente."
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* 5. COMPARATIVA */}
      <section className="border-b border-ink-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
          <SectionHeader
            eyebrow="Comparativa"
            title="Método tradicional vs RQ MARKET"
            description="Procurar a un proveedor industrial nuevo en México implica semanas de validación manual. RQ MARKET concentra el trabajo en una capa."
          />
          <Reveal delay={80}>
            <div className="mt-10 overflow-x-auto border border-ink-200 rounded shadow-card">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-ink-50 border-b border-ink-200">
                  <tr>
                    <th className="text-left font-mono text-[11px] uppercase tracking-wider text-ink-500 px-4 py-3 w-1/3">
                      Criterio
                    </th>
                    <th className="text-left font-mono text-[11px] uppercase tracking-wider text-ink-500 px-4 py-3">
                      Método tradicional
                    </th>
                    <th className="text-left font-mono text-[11px] uppercase tracking-wider text-brand-700 px-4 py-3 border-l border-ink-200">
                      RQ MARKET
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-200">
                  {comparativas.map((row) => (
                    <tr key={row.criterio} className="hover:bg-ink-50/60 transition-colors">
                      <td className="px-4 py-3 text-ink-700 font-medium align-top">{row.criterio}</td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-start gap-2 text-ink-600">
                          <X size={16} className="text-danger shrink-0 mt-0.5" />
                          <span>{row.tradicional}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top border-l border-ink-200 bg-brand-50/40">
                        <div className="flex items-start gap-2 text-ink-800">
                          <Check size={16} className="text-success shrink-0 mt-0.5" />
                          <span>{row.rqmarket}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 6. CTA FINAL */}
      <section className="hero-surface text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24 text-center">
          <Reveal>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              ¿Listo para acelerar tu validación de proveedores?
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="mt-4 text-lg text-brand-100 max-w-2xl mx-auto leading-relaxed">
              Explora el directorio gratis. Suscríbete para contactar proveedores y publicar requisiciones. El registro de proveedores incluye validación SAT en tiempo real.
            </p>
          </Reveal>
          <Reveal delay={160}>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/directorio"
                className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded bg-white text-brand-900 shadow-sm hover:bg-brand-50 hover:shadow-card-hover hover:-translate-y-px active:bg-brand-100 active:translate-y-0 font-medium text-sm transition duration-150 focus:outline-none focus-visible:shadow-focus"
              >
                Acceder al directorio
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/registro-proveedor"
                className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded border border-brand-500/60 text-white hover:border-brand-400 hover:bg-brand-800/60 font-medium text-sm transition-colors focus:outline-none focus-visible:shadow-focus"
              >
                Registrarme como proveedor
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

// ─── Subcomponentes locales ─────────────────────────────────────────

function HeroStat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="bg-brand-900 p-6">
      <div className="font-mono text-[11px] uppercase tracking-wider text-brand-200">{label}</div>
      <div className="mt-2 font-mono text-4xl font-semibold text-white tabular-nums leading-none">{value}</div>
      <div className="mt-3 text-sm text-brand-100/90 leading-snug">{hint}</div>
    </div>
  );
}

function SectorTile({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="group bg-white px-4 py-6 flex flex-col items-center justify-center gap-3 transition-colors hover:bg-brand-50/40">
      <span className="text-brand-600 transition-transform duration-200 group-hover:-translate-y-0.5">{icon}</span>
      <span className="font-mono text-xs uppercase tracking-wider text-ink-600">{label}</span>
    </div>
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
      <p className="mt-3 text-lg text-ink-600 leading-relaxed">{description}</p>
    </Reveal>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <li className="bg-white p-6 transition-colors hover:bg-ink-50/40">
      <div className="font-mono text-sm text-brand-600 tabular-nums">{number}</div>
      <h3 className="mt-3 text-base font-semibold text-ink-900">{title}</h3>
      <p className="mt-2 text-md text-ink-600 leading-relaxed">{description}</p>
    </li>
  );
}

function VerificationBlock({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-6 transition-colors hover:bg-ink-50/40">
      <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-brand-50 text-brand-700 border border-brand-100">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold text-ink-900">{title}</h3>
      <p className="mt-2 text-md text-ink-600 leading-relaxed">{description}</p>
    </div>
  );
}

const comparativas = [
  {
    criterio: "Validación fiscal",
    tradicional: "Búsqueda manual en el portal del SAT, sin alertas automáticas.",
    rqmarket: "Validación automática contra las 6 listas oficiales del SAT; bloqueo inmediato de RFC con incumplimientos graves.",
  },
  {
    criterio: "Actualización de datos",
    tradicional: "Información que se consulta una vez y queda desactualizada con el tiempo.",
    rqmarket: "Listas del SAT actualizadas automáticamente cada día desde datos abiertos.",
  },
  {
    criterio: "Nivel de confianza",
    tradicional: "Decisión basada en intuición, recomendaciones informales o cotización más barata.",
    rqmarket: "Clasificación escalonada pública: incumplimientos graves bloqueados, observaciones menores señaladas.",
  },
  {
    criterio: "Costo para el comprador",
    tradicional: "Consultorías de validación, brokers que cobran comisión por contacto.",
    rqmarket: "Suscripción única con acceso a comprar y vender. Ver el directorio es gratis; nunca cobramos comisión por contacto.",
  },
  {
    criterio: "Tiempo de búsqueda",
    tradicional: "Semanas o meses entre licitación, validación y decisión final.",
    rqmarket: "Filtrado por categoría y estado en segundos. Contacto inmediato.",
  },
  {
    criterio: "Trazabilidad",
    tradicional: "Información fragmentada entre correos, llamadas y documentos sueltos.",
    rqmarket: "Perfil único con historial de verificación, categoría y datos fiscales.",
  },
];
