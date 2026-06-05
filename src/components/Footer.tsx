/**
 * Footer.tsx
 *
 * Footer del sitio: marca, copyright, enlaces legales y correo de contacto.
 * Montado en el layout (App.tsx) para aparecer en todas las páginas.
 * Solo navegación — sin lógica de negocio.
 */

import { Link } from "react-router-dom";
import type { ReactNode } from "react";

const CORREO = "informacion@rqmarket.com.mx";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-ink-200">
      <div className="py-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        {/* Marca + copyright + correo */}
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-brand-700">
            RQ MARKET
          </div>
          <p className="mt-1.5 text-sm text-ink-500">
            © 2026 RQ MARKET. Todos los derechos reservados.
          </p>
          <a
            href={`mailto:${CORREO}`}
            className="mt-1 inline-flex text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline focus:outline-none focus-visible:shadow-focus rounded"
          >
            {CORREO}
          </a>
        </div>

        {/* Enlaces legales */}
        <nav
          className="flex flex-col sm:items-end gap-y-2 sm:gap-y-1.5 text-sm"
          aria-label="Enlaces legales"
        >
          <FooterLink to="/terminos">Términos y Condiciones</FooterLink>
          <FooterLink to="/privacidad">Aviso de Privacidad</FooterLink>
          <FooterLink to="/cancelacion">Política de Cancelación</FooterLink>
        </nav>
      </div>
    </footer>
  );
}

function FooterLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex py-1 text-ink-600 hover:text-brand-700 transition-colors focus:outline-none focus-visible:shadow-focus rounded"
    >
      {children}
    </Link>
  );
}
