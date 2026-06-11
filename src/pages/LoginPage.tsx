/**
 * LoginPage.tsx
 *
 * Página de login para RQ MARKET.
 * Permite entrar con:
 *   - Google (un clic)
 *   - Email + Password (con sub-tabs Login / Registro)
 *
 * Después del login exitoso, redirige a la página de origen
 * (o a /dashboard si no hay origen).
 */

import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { AlertTriangle, ShieldCheck, FileCheck2, Lock } from "lucide-react";
import { useAuth } from "../firebase/AuthContext";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

type Modo = "login" | "registro";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, loginConGoogle, loginConEmail, registrarConEmail } = useAuth();

  const desde = (location.state as { desde?: string })?.desde || "/dashboard";

  // Redirección reactiva: navegamos SOLO cuando el contexto confirma el usuario
  // (tras onAuthStateChanged → asegurarDocumentoUsuario). Esto evita la condición
  // de carrera del doble-intento de Google: la navegación ya no depende del retorno
  // del popup, sino del estado confirmado. También saca de /login a quien ya está
  // logueado (sin loops: el destino nunca es /login).
  useEffect(() => {
    if (usuario) navigate(desde, { replace: true });
  }, [usuario, desde, navigate]);

  const [modo, setModo] = useState<Modo>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setError(null);
    setCargando(true);
    try {
      await loginConGoogle();
      // La navegación la hace el useEffect cuando `usuario` queda confirmado.
    } catch (err: any) {
      console.error("Error login Google:", err);
      if (err.code !== "auth/popup-closed-by-user") {
        setError(traducirError(err.code) || err.message);
      }
    } finally {
      setCargando(false);
    }
  };

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      if (modo === "login") {
        await loginConEmail(email, password);
      } else {
        if (!nombre.trim()) {
          throw new Error("El nombre es obligatorio");
        }
        await registrarConEmail(email, password, nombre);
      }
      // La navegación la hace el useEffect cuando `usuario` queda confirmado.
    } catch (err: any) {
      console.error("Error auth email:", err);
      setError(traducirError(err.code) || err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] grid grid-cols-1 lg:grid-cols-2 bg-white">
      {/* Panel izquierdo (sólo desktop): institucional */}
      <aside className="hidden lg:flex flex-col justify-between hero-surface text-white p-12 xl:p-16">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-200">
            RQ MARKET
          </p>
          <h2 className="mt-4 text-3xl xl:text-4xl font-semibold tracking-tight leading-tight text-white">
            La capa de confianza para compras B2B industrial en México.
          </h2>
          <p className="mt-4 text-brand-100 leading-relaxed max-w-md">
            Tu cuenta te da acceso al directorio de proveedores con validación oficial contra el SAT.
          </p>
        </div>

        <ul className="space-y-5 max-w-md">
          <BenefitItem
            icon={<ShieldCheck size={18} />}
            title="Validación contra 6 listas del SAT"
            description="Cada RFC se valida automáticamente contra las 6 listas oficiales del SAT, actualizadas cada día."
          />
          <BenefitItem
            icon={<FileCheck2 size={18} />}
            title="Clasificación escalonada"
            description="Bloqueamos los incumplimientos graves y señalamos las observaciones menores. Un filtro justo y riguroso."
          />
          <BenefitItem
            icon={<Lock size={18} />}
            title="Datos protegidos"
            description="Tu información de contacto no se publica. Solo compradores con plan activo la ven."
          />
        </ul>

        <div className="pt-6 border-t border-brand-800">
          <p className="font-mono text-[11px] uppercase tracking-wider text-brand-200">
            Conexión cifrada · Firebase Authentication
          </p>
        </div>
      </aside>

      {/* Panel derecho: formulario */}
      <main className="flex items-start lg:items-center justify-center px-4 sm:px-6 py-12 lg:py-16">
        <div className="w-full max-w-md">
          {/* Banner azul colapsado en mobile */}
          <div className="lg:hidden hero-surface text-white -mx-4 sm:-mx-6 px-4 sm:px-6 py-5 mb-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand-200">
              RQ MARKET
            </p>
            <p className="mt-1 text-base font-semibold text-white">
              Acceso al directorio de proveedores verificados.
            </p>
          </div>

          <header className="mb-6">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-700">
              {modo === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-ink-900 tracking-tight">
              {modo === "login" ? "Bienvenido de vuelta" : "Crea tu cuenta en RQ MARKET"}
            </h1>
            <p className="mt-1 text-sm text-ink-600">
              {modo === "login"
                ? "Accede al directorio y a tu dashboard."
                : "Te tomará menos de un minuto."}
            </p>
          </header>

          {/* Botón Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={cargando}
            className="w-full flex items-center justify-center gap-3 h-11 px-4 border border-ink-300 rounded bg-white hover:bg-ink-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:shadow-focus"
          >
            <GoogleIcon />
            <span className="font-medium text-ink-800 text-sm">
              {modo === "login" ? "Continuar con Google" : "Registrarme con Google"}
            </span>
          </button>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-ink-200"></div>
            <span className="px-3 font-mono text-[10px] uppercase tracking-wider text-ink-500">
              o con email
            </span>
            <div className="flex-1 border-t border-ink-200"></div>
          </div>

          {/* Segmented control Login / Registro */}
          <div className="bg-ink-100 p-1 rounded mb-5 flex" role="tablist">
            <SegmentedButton
              active={modo === "login"}
              onClick={() => { setModo("login"); setError(null); }}
            >
              Iniciar sesión
            </SegmentedButton>
            <SegmentedButton
              active={modo === "registro"}
              onClick={() => { setModo("registro"); setError(null); }}
            >
              Crear cuenta
            </SegmentedButton>
          </div>

          {/* Mensaje de error visible arriba del form */}
          {error && (
            <div className="mb-4 bg-danger-bg border border-danger-border text-danger px-3 py-2.5 rounded flex items-start gap-2.5">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <div className="text-sm">{error}</div>
            </div>
          )}

          {/* Formulario Email/Password */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {modo === "registro" && (
              <Input
                label="Tu nombre"
                name="nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                autoComplete="name"
                placeholder="Juan Pérez"
              />
            )}

            <Input
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="tu@email.com"
            />

            <Input
              label="Contraseña"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={modo === "login" ? "current-password" : "new-password"}
              placeholder="Mínimo 6 caracteres"
            />

            <Button type="submit" loading={cargando} fullWidth>
              {cargando
                ? "Procesando…"
                : modo === "login"
                ? "Iniciar sesión"
                : "Crear cuenta"}
            </Button>
          </form>

          <p className="text-center text-xs text-ink-500 mt-6">
            Al continuar aceptas los{" "}
            <Link to="/terminos" className="text-brand-700 hover:underline font-medium">
              términos de servicio
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}

// ── Subcomponentes ────────────────────────────────────────────────────

function BenefitItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="shrink-0 w-9 h-9 rounded bg-brand-800/70 border border-brand-600 text-white inline-flex items-center justify-center">
        {icon}
      </span>
      <div>
        <div className="font-medium text-white">{title}</div>
        <div className="text-sm text-brand-200 mt-0.5 leading-snug">{description}</div>
      </div>
    </li>
  );
}

