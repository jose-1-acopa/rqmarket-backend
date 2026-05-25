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

export default function Home() {
  return (
    <div className="bg-white">
      {/* 1. HERO INSTITUCIONAL */}
      <section className="bg-brand-900 text-white border-b border-brand-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-4xl">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-200/80 mb-5">
              RQ MARKET · Infraestructura de verificación
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.1]">
              La capa de confianza para compras B2B industrial en México.
            </h1>
            <p className="mt-6 text-lg text-brand-100/90 max-w-2xl leading-relaxed">
              Directorio de proveedores con validación oficial contra el SAT, sistema de tiers verificables y
              acceso inmediato para departamentos de procura.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to="/directorio"
                className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded bg-white text-brand-900 hover:bg-brand-50 active:bg-brand-100 font-medium text-sm transition-colors focus:outline-none focus-visible:shadow-focus"
              >
                Acceder al directorio
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/registro-proveedor"
                className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded border border-brand-700 hover:border-brand-500 hover:bg-brand-800/60 text-white font-medium text-sm transition-colors focus:outline-none focus-visible:shadow-focus"
              >
                Registrarme como proveedor
              </Link>
            </div>
          </div>

          {/* Stats institucionales */}
          <dl className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-px bg-brand-800 border border-brand-800 rounded overflow-hidden">
            <HeroStat
              label="Validación oficial"
              value="69-B"
              hint="Lista SAT de presuntos contribuyentes incumplidos"
            />
            <HeroStat
              label="Sistema de tiers"
              value="3"
              hint="Bronze · Silver · Gold según verificación documental"
            />
            <HeroStat
              label="Acceso para compradores"
              value="Gratis"
              hint="Sin suscripción, sin friction, sin comisión por contacto"
            />
          </dl>
        </div>
      </section>

      {/* 2. TRUST STRIP GENÉRICO */}
      <section className="bg-ink-50 border-b border-ink-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-500 text-center">
            Diseñado para departamentos de procura de empresas industriales mexicanas
          </p>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-px bg-ink-200 border border-ink-200 rounded overflow-hidden">
            <SectorTile icon={<Factory size={28} strokeWidth={1.25} />} label="Refinería" />
            <SectorTile icon={<FlaskConical size={28} strokeWidth={1.25} />} label="Planta química" />
            <SectorTile icon={<Warehouse size={28} strokeWidth={1.25} />} label="Almacén / Logística" />
            <SectorTile icon={<Wrench size={28} strokeWidth={1.25} />} label="Manufactura" />
          </div>
        </div>
      </section>

      {/* 3. CÓMO FUNCIONA */}
      <section className="border-b border-ink-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <SectionHeader
            eyebrow="Proceso"
            title="Cómo funciona RQ MARKET"
            description="Cuatro pasos para conectar compradores con proveedores verificados. Sin intermediarios opacos."
          />
          <ol className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-ink-200 border border-ink-200 rounded">
            <Step
              number="01"
              title="El proveedor se registra"
              description="Completa su RFC, datos fiscales y documentación. El sistema valida automáticamente contra la lista SAT 69-B."
            />
            <Step
              number="02"
              title="Verificación documental"
              description="Nuestro equipo revisa CSF, comprobante de domicilio y capacidades. Asignamos un tier (Bronze, Silver o Gold)."
            />
            <Step
              number="03"
              title="Publicación en directorio"
              description="El proveedor aparece con su tier visible. Los compradores filtran por categoría, estado y nivel de verificación."
            />
            <Step
              number="04"
              title="Contacto directo"
              description="El comprador contacta al proveedor sin intermediarios. RQ MARKET nunca cobra comisión por la transacción."
            />
          </ol>
        </div>
      </section>

      {/* 4. VERIFICACIÓN REAL */}
      <section className="bg-ink-50 border-b border-ink-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <SectionHeader
            eyebrow="Por qué confiar"
            title="Verificación real, no badges decorativos"
            description="Cada proveedor en el directorio pasa por tres capas de validación antes de aparecer."
          />
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-px bg-ink-200 border border-ink-200 rounded overflow-hidden">
            <VerificationBlock
              icon={<FileCheck2 size={22} strokeWidth={1.5} />}
              title="Lista SAT 69-B"
              description="Validación automática del RFC contra la lista oficial de presuntos contribuyentes incumplidos publicada por el SAT. Si el RFC aparece como defraudador, el registro se bloquea de inmediato."
            />
            <VerificationBlock
              icon={<Building2 size={22} strokeWidth={1.5} />}
              title="Constancia de Situación Fiscal"
              description="Revisión manual de la CSF vigente y del domicilio fiscal declarado. Validamos que la actividad económica registrada en el SAT corresponda con la categoría que el proveedor declara servir."
            />
            <VerificationBlock
              icon={<Award size={22} strokeWidth={1.5} />}
              title="Sistema de tiers"
              description="Tres niveles públicos según profundidad de la verificación: Bronze (datos básicos), Silver (capacidades y referencias), Gold (auditoría operativa). El tier es visible en cada perfil."
            />
          </div>
        </div>
      </section>

      {/* 5. COMPARATIVA */}
      <section className="border-b border-ink-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <SectionHeader
            eyebrow="Comparativa"
            title="Método tradicional vs RQ MARKET"
            description="Procurar a un proveedor industrial nuevo en México implica semanas de validación manual. RQ MARKET concentra el trabajo en una capa."
          />
          <div className="mt-10 overflow-hidden border border-ink-200 rounded">
            <table className="w-full text-sm">
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
                  <tr key={row.criterio} className="hover:bg-ink-50/50">
                    <td className="px-4 py-3 text-ink-700 font-medium align-top">{row.criterio}</td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-start gap-2 text-ink-600">
                        <X size={16} className="text-danger shrink-0 mt-0.5" />
                        <span>{row.tradicional}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top border-l border-ink-200 bg-brand-50/30">
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
        </div>
      </section>

      {/* 6. CTA FINAL */}
      <section className="bg-brand-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            ¿Listo para acelerar tu validación de proveedores?
          </h2>
          <p className="mt-3 text-brand-100/90 max-w-2xl mx-auto">
            El directorio es público y gratuito para compradores. El registro de proveedores incluye validación SAT en tiempo real.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/directorio"
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded bg-white text-brand-900 hover:bg-brand-50 active:bg-brand-100 font-medium text-sm transition-colors focus:outline-none focus-visible:shadow-focus"
            >
              Acceder al directorio
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/registro-proveedor"
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded border border-brand-700 hover:border-brand-500 hover:bg-brand-800/60 text-white font-medium text-sm transition-colors focus:outline-none focus-visible:shadow-focus"
            >
              Registrarme como proveedor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Subcomponentes locales ─────────────────────────────────────────

function HeroStat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="bg-brand-900 p-6">
      <div className="font-mono text-[11px] uppercase tracking-wider text-brand-200/80">{label}</div>
      <div className="mt-2 font-mono text-4xl font-semibold text-white tabular-nums leading-none">{value}</div>
      <div className="mt-3 text-sm text-brand-100/80 leading-snug">{hint}</div>
    </div>
  );
}

