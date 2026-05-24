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

import { useState, type FormEvent } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../firebase/AuthContext";

type Modo = "login" | "registro";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginConGoogle, loginConEmail, registrarConEmail } = useAuth();

  // De dónde venía el usuario antes de ser redirigido al login
  const desde = (location.state as { desde?: string })?.desde || "/dashboard";

  const [modo, setModo] = useState<Modo>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Manejadores ────────────────────────────────────────────────

  const handleGoogleLogin = async () => {
    setError(null);
    setCargando(true);
    try {
      await loginConGoogle();
      navigate(desde, { replace: true });
    } catch (err: any) {
      console.error("Error login Google:", err);
      // Si el usuario cierra el popup, no mostramos error
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
      navigate(desde, { replace: true });
    } catch (err: any) {
      console.error("Error auth email:", err);
      setError(traducirError(err.code) || err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {modo === "login" ? "Iniciar sesión" : "Crear cuenta"}
        </h1>
        <p className="text-sm text-gray-600">
          {modo === "login"
            ? "Accede al directorio de proveedores verificados"
            : "Únete a RQ MARKET"}
        </p>
      </div>

      {/* Botón Google */}
      <button
        onClick={handleGoogleLogin}
        disabled={cargando}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <GoogleIcon />
        <span className="font-medium text-gray-700">
          {modo === "login" ? "Entrar con Google" : "Registrarme con Google"}
        </span>
      </button>

      {/* Divider */}
      <div className="flex items-center my-6">
        <div className="flex-1 border-t border-gray-200"></div>
        <span className="px-3 text-xs text-gray-500 uppercase">o</span>
        <div className="flex-1 border-t border-gray-200"></div>
      </div>

      {/* Tabs Login / Registro */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => { setModo("login"); setError(null); }}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            modo === "login"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Iniciar sesión
        </button>
        <button
          onClick={() => { setModo("registro"); setError(null); }}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            modo === "registro"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Crear cuenta
        </button>
      </div>

      {/* Formulario Email/Password */}
      <form onSubmit={handleEmailSubmit} className="space-y-3">
        {modo === "registro" && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Tu nombre
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              autoComplete="name"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Juan Pérez"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={modo === "login" ? "current-password" : "new-password"}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={cargando}
          className="w-full bg-blue-600 text-white py-2.5 rounded font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cargando
            ? "Procesando..."
            : modo === "login"
            ? "Iniciar sesión"
            : "Crear cuenta"}
        </button>
      </form>

      {/* Footer link */}
      <p className="text-center text-xs text-gray-500 mt-6">
        Al continuar aceptas los{" "}
        <Link to="/terminos" className="text-blue-600 hover:underline">
          términos de servicio
        </Link>
        .
      </p>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────

/**
 * Traduce códigos de error de Firebase Auth a mensajes en español.
 */
function traducirError(codigo?: string): string | null {
  if (!codigo) return null;
  const traducciones: Record<string, string> = {
    "auth/email-already-in-use": "Ya existe una cuenta con ese email. Intenta iniciar sesión.",
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

// ── Ícono de Google ─────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