function SegmentedButton({
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
      className={`flex-1 h-9 rounded text-sm font-medium transition-colors focus:outline-none focus-visible:shadow-focus ${
        active
          ? "bg-white text-ink-900 shadow-sm"
          : "text-ink-600 hover:text-ink-900"
      }`}
    >
      {children}
    </button>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────

function traducirError(codigo?: string): string | null {
  if (!codigo) return null;
  const traducciones: Record<string, string> = {
    "auth/email-already-in-use": "Este correo ya está registrado. Si te registraste con Google, usa el botón de Google arriba. Si usaste contraseña, inicia sesión abajo.",
    "auth/invalid-email": "El email no tiene un formato válido.",
    "auth/user-not-found": "No existe una cuenta con ese email.",
    "auth/wrong-password": "Contraseña incorrecta.",
    "auth/invalid-credential": "Email o contraseña incorrectos.",
    "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
    "auth/network-request-failed": "Error de conexión. Verifica tu internet.",
    "auth/too-many-requests": "Demasiados intentos. Intenta más tarde.",
    "auth/popup-blocked": "El navegador bloqueó el popup. Permítelo y vuelve a intentar.",
    "auth/account-exists-with-different-credential": "Ya existe una cuenta con ese email pero con otro método. Usa el método original.",
  };
  return traducciones[codigo] || null;
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}
