/**
 * AceptarInvitacion.tsx
 * El invitado entra por el link del correo: /aceptar-invitacion?token=...
 *
 *   - Sin token → mensaje de error.
 *   - Sin sesión → invita a iniciar sesión (volviendo a esta URL con el token).
 *   - Con sesión → botón "Aceptar invitación" → POST /aceptar → /dashboard.
 */

import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AlertTriangle, ArrowRight, CheckCircle2, Loader2, UserPlus } from "lucide-react";
import { useAuth } from "../firebase/AuthContext";
import { aceptarInvitacionOrg } from "../services/rqmarketApi";
import { Button } from "../components/ui/Button";

export default function AceptarInvitacion() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { usuario, cargando: cargandoAuth } = useAuth();

  const token = searchParams.get("token") || "";
  const [aceptando, setAceptando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  const desde = `/aceptar-invitacion?token=${encodeURIComponent(token)}`;

  const handleAceptar = async () => {
    setAceptando(true);
    setError(null);
    try {
      await aceptarInvitacionOrg(token);
      setExito(true);
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err: any) {
      setError(err?.message || "No se pudo aceptar la invitación");
      setAceptando(false);
    }
  };

  return (
    <div className="bg-ink-50 min-h-screen py-16 px-4">
      <div className="max-w-md mx-auto bg-white border border-ink-200 rounded p-8 sm:p-10 text-center shadow-card">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-50 text-brand-700 border border-brand-100">
          {exito ? <CheckCircle2 size={26} strokeWidth={1.25} /> : <UserPlus size={26} strokeWidth={1.25} />}
        </div>

        {!token ? (
          <>
            <h1 className="mt-5 text-xl font-semibold text-ink-900">Invitación no válida</h1>
            <p className="mt-2 text-sm text-ink-600">
              El link de invitación está incompleto. Pide a tu administrador que te
              comparta el link de nuevo.
            </p>
          </>
        ) : exito ? (
          <>
            <h1 className="mt-5 text-xl font-semibold text-ink-900">¡Listo!</h1>
            <p className="mt-2 text-sm text-ink-600">
              Te uniste a la organización. Llevándote a tu dashboard…
            </p>
          </>
        ) : cargandoAuth ? (
          <p className="mt-5 text-ink-500 inline-flex items-center gap-2">
            <Loader2 size={18} className="animate-spin" /> Verificando sesión…
          </p>
        ) : !usuario ? (
          <>
            <h1 className="mt-5 text-xl font-semibold text-ink-900">Te invitaron a una organización</h1>
            <p className="mt-2 text-sm text-ink-600">
              Inicia sesión (o crea tu cuenta) con el correo al que recibiste la
              invitación para aceptarla.
            </p>
            <Link
              to="/login"
              state={{ desde }}
              className="mt-6 inline-flex items-center justify-center gap-2 h-11 px-5 rounded bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm transition-colors focus:outline-none focus-visible:shadow-focus"
            >
              Iniciar sesión
              <ArrowRight size={16} />
            </Link>
          </>
        ) : (
          <>
            <h1 className="mt-5 text-xl font-semibold text-ink-900">Aceptar invitación</h1>
            <p className="mt-2 text-sm text-ink-600">
              Estás por unirte a una organización con la cuenta{" "}
              <strong className="text-ink-900">{usuario.email}</strong>.
            </p>
            <Button className="mt-6" onClick={handleAceptar} loading={aceptando} rightIcon={!aceptando ? <ArrowRight size={16} /> : undefined}>
              {aceptando ? "Aceptando…" : "Aceptar invitación"}
            </Button>
          </>
        )}

        {error && (
          <div className="mt-4 bg-danger-bg border border-danger-border text-danger px-3 py-2 rounded flex items-start gap-2 text-left">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span className="text-xs">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
