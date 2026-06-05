/**
 * LegalDoc.tsx
 *
 * Wrapper presentacional compartido para las páginas legales estáticas
 * (Términos, Privacidad, Cancelación). SOLO contenido y maquetación — sin
 * lógica de negocio.
 *
 * Uso:
 *   <LegalDoc titulo="Términos y Condiciones de Uso" actualizado="5 de junio de 2026">
 *     <LegalSection numero={1} titulo="Identificación del proveedor">
 *       <LegalP>…</LegalP>
 *     </LegalSection>
 *   </LegalDoc>
 */

import type { ReactNode } from "react";
import { Reveal } from "./ui/Reveal";

interface LegalDocProps {
  titulo: string;
  actualizado: string;
  children: ReactNode;
}

export function LegalDoc({ titulo, actualizado, children }: LegalDocProps) {
  return (
    <div className="bg-ink-50 min-h-screen">
      {/* Encabezado del documento */}
      <header className="bg-white border-b border-ink-200">
        <Reveal as="div" className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-700">
            Documento legal
          </p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-ink-900 tracking-tight">
            {titulo}
          </h1>
          <p className="mt-3 text-sm text-ink-500">
            Última actualización: {actualizado}
          </p>
        </Reveal>
      </header>

      {/* Cuerpo del documento */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        {children}
      </article>
    </div>
  );
}

// ─── Sub-componentes de prosa (consistencia tipográfica) ──────────────

interface LegalSectionProps {
  numero: number;
  titulo: string;
  children: ReactNode;
}

/** Sección numerada con <h2>. Espaciado vertical generoso entre secciones. */
export function LegalSection({ numero, titulo, children }: LegalSectionProps) {
  return (
    <section className="mt-10 first:mt-0 scroll-mt-24">
      <h2 className="text-lg sm:text-xl font-semibold text-ink-900 tracking-tight">
        <span className="font-mono text-brand-700 tabular-nums">{numero}.</span>{" "}
        {titulo}
      </h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

/** Párrafo de cuerpo a 16px, ancho de lectura cómodo. */
export function LegalP({ children }: { children: ReactNode }) {
  return <p className="text-lg text-ink-700 leading-relaxed">{children}</p>;
}

/** Sub-título dentro de una sección (para bloques etiquetados). */
export function LegalSubtitle({ children }: { children: ReactNode }) {
  return (
    <p className="text-base font-semibold text-ink-900 leading-relaxed">
      {children}
    </p>
  );
}

/** Lista con viñetas, 16px. */
export function LegalList({ children }: { children: ReactNode }) {
  return (
    <ul className="space-y-2 list-disc pl-5 marker:text-ink-400 text-lg text-ink-700 leading-relaxed">
      {children}
    </ul>
  );
}

/** Enlace de correo / externo con estilo de acento. */
export function LegalMail({ correo }: { correo: string }) {
  return (
    <a
      href={`mailto:${correo}`}
      className="font-medium text-brand-700 hover:text-brand-800 hover:underline focus:outline-none focus-visible:shadow-focus rounded"
    >
      {correo}
    </a>
  );
}
