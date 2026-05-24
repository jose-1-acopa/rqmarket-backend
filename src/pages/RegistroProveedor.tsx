/**
 * RegistroProveedor.tsx
 *
 * Formulario público para que cualquier usuario logueado registre su empresa
 * como proveedor en el directorio.
 *
 * Flow:
 *   1. Usuario debe estar logueado (si no, redirige a /login)
 *   2. Llena el formulario
 *   3. Mientras escribe el RFC, se valida contra SAT en tiempo real
 *   4. Al enviar, se crea el proveedor en estado "pendiente"
 *   5. Muestra pantalla de éxito y dice que un admin lo revisará
 */

import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../firebase/AuthContext";
import {
  listarCategorias,
  validarRFC,
  crearProveedor,
  type Categoria,
} from "../services/rqmarketApi";

const ESTADOS_MEXICO = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche",
  "Chiapas", "Chihuahua", "Ciudad de México", "Coahuila", "Colima",
  "Durango", "Estado de México", "Guanajuato", "Guerrero", "Hidalgo",
  "Jalisco", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca",
  "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa",
  "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán",
  "Zacatecas",
];

type EstadoSAT = "sin_validar" | "validando" | "limpio" | "presunto" | "defraudador" | "favorable" | "error";

export default function RegistroProveedor() {
  const navigate = useNavigate();
  const { usuario, cargando: cargandoAuth } = useAuth();

  // Categorías
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  // Datos del formulario
  const [nombreComercial, setNombreComercial] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [rfc, setRfc] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [estado, setEstado] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [sitioWeb, setSitioWeb] = useState("");
  const [añoFundacion, setAñoFundacion] = useState("");
  const [descripcion, setDescripcion] = useState("");

  // Validación SAT del RFC
  const [estadoSAT, setEstadoSAT] = useState<EstadoSAT>("sin_validar");

  // Submit
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  // ── Bloqueo si no está logueado ──────────────────────────────────

  useEffect(() => {
    if (!cargandoAuth && !usuario) {
      navigate("/login", { state: { desde: "/registro-proveedor" } });
    }
  }, [usuario, cargandoAuth, navigate]);

  // ── Cargar categorías ────────────────────────────────────────────

  useEffect(() => {
    listarCategorias()
      .then(setCategorias)
      .catch(err => console.error("Error cargando categorías:", err));
  }, []);

  // ── Pre-llenar email desde el usuario logueado ──────────────────

  useEffect(() => {
    if (usuario?.email && !email) {
      setEmail(usuario.email);
    }
  }, [usuario]);

  // ── Validación SAT en tiempo real (con debounce) ────────────────

  useEffect(() => {
    const rfcLimpio = rfc.trim().toUpperCase();

    if (!rfcLimpio || (rfcLimpio.length !== 12 && rfcLimpio.length !== 13)) {
      setEstadoSAT("sin_validar");
      return;
    }

    setEstadoSAT("validando");

    // Debounce: esperar 600ms después de que pare de escribir
    const timeoutId = setTimeout(async () => {
      try {
        const res = await validarRFC(rfcLimpio);
        if (res.estado === "defraudador_definitivo") {
          setEstadoSAT("defraudador");
        } else if (res.estado === "presunto_defraudador") {
          setEstadoSAT("presunto");
        } else if (res.estado === "sentencia_favorable" || res.estado === "desvirtuado") {
          setEstadoSAT("favorable");
        } else {
          setEstadoSAT("limpio");
        }
      } catch (err) {
        console.error("Error validando RFC:", err);
        setEstadoSAT("error");
      }
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [rfc]);

  // ── Submit del formulario ────────────────────────────────────────

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (estadoSAT === "defraudador") {
      setError("No se puede registrar este RFC porque aparece como defraudador definitivo en la lista 69-B del SAT.");
      return;
    }

    if (!categoriaSeleccionada) {
      setError("Debes seleccionar una categoría.");
      return;
    }

    setEnviando(true);
    try {
      await crearProveedor({
        nombre_comercial: nombreComercial.trim(),
        razon_social: razonSocial.trim() || undefined,
        rfc: rfc.trim().toUpperCase(),
        categorias: [categoriaSeleccionada],
        ciudad: ciudad.trim(),
        estado,
        telefono: telefono.trim() || undefined,
        email: email.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        sitio_web: sitioWeb.trim() || undefined,
        año_fundacion: añoFundacion ? parseInt(añoFundacion, 10) : undefined,
        descripcion_corta: descripcion.trim() || undefined,
      });
      setExito(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setError(err.message || "Error al registrar el proveedor");
    } finally {
      setEnviando(false);
    }
  };

  // ── Pantalla de éxito ────────────────────────────────────────────

  if (exito) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          ¡Registro recibido!
        </h1>
        <p className="text-gray-600 mb-6 text-lg">
          Hemos recibido la información de <strong>{nombreComercial}</strong>.
          Un administrador revisará tu solicitud y verificará tus datos en los próximos días.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          Te notificaremos al correo <strong>{email}</strong> cuando tu perfil esté aprobado y visible en el directorio.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => navigate("/directorio")}
            className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700"
          >
            Ver directorio
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="border border-gray-300 text-gray-700 px-6 py-2 rounded font-medium hover:bg-gray-50"
          >
            Ir a mi dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Form principal ───────────────────────────────────────────────

  if (cargandoAuth || !usuario) {
    return <div className="text-center py-12 text-gray-500">Cargando...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Registrar mi empresa como proveedor
        </h1>
        <p className="text-gray-600">
          Únete al directorio de proveedores verificados de RQ MARKET.
          Tu registro será revisado por un administrador antes de hacerse público.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sección 1: Datos de la empresa */}
        <section className="bg-white border border-gray-200 rounded-lg p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Datos de la empresa</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre comercial *
              </label>
              <input
                type="text"
                value={nombreComercial}
                onChange={(e) => setNombreComercial(e.target.value)}
                required
                placeholder="Ej: Soldaduras del Golfo"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Razón social
              </label>
              <input
                type="text"
                value={razonSocial}
                onChange={(e) => setRazonSocial(e.target.value)}
                placeholder="Ej: Soldaduras del Golfo S.A. de C.V."
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RFC * <span className="text-xs text-gray-500">(se valida con SAT)</span>
              </label>
              <input
                type="text"
                value={rfc}
                onChange={(e) => setRfc(e.target.value.toUpperCase())}
                required
                maxLength={13}
                placeholder="ABCD850101AB1"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <BadgeSAT estado={estadoSAT} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría principal *
              </label>
              <select
                value={categoriaSeleccionada}
                onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona...</option>
                {categorias.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.icono} {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Año de fundación
              </label>
              <input
                type="number"
                value={añoFundacion}
                onChange={(e) => setAñoFundacion(e.target.value)}
                min={1900}
                max={new Date().getFullYear()}
                placeholder="Ej: 2015"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sitio web
              </label>
              <input
                type="url"
                value={sitioWeb}
                onChange={(e) => setSitioWeb(e.target.value)}
                placeholder="https://miempresa.com"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción corta
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              maxLength={250}
              placeholder="¿Qué hace tu empresa? (máximo 250 caracteres)"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="text-xs text-gray-500 mt-1">
              {descripcion.length} / 250
            </div>
          </div>
        </section>

        {/* Sección 2: Ubicación */}
        <section className="bg-white border border-gray-200 rounded-lg p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Ubicación</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ciudad *
              </label>
              <input
                type="text"
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                required
                placeholder="Ej: Coatzacoalcos"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado *
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona...</option>
                {ESTADOS_MEXICO.map(est => (
                  <option key={est} value={est}>{est}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Sección 3: Contacto */}
        <section className="bg-white border border-gray-200 rounded-lg p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Contacto</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="ventas@miempresa.com"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono *
              </label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                required
                placeholder="921-234-5678"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WhatsApp
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="921-234-5678"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        {/* Errores */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Aviso de privacidad */}
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded text-sm">
          <strong>📋 Privacidad:</strong> Tu teléfono, email y dirección no son
          visibles públicamente. Solo compradores con plan activo pueden ver
          esta información. Tu RFC se muestra ofuscado en el directorio.
        </div>

        {/* Botón de envío */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={enviando || estadoSAT === "defraudador"}
            className="bg-blue-600 text-white px-8 py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {enviando ? "Enviando..." : "Enviar registro"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Badge visual del estado del RFC vs SAT ──────────────────────────

function BadgeSAT({ estado }: { estado: EstadoSAT }) {
  if (estado === "sin_validar") return null;

  const config = {
    validando: { bg: "bg-gray-100", text: "text-gray-600", icon: "⏳", msg: "Validando con SAT..." },
    limpio: { bg: "bg-green-100", text: "text-green-700", icon: "✅", msg: "RFC limpio - no aparece en lista 69-B" },
    favorable: { bg: "bg-green-100", text: "text-green-700", icon: "✅", msg: "RFC con sentencia favorable o desvirtuado" },
    presunto: { bg: "bg-orange-100", text: "text-orange-700", icon: "⚠️", msg: "RFC aparece como presunto defraudador en SAT" },
    defraudador: { bg: "bg-red-100", text: "text-red-800", icon: "🚫", msg: "RFC marcado como defraudador definitivo en SAT - registro bloqueado" },
    error: { bg: "bg-gray-100", text: "text-gray-600", icon: "ℹ️", msg: "No se pudo validar (intentaremos al enviar)" },
  } as const;

  const c = config[estado as keyof typeof config];
  if (!c) return null;

  return (
    <div className={`${c.bg} ${c.text} text-xs px-2 py-1 rounded mt-1 inline-flex items-center gap-1`}>
      <span>{c.icon}</span>
      <span>{c.msg}</span>
    </div>
  );
}
