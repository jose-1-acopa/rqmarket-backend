/**
 * RegistroProveedor.tsx
 *
 * El alta directa de proveedor quedó CERRADA: el registro ahora se realiza
 * exclusivamente desde el flujo de pago (/empresas → planes → Stripe), que crea
 * el proveedor en la colección correcta y lo deja pendiente de aprobación.
 *
 * Esta ruta solo informa brevemente y redirige a /empresas.
 */

import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Building2 } from "lucide-react";

export default function RegistroProveedor() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate("/empresas", { replace: true }), 2500);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="bg-ink-50 min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white border border-ink-200 rounded-lg shadow-card p-8 text-center">
        <span className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-brand-50 text-brand-700 border border-brand-100">
          <Building2 size={22} strokeWidth={1.5} />
        </span>
        <h1 className="mt-5 text-xl font-semibold text-ink-900 tracking-tight">
          El registro ahora se hace desde nuestros planes
        </h1>
        <p className="mt-2 text-ink-600 leading-relaxed">
          Te llevamos a la página de empresas para registrar tu negocio y aparecer
          en el directorio verificado contra el SAT.
        </p>
        <Link
          to="/empresas"
          className="mt-6 inline-flex items-center justify-center gap-2 h-11 px-5 rounded bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-medium text-sm transition-colors focus:outline-none focus-visible:shadow-focus"
        >
          Ir a registrar mi empresa
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
