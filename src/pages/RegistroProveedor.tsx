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
import {
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Loader2,
  Info,
  ArrowRight,
  Lock,
  Building2,
  MapPin,
  Mail,
} from "lucide-react";
import { useAuth } from "../firebase/AuthContext";
import {
  listarCategorias,
  validarRFC,
  crearProveedor,
  type Categoria,
} from "../services/rqmarketApi";
import { Input, Select, Textarea } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { FormSection, FormFieldFull } from "../components/ui/FormSection";
import { Reveal } from "../components/ui/Reveal";

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

  const [categorias, setCategorias] = useState<Categoria[]>([]);
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

  const [estadoSAT, setEstadoSAT] = useState<EstadoSAT>("sin_validar");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  // ── Bloqueo si no está logueado ──
  useEffect(() => {
    if (!cargandoAuth && !usuario) {
      navigate("/login", { state: { desde: "/registro-proveedor" } });
    }
  }, [usuario, cargandoAuth, navigate]);

  // ── Cargar categorías ──
  useEffect(() => {
    listarCategorias()
      .then(setCategorias)
      .catch(err => console.error("Error cargando categorías:", err));
  }, []);

  // ── Pre-llenar email desde el usuario logueado ──
  useEffect(() => {
    if (usuario?.email && !email) {
      setEmail(usuario.email);
    }
  }, [usuario]);

  // ── Validación SAT en tiempo real (con debounce) ──
  useEffect(() => {
    const rfcLimpio = rfc.trim().toUpperCase();

    if (!rfcLimpio || (rfcLimpio.length !== 12 && rfcLimpio.length !== 13)) {
      setEstadoSAT("sin_validar");
      return;
    }

    setEstadoSAT("validando");

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

  // ── Submit del formulario ──
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

  // ── Pantalla de éxito ──
  if (exito) {
    return (
      <div className="min-h-[70vh] bg-ink-50 py-16 px-4">
        <div className="max-w-xl mx-auto bg-white border border-ink-200 rounded p-8 sm:p-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success-bg border border-success-border text-success">
            <CheckCircle2 size={24} strokeWidth={2} />
          </div>
          <p className="mt-6 font-mono text-xs uppercase tracking-wider text-brand-700">
            Registro recibido
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-ink-900 tracking-tight">
            Tu solicitud está en revisión
          </h1>
          <p className="mt-3 text-ink-600 leading-relaxed">
            Hemos recibido la información de <strong className="text-ink-900">{nombreComercial}</strong>.
            Un administrador revisará tu solicitud y verificará tus datos en los próximos días hábiles.
          </p>
          <div className="mt-6 bg-ink-50 border border-ink-200 rounded p-4">
            <div className="font-mono text-[11px] uppercase tracking-wider text-ink-500">
              Notificación
            </div>
            <p className="mt-1 text-sm text-ink-700">
              Te avisaremos al correo <strong className="text-ink-900 font-mono">{email}</strong> cuando tu perfil esté aprobado y visible en el directorio.
            </p>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button onClick={() => navigate("/directorio")} rightIcon={<ArrowRight size={16} />}>
              Ver directorio
            </Button>
            <Button variant="secondary" onClick={() => navigate("/dashboard")}>
              Ir a mi dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (cargandoAuth || !usuario) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-ink-500">
        <Loader2 size={20} className="animate-spin mr-2" />
        Cargando...
      </div>
    );
  }

  // ── Form principal ──
  const esBloqueante = estadoSAT === "defraudador";

  return (
    <div className="bg-ink-50 min-h-screen">
      {/* Header institucional */}
      <header className="bg-white border-b border-ink-200">
        <Reveal as="div" className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-700">
            Registro de proveedor
          </p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-ink-900 tracking-tight">
            Únete al directorio verificado
          </h1>
          <p className="mt-2 text-ink-600 max-w-2xl">
            Tu registro será revisado por un administrador antes de publicarse. La validación contra la lista SAT 69-B ocurre en tiempo real.
          </p>
        </Reveal>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          {/* Stepper sticky */}
          <aside className="hidden lg:block">
            <nav className="sticky top-24 border border-ink-200 rounded bg-white p-2 shadow-card" aria-label="Secciones del formulario">
              <StepLink href="#datos" icon={<Building2 size={16} />} number="01" label="Datos de la empresa" />
              <StepLink href="#ubicacion" icon={<MapPin size={16} />} number="02" label="Ubicación" />
              <StepLink href="#contacto" icon={<Mail size={16} />} number="03" label="Contacto" />
              <div className="mt-3 mx-3 pt-3 border-t border-ink-200">
                <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500 mb-1.5">
                  Validación
                </div>
                <BadgeSAT estado={estadoSAT} compact />
              </div>
            </nav>
          </aside>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="bg-white border border-ink-200 rounded p-6 sm:p-8 space-y-10 shadow-card">
            <section id="datos" className="scroll-mt-24">
              <FormSection
                step="01"
                title="Datos de la empresa"
                description="Información fiscal y comercial. El RFC se valida automáticamente contra la lista SAT 69-B."
              >
                <Input
                  label="Nombre comercial"
                  name="nombreComercial"
                  type="text"
                  value={nombreComercial}
                  onChange={(e) => setNombreComercial(e.target.value)}
                  required
                  placeholder="Ej: Soldaduras del Golfo"
                />

                <Input
                  label="Razón social"
                  name="razonSocial"
                  type="text"
                  value={razonSocial}
                  onChange={(e) => setRazonSocial(e.target.value)}
                  placeholder="Ej: Soldaduras del Golfo S.A. de C.V."
                />

                <FormFieldFull>
                  <Input
                    label="RFC"
                    name="rfc"
                    type="text"
                    value={rfc}
                    onChange={(e) => setRfc(e.target.value.toUpperCase())}
                    required
                    maxLength={13}
                    placeholder="ABCD850101AB1"
                    className="font-mono tracking-wider uppercase"
                    hint="Se valida en tiempo real contra el SAT (lista 69-B)."
                  />
                  <div className="mt-3">
                    <BadgeSAT estado={estadoSAT} />
                  </div>
                </FormFieldFull>

                <Select
                  label="Categoría principal"
                  name="categoria"
                  value={categoriaSeleccionada}
                  onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                  required
                  placeholder="Selecciona..."
                  options={categorias.map(cat => ({
                    value: cat.slug,
                    label: cat.icono ? `${cat.icono} ${cat.nombre}` : cat.nombre,
                  }))}
                />

                <Input
                  label="Año de fundación"
                  name="añoFundacion"
                  type="number"
                  value={añoFundacion}
                  onChange={(e) => setAñoFundacion(e.target.value)}
                  min={1900}
                  max={new Date().getFullYear()}
                  placeholder="Ej: 2015"
                />

                <FormFieldFull>
                  <Input
                    label="Sitio web"
                    name="sitioWeb"
                    type="url"
                    value={sitioWeb}
                    onChange={(e) => setSitioWeb(e.target.value)}
                    placeholder="https://miempresa.com"
                  />
                </FormFieldFull>

                <FormFieldFull>
                  <Textarea
                    label="Descripción corta"
                    name="descripcion"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    rows={3}
                    maxLength={250}
                    placeholder="¿Qué hace tu empresa? (máximo 250 caracteres)"
                    hint={`${descripcion.length} / 250 caracteres`}
                  />
                </FormFieldFull>
              </FormSection>
            </section>

            <section id="ubicacion" className="scroll-mt-24">
              <FormSection
                step="02"
                title="Ubicación"
                description="Ciudad y estado donde opera tu empresa. Se usa para filtrar el directorio por región."
              >
                <Input
                  label="Ciudad"
                  name="ciudad"
                  type="text"
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
                  required
                  placeholder="Ej: Coatzacoalcos"
                />

                <Select
                  label="Estado"
                  name="estado"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  required
                  placeholder="Selecciona..."
                  options={ESTADOS_MEXICO.map(est => ({ value: est, label: est }))}
                />
              </FormSection>
            </section>

            <section id="contacto" className="scroll-mt-24">
              <FormSection
                step="03"
                title="Contacto"
                description="Datos de contacto. No serán visibles al público; solo compradores con plan activo podrán verlos."
              >
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="ventas@miempresa.com"
                />

                <Input
                  label="Teléfono"
                  name="telefono"
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  required
                  placeholder="921-234-5678"
                />

                <FormFieldFull>
                  <Input
                    label="WhatsApp"
                    name="whatsapp"
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="921-234-5678"
                  />
                </FormFieldFull>
              </FormSection>
            </section>

            {/* Errores */}
            {error && (
              <div className="bg-danger-bg border border-danger-border text-danger px-4 py-3 rounded flex items-start gap-2.5">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">Error en el envío</div>
                  <div className="text-sm mt-0.5">{error}</div>
                </div>
              </div>
            )}

            {/* Aviso de privacidad */}
            <div className="bg-ink-50 border border-ink-200 text-ink-700 px-4 py-3 rounded flex items-start gap-2.5">
              <Lock size={16} className="shrink-0 mt-0.5 text-ink-500" />
              <div className="text-sm">
                <strong className="text-ink-900">Privacidad:</strong> Tu teléfono, email y dirección no son visibles públicamente. Solo compradores con plan activo pueden ver esta información. Tu RFC se muestra ofuscado en el directorio.
              </div>
            </div>

            {/* Acciones */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2 border-t border-ink-200">
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                loading={enviando}
                disabled={esBloqueante}
                rightIcon={!enviando ? <ArrowRight size={16} /> : undefined}
              >
                {enviando ? "Enviando..." : "Enviar registro"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Stepper item ────────────────────────────────────────────────────

function StepLink({
  href,
  icon,
  number,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  number: string;
  label: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded text-sm text-ink-700 hover:bg-ink-50 hover:text-brand-700 transition-colors group"
    >
      <span className="font-mono text-xs text-ink-400 tabular-nums group-hover:text-brand-700">{number}</span>
      <span className="text-ink-400 group-hover:text-brand-700">{icon}</span>
      <span className="font-medium">{label}</span>
    </a>
  );
}

// ── Badge visual del estado del RFC vs SAT ──────────────────────────

function BadgeSAT({ estado, compact = false }: { estado: EstadoSAT; compact?: boolean }) {
  if (estado === "sin_validar") {
    if (!compact) return null;
    return (
      <div className="text-xs text-ink-500 px-2 py-1.5">
        Esperando RFC…
      </div>
    );
  }

  const config: Record<Exclude<EstadoSAT, "sin_validar">, {
    bg: string;
    border: string;
    text: string;
    icon: React.ReactNode;
    title: string;
    msg: string;
    severity: "info" | "success" | "warning" | "danger";
  }> = {
    validando: {
      bg: "bg-ink-50",
      border: "border-ink-200",
      text: "text-ink-600",
      icon: <Loader2 size={16} className="animate-spin" />,
      title: "Validando…",
      msg: "Consultando con SAT.",
      severity: "info",
    },
    limpio: {
      bg: "bg-success-bg",
      border: "border-success-border",
      text: "text-success",
      icon: <ShieldCheck size={16} />,
      title: "RFC limpio",
      msg: "No aparece en la lista 69-B.",
      severity: "success",
    },
    favorable: {
      bg: "bg-success-bg",
      border: "border-success-border",
      text: "text-success",
      icon: <ShieldCheck size={16} />,
      title: "Sentencia favorable",
      msg: "RFC con resolución favorable o desvirtuado.",
      severity: "success",
    },
    presunto: {
      bg: "bg-warning-bg",
      border: "border-warning-border",
      text: "text-warning",
      icon: <AlertTriangle size={16} />,
      title: "Presunto defraudador",
      msg: "El RFC aparece como presunto en SAT. Tu registro requerirá revisión manual.",
      severity: "warning",
    },
    defraudador: {
      bg: "bg-danger-bg",
      border: "border-danger-border",
      text: "text-danger",
      icon: <ShieldAlert size={18} />,
      title: "RFC bloqueado",
      msg: "Este RFC está marcado como defraudador definitivo en la lista SAT 69-B. No se puede registrar.",
      severity: "danger",
    },
    error: {
      bg: "bg-ink-50",
      border: "border-ink-200",
      text: "text-ink-600",
      icon: <Info size={16} />,
      title: "Validación pendiente",
      msg: "No se pudo validar ahora. Lo intentaremos de nuevo al enviar.",
      severity: "info",
    },
  };

  const c = config[estado as keyof typeof config];
  if (!c) return null;

  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-2 py-1.5 rounded border ${c.bg} ${c.border} ${c.text}`}>
        <span className="shrink-0">{c.icon}</span>
        <span className="text-xs font-medium leading-tight">{c.title}</span>
      </div>
    );
  }

  // Bloque grande cuando es defraudador para máxima visibilidad
  if (c.severity === "danger") {
    return (
      <div className={`${c.bg} border ${c.border} rounded p-4 flex items-start gap-3`}>
        <div className={`${c.text} shrink-0 mt-0.5`}>{c.icon}</div>
        <div>
          <div className={`font-semibold ${c.text}`}>{c.title}</div>
          <p className="mt-1 text-sm text-ink-700">{c.msg}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-start gap-2 px-3 py-2 rounded border ${c.bg} ${c.border} ${c.text}`}>
      <span className="shrink-0 mt-0.5">{c.icon}</span>
      <div>
        <div className="text-sm font-medium leading-tight">{c.title}</div>
        <div className="text-xs mt-0.5 opacity-90">{c.msg}</div>
      </div>
    </div>
  );
}