function SectorTile({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="bg-white px-4 py-6 flex flex-col items-center justify-center gap-3 text-ink-500">
      {icon}
      <span className="font-mono text-xs uppercase tracking-wider">{label}</span>
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
    <div className="max-w-3xl">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-700">{eyebrow}</p>
      <h2 className="mt-3 text-2xl sm:text-3xl font-semibold text-ink-900 tracking-tight">{title}</h2>
      <p className="mt-3 text-lg text-ink-600 leading-relaxed">{description}</p>
    </div>
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
    <li className="bg-white p-6">
      <div className="font-mono text-xs text-brand-700 tabular-nums">{number}</div>
      <h3 className="mt-3 text-base font-semibold text-ink-900">{title}</h3>
      <p className="mt-2 text-sm text-ink-600 leading-relaxed">{description}</p>
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
    <div className="bg-white p-6">
      <div className="inline-flex items-center justify-center w-10 h-10 rounded bg-brand-50 text-brand-700 border border-brand-100">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold text-ink-900">{title}</h3>
      <p className="mt-2 text-sm text-ink-600 leading-relaxed">{description}</p>
    </div>
  );
}

const comparativas = [
  {
    criterio: "Validación fiscal",
    tradicional: "Búsqueda manual en el portal del SAT, sin alertas automáticas.",
    rqmarket: "Validación en tiempo real contra la lista 69-B; bloqueo automático de RFC defraudadores.",
  },
  {
    criterio: "Verificación documental",
    tradicional: "Recolección de CSF, constancias y referencias por correo, días o semanas.",
    rqmarket: "Documentación centralizada y revisada antes de publicación en el directorio.",
  },
  {
    criterio: "Nivel de confianza",
    tradicional: "Decisión basada en intuición, recomendaciones informales o cotización más barata.",
    rqmarket: "Tier público y verificable (Bronze · Silver · Gold) según profundidad de validación.",
  },
  {
    criterio: "Costo para el comprador",
    tradicional: "Consultorías de validación, brokers que cobran comisión por contacto.",
    rqmarket: "Acceso gratuito al directorio. Contacto directo proveedor-comprador sin comisión.",
  },
  {
    criterio: "Tiempo de búsqueda",
    tradicional: "Semanas o meses entre licitación, validación y decisión final.",
    rqmarket: "Filtrado por categoría, estado y tier en segundos. Contacto inmediato.",
  },
  {
    criterio: "Trazabilidad",
    tradicional: "Información fragmentada entre correos, llamadas y documentos sueltos.",
    rqmarket: "Perfil único con historial de verificación, categoría y datos fiscales.",
  },
];
