/**
 * RegistroEmpresa.tsx
 * Form auth-required del programa "Primeras 100 Empresas".
 *
 * Flujo al montar:
 *   1. Auth guard (redirige a /login con state.desde)
 *   2. GET /cupos: si todos agotados → estado "agotados" con CTA a /precios
 *   3. POST /reservar-cupo (idempotente): obtiene tipo + cupo_numero + expira_en
 *   4. Inicia timer countdown 15 min (recalcula desde expira_en cada tick)
 *   5. Carga categorías para el multi-select
 *
 * Form (4 secciones):
 *   - Datos fiscales (RFC con live-validation escalonada + razon_social)
 *   - Contacto (email + telefono + responsable)
 *   - Perfil (descripcion + categorías chips + estado MX + ciudad + sitio_web)
 *   - Términos (2 checkboxes)
 *
 * Submit:
 *   POST /registrar → POST /checkout-temprana → window.location = url
 */

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Info,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useAuth } from "../firebase/AuthContext";
import {
  listarCategorias,
  obtenerCupos,
  reservarCupo,
  validarRfcEmpresa,
  registrarEmpresa,
  checkoutTemprana,
  type Categoria,
  type EstadoCupos,
  type ReservaCupo,
  type ValidacionRfcEmpresa,
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

const CATEGORIAS_MAX = 5;
const DESCRIPCION_MAX = 200;

type EstadoRfc = "idle" | "validando" | "ok" | "advertencia" | "bloqueado" | "error";

// ────────────────────────────────────────────────────────────────────

export default function RegistroEmpresa() {
  const navigate = useNavigate();
  const { usuario, cargando: cargandoAuth } = useAuth();

  // ── Carga inicial: cupos + reserva ──
  const [cupos, setCupos] = useState<EstadoCupos | null>(null);
  const [reserva, setReserva] = useState<ReservaCupo | null>(null);
  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [errorInicial, setErrorInicial] = useState<string | null>(null);
  const [yaRegistrado, setYaRegistrado] = useState(false);
  // modoRegular: cupos agotados → registro a tarifa regular ($699), sin reserva ni timer.
  const [modoRegular, setModoRegular] = useState(false);

  // ── Catálogo de categorías ──
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  // ── Form fields ──
  const [rfc, setRfc] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [nombreComercial, setNombreComercial] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [responsable, setResponsable] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<string[]>([]);
  const [estadoMX, setEstadoMX] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [sitioWeb, setSitioWeb] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [aceptaEmails, setAceptaEmails] = useState(false);

  // ── RFC live validation ──
  const [rfcEstado, setRfcEstado] = useState<EstadoRfc>("idle");
  const [rfcDetalle, setRfcDetalle] = useState<ValidacionRfcEmpresa | null>(null);

  // ── Timer ──
  const [msRestantes, setMsRestantes] = useState<number>(0);
  const yaExpiroRef = useRef(false);

  // ── Submit ──
  const [enviando, setEnviando] = useState(false);
  const [errorSubmit, setErrorSubmit] = useState<string | null>(null);

  // ─── Auth guard ──────────────────────────────────────────────────
  useEffect(() => {
    if (!cargandoAuth && !usuario) {
      navigate("/login", { state: { desde: "/registro-empresa" } });
    }
  }, [usuario, cargandoAuth, navigate]);

  // ─── Cargar cupos + reservar al montar ───────────────────────────
  useEffect(() => {
    if (cargandoAuth || !usuario) return;
    let cancelado = false;

    (async () => {
      try {
        setCargandoInicial(true);
        setErrorInicial(null);

        const estadoCupos = await obtenerCupos();
        if (cancelado) return;
        setCupos(estadoCupos);

        const totalDisp =
          (estadoCupos.iniciales_disponibles || 0) +
          (estadoCupos.aliadas_disponibles || 0);
        if (totalDisp === 0) {
          // Sin cupo: el form se llena igual, a tarifa regular. No se reserva.
          setModoRegular(true);
          setCargandoInicial(false);
          return;
        }

        const r = await reservarCupo();
        if (cancelado) return;
        setReserva(r);
        setCargandoInicial(false);
      } catch (err: any) {
        if (cancelado) return;
        const msg = err?.message || "No se pudo cargar el estado de cupos";
        if (msg.includes("Cupos agotados") || msg.toLowerCase().includes("agotados")) {
          // Race: el último cupo se llenó entre /cupos y /reservar → modo regular.
          setModoRegular(true);
        } else if (msg.toLowerCase().includes("ya tienes") || msg.toLowerCase().includes("ya registrada")) {
          setYaRegistrado(true);
        } else {
          setErrorInicial(msg);
        }
        setCargandoInicial(false);
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [usuario, cargandoAuth]);

  // ─── Cargar categorías ───────────────────────────────────────────
  useEffect(() => {
    listarCategorias()
      .then(setCategorias)
      .catch((err) => console.warn("No se pudieron cargar categorías:", err));
  }, []);

  // ─── Auto-prellenar email del usuario ────────────────────────────
  useEffect(() => {
    if (usuario?.email && !email) {
      setEmail(usuario.email);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario]);

  // ─── RFC live validation con debounce 800ms ──────────────────────
  useEffect(() => {
    const limpio = rfc.trim().toUpperCase();
    if (limpio.length < 12) {
      setRfcEstado("idle");
      setRfcDetalle(null);
      return;
    }
    if (limpio.length > 13) {
      setRfcEstado("idle");
      setRfcDetalle(null);
      return;
    }

    setRfcEstado("validando");
    const timeoutId = setTimeout(async () => {
      const res = await validarRfcEmpresa(limpio);
      setRfcDetalle(res);
      if (res.persona_tipo === "ERROR") setRfcEstado("error");
      else if (!res.valido) setRfcEstado("bloqueado");
      else if (res.con_advertencia) setRfcEstado("advertencia");
      else setRfcEstado("ok");
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [rfc]);

  // ─── Timer countdown ─────────────────────────────────────────────
  useEffect(() => {
    if (!reserva) {
      setMsRestantes(0);
      return;
    }
    yaExpiroRef.current = false;
    const expiraMs = new Date(reserva.expira_en).getTime();

    const tick = () => {
      const restante = Math.max(0, expiraMs - Date.now());
      setMsRestantes(restante);
      if (restante === 0 && !yaExpiroRef.current) {
        yaExpiroRef.current = true;
        // Redirect a /empresas con flag para banner
        navigate("/empresas", { state: { expirada: true } });
      }
    };

    tick(); // tick inmediato (no esperar 1s)
    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [reserva, navigate]);

  // ─── Multi-select de categorías ──────────────────────────────────
  const toggleCategoria = (slug: string) => {
    setCategoriasSeleccionadas((actuales) => {
      if (actuales.includes(slug)) {
        return actuales.filter((s) => s !== slug);
      }
      if (actuales.length >= CATEGORIAS_MAX) {
        return actuales; // cap: no-op
      }
      return [...actuales, slug];
    });
  };

  // ─── Validación del form ─────────────────────────────────────────
  const formValido = useMemo(() => {
    if (rfcEstado === "bloqueado" || rfcEstado === "validando") return false;
    if (rfcEstado !== "ok" && rfcEstado !== "advertencia") return false;
    if (!razonSocial.trim()) return false;
    if (!nombreComercial.trim()) return false;
    if (!email.trim()) return false;
    if (!telefono.trim()) return false;
    if (!responsable.trim()) return false;
    if (!descripcion.trim()) return false;
    if (descripcion.length > DESCRIPCION_MAX) return false;
    if (categoriasSeleccionadas.length < 1) return false;
    if (!estadoMX) return false;
    if (!ciudad.trim()) return false;
    if (sitioWeb.trim()) {
      try {
        const u = new URL(sitioWeb.trim());
        if (!["http:", "https:"].includes(u.protocol)) return false;
      } catch {
        return false;
      }
    }
    if (!aceptaTerminos || !aceptaEmails) return false;
    return true;
  }, [
    rfcEstado,
    razonSocial,
    nombreComercial,
    email,
    telefono,
    responsable,
    descripcion,
    categoriasSeleccionadas,
    estadoMX,
    ciudad,
    sitioWeb,
    aceptaTerminos,
    aceptaEmails,
  ]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorSubmit(null);
    if (!formValido) return;

    setEnviando(true);
    try {
      await registrarEmpresa({
        rfc: rfc.trim().toUpperCase(),
        razon_social: razonSocial.trim(),
        nombre_comercial: nombreComercial.trim(),
        email: email.trim(),
        telefono: telefono.trim(),
        responsable: responsable.trim(),
        descripcion: descripcion.trim(),
        categorias: categoriasSeleccionadas,
        estado: estadoMX,
        ciudad: ciudad.trim(),
        sitio_web: sitioWeb.trim() || undefined,
        acepta_terminos: true,
        acepta_emails: true,
      });

      const successUrl = `${window.location.origin}/dashboard?pago=ok`;
      const cancelUrl = `${window.location.origin}/empresas`;
      const checkout = await checkoutTemprana({ successUrl, cancelUrl });

      // Redirige a Stripe — la página se reemplaza
      window.location.href = checkout.url;
    } catch (err: any) {
      setErrorSubmit(err?.message || "No se pudo completar el registro");
      setEnviando(false);
    }
  };

  // ─── Renders por estado ──────────────────────────────────────────

  if (cargandoAuth) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-ink-500">
        <Loader2 size={18} className="animate-spin mr-2" />
        Verificando sesión…
      </div>
    );
  }
  if (!usuario) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-ink-500">
        <Lock size={18} className="mr-2" />
        Redirigiendo a inicio de sesión…
      </div>
    );
  }
  if (cargandoInicial) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-ink-500">
        <Loader2 size={18} className="animate-spin mr-2" />
        Reservando tu cupo en el programa Primeras 100…
      </div>
    );
  }
  if (yaRegistrado) {
    return <EstadoEmpty
      icon={<CheckCircle2 size={26} strokeWidth={1.25} />}
      titulo="Ya tienes una empresa registrada"
      copy="Tu empresa ya está activa en el programa Primeras 100. Puedes gestionar tu suscripción desde tu cuenta."
      ctaLabel="Ir a mi suscripción"
      ctaTo="/mi-suscripcion"
    />;
  }
  if (errorInicial) {
    return <EstadoEmpty
      icon={<AlertTriangle size={26} strokeWidth={1.25} />}
      tono="danger"
      titulo="No se pudo iniciar el registro"
      copy={errorInicial}
      ctaLabel="Volver a empresas"
      ctaTo="/empresas"
    />;
  }

  // ─── Form principal ──────────────────────────────────────────────

  const personaTipo = rfcDetalle?.persona_tipo === "M" || rfcDetalle?.persona_tipo === "F"
    ? rfcDetalle.persona_tipo
    : null;

  const tipoLabel = reserva?.tipo === "iniciales" ? "Empresa Inicial" : "Empresa Aliada";
  const tipoBeneficio = reserva?.tipo === "iniciales"
    ? "3 meses gratis"
    : "3 meses a $99/mes";

  return (
    <div className="bg-ink-50 min-h-screen pb-28">
      {/* Header */}
      <header className="bg-white border-b border-ink-200">
        <Reveal as="div" className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-700">
            Registro · Programa Primeras 100
          </p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-ink-900 tracking-tight">
            Registra tu empresa
          </h1>
          <p className="mt-2 text-ink-600 max-w-2xl">
            Validamos tu RFC contra las 6 listas oficiales del SAT en tiempo real.
            {reserva ? " Tu lugar está reservado por 15 minutos." : ""}
          </p>
          {reserva && (
            <div className="mt-4 inline-flex items-center gap-2 bg-brand-50 border border-brand-100 text-brand-700 px-3 py-1.5 rounded font-mono text-xs uppercase tracking-wider">
              <Sparkles size={12} />
              Serás {tipoLabel} #{reserva.cupo_numero} — {tipoBeneficio}
            </div>
          )}
          {modoRegular && (
            <div className="mt-4 inline-flex items-center gap-2 bg-ink-100 border border-ink-200 text-ink-700 px-3 py-1.5 rounded font-mono text-xs uppercase tracking-wider">
              <Info size={12} />
              Tarifa regular · $699 MXN/mes
            </div>
          )}
        </Reveal>
      </header>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto px-4 sm:px-6 py-10"
      >
        <div className="bg-white border border-ink-200 rounded p-6 sm:p-8 space-y-10 shadow-card">

          {/* SECCIÓN 1 — Datos fiscales */}
          <FormSection
            step="01"
            title="Datos fiscales"
            description="Validamos tu RFC contra el SAT en tiempo real."
          >
            <FormFieldFull>
              <Input
                label="RFC"
                name="rfc"
                value={rfc}
                onChange={(e) => setRfc(e.target.value.toUpperCase())}
                required
                maxLength={13}
                placeholder="ABCD850101AB1"
                className="font-mono tracking-wider uppercase"
                hint="12 caracteres para persona moral · 13 para persona física"
              />
              <div className="mt-3">
                <BadgeRfc estado={rfcEstado} detalle={rfcDetalle} />
              </div>
            </FormFieldFull>

            <Input
              label="Razón social"
              name="razon_social"
              value={razonSocial}
              onChange={(e) => setRazonSocial(e.target.value)}
              required
              placeholder="Mi Empresa S.A. de C.V."
            />

            <Input
              label="Nombre comercial"
              name="nombre_comercial"
              value={nombreComercial}
              onChange={(e) => setNombreComercial(e.target.value)}
              required
              placeholder="Soldaduras del Golfo"
              hint="Así aparecerás en el directorio público."
            />

            <Input
              label="Tipo de persona"
              name="persona_tipo"
              value={personaTipo ? (personaTipo === "M" ? "Persona Moral" : "Persona Física") : ""}
              disabled
              hint="Se detecta automáticamente del RFC"
            />
          </FormSection>

          {/* SECCIÓN 2 — Contacto */}
          <FormSection
            step="02"
            title="Contacto"
            description="No se publica. Se usa para notificarte de RFQs en tu categoría."
          >
            <Input
              label="Email comercial"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="ventas@mi-empresa.com"
            />
            <Input
              label="Teléfono / WhatsApp"
              name="telefono"
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              required
              maxLength={15}
              placeholder="5512345678"
              hint="10 dígitos sin espacios"
            />
            <FormFieldFull>
              <Input
                label="Responsable"
                name="responsable"
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
                required
                placeholder="Nombre de la persona de contacto"
              />
            </FormFieldFull>
          </FormSection>

          {/* SECCIÓN 3 — Perfil */}
          <FormSection
            step="03"
            title="Perfil de proveedor"
            description="Lo que verán los compradores en el directorio."
          >
            <FormFieldFull>
              <Textarea
                label="Descripción breve"
                name="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value.slice(0, DESCRIPCION_MAX))}
                required
                rows={3}
                maxLength={DESCRIPCION_MAX}
                placeholder="¿Qué hace tu empresa? Máximo 200 caracteres."
                hint={`${descripcion.length} / ${DESCRIPCION_MAX} caracteres`}
              />
            </FormFieldFull>

            <FormFieldFull>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">
                Categorías <span className="text-danger ml-0.5">*</span>
              </label>
              <ChipsCategorias
                categorias={categorias}
                seleccionadas={categoriasSeleccionadas}
                onToggle={toggleCategoria}
              />
              <p className={`mt-2 text-xs ${
                categoriasSeleccionadas.length === CATEGORIAS_MAX
                  ? "text-warning"
                  : "text-ink-500"
              }`}>
                {categoriasSeleccionadas.length} de {CATEGORIAS_MAX} seleccionadas
                {categoriasSeleccionadas.length === 0 && " — selecciona al menos una"}
              </p>
            </FormFieldFull>

            <Select
              label="Estado"
              name="estado"
              value={estadoMX}
              onChange={(e) => setEstadoMX(e.target.value)}
              required
              placeholder="Selecciona estado"
              options={ESTADOS_MEXICO.map((e) => ({ value: e, label: e }))}
            />
            <Input
              label="Ciudad"
              name="ciudad"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              required
              placeholder="Ej: Coatzacoalcos"
            />
            <FormFieldFull>
              <Input
                label="Sitio web (opcional)"
                name="sitio_web"
                type="url"
                value={sitioWeb}
                onChange={(e) => setSitioWeb(e.target.value)}
                placeholder="https://mi-empresa.com"
              />
            </FormFieldFull>
          </FormSection>

          {/* SECCIÓN 4 — Términos */}
          <FormSection
            step="04"
            title="Términos"
            description="Para continuar al pago debes aceptar ambos."
            columns={1}
          >
            <FormFieldFull>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={aceptaTerminos}
                  onChange={(e) => setAceptaTerminos(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
                <span className="text-sm text-ink-700 group-hover:text-ink-900">
                  Acepto los <Link to="/terminos" className="text-brand-700 hover:underline font-medium">términos y condiciones</Link> del programa Primeras 100 Empresas.
                </span>
              </label>
            </FormFieldFull>
            <FormFieldFull>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={aceptaEmails}
                  onChange={(e) => setAceptaEmails(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
                <span className="text-sm text-ink-700 group-hover:text-ink-900">
                  Acepto recibir solicitudes de cotización (RFQ) por correo electrónico.
                </span>
              </label>
            </FormFieldFull>
          </FormSection>

          {errorSubmit && (
            <div className="bg-danger-bg border border-danger-border text-danger px-4 py-3 rounded flex items-start gap-2.5">
              <AlertTriangle size={18} className="shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">No se pudo continuar al pago</div>
                <div className="text-sm mt-0.5">{errorSubmit}</div>
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Footer sticky con timer + botón (modo promo) */}
      {reserva && (
        <FooterReserva
          tipoLabel={tipoLabel}
          tipoBeneficio={tipoBeneficio}
          cupoNumero={reserva.cupo_numero}
          msRestantes={msRestantes}
          formValido={formValido}
          enviando={enviando}
          onSubmit={() => {
            const form = document.querySelector("form");
            if (form) form.requestSubmit();
          }}
        />
      )}

      {/* Footer sticky sin timer (modo regular, $699/mes) */}
      {modoRegular && (
        <FooterRegular
          formValido={formValido}
          enviando={enviando}
          onSubmit={() => {
            const form = document.querySelector("form");
            if (form) form.requestSubmit();
          }}
        />
      )}
    </div>
  );
}

// ─── Subcomponentes ──────────────────────────────────────────────────

function BadgeRfc({
  estado,
  detalle,
}: {
  estado: EstadoRfc;
  detalle: ValidacionRfcEmpresa | null;
}) {
  if (estado === "idle") return null;

  if (estado === "validando") {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-2 rounded border bg-ink-50 border-ink-200 text-ink-600">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-sm">Verificando con SAT…</span>
      </div>
    );
  }

  if (estado === "ok") {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-2 rounded border bg-success-bg border-success-border text-success">
        <ShieldCheck size={16} />
        <span className="text-sm font-medium">RFC verificado</span>
      </div>
    );
  }

  if (estado === "advertencia") {
    const listas = (detalle?.listas || []).join(", ");
    return (
      <div className="bg-warning-bg border border-warning-border rounded p-3 flex items-start gap-2.5">
        <AlertTriangle size={18} className="text-warning shrink-0 mt-0.5" />
        <div>
          <div className="font-medium text-warning text-sm">RFC con observación</div>
          <div className="mt-0.5 text-sm text-ink-700">
            Listado en: <strong>{listas || "—"}</strong>. Puedes continuar con tu registro;
            el comprador verá esta observación en tu perfil.
          </div>
        </div>
      </div>
    );
  }

  if (estado === "bloqueado") {
    return (
      <div className="bg-danger-bg border border-danger-border rounded p-3 flex items-start gap-2.5">
        <XCircle size={18} className="text-danger shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold text-danger text-sm">RFC bloqueado</div>
          <div className="mt-0.5 text-sm text-ink-700">
            {detalle?.razon || "Este RFC no puede registrarse en RQ MARKET."}
          </div>
        </div>
      </div>
    );
  }

  // error
  return (
    <div className="inline-flex items-start gap-2 px-3 py-2 rounded border bg-ink-50 border-ink-200 text-ink-700">
      <Info size={16} className="shrink-0 mt-0.5" />
      <span className="text-sm">No se pudo validar. Intenta de nuevo en unos segundos.</span>
    </div>
  );
}

function ChipsCategorias({
  categorias,
  seleccionadas,
  onToggle,
}: {
  categorias: Categoria[];
  seleccionadas: string[];
  onToggle: (slug: string) => void;
}) {
  const cap = seleccionadas.length >= CATEGORIAS_MAX;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
      {categorias.map((cat) => {
        const activa = seleccionadas.includes(cat.slug);
        const deshabilitada = !activa && cap;
        return (
          <button
            key={cat.slug}
            type="button"
            onClick={() => onToggle(cat.slug)}
            disabled={deshabilitada}
            className={`flex items-center gap-2 px-3 py-2 rounded border text-sm font-medium text-left transition-colors focus:outline-none focus-visible:shadow-focus ${
              activa
                ? "bg-brand-50 border-brand-600 text-brand-700"
                : deshabilitada
                ? "bg-white border-ink-300 text-ink-400 opacity-50 cursor-not-allowed"
                : "bg-white border-ink-300 text-ink-700 hover:border-ink-400"
            }`}
          >
            {activa && <Check size={14} className="shrink-0 text-brand-700" />}
            <span className="truncate">{cat.nombre}</span>
          </button>
        );
      })}
    </div>
  );
}

function FooterReserva({
  tipoLabel,
  tipoBeneficio,
  cupoNumero,
  msRestantes,
  formValido,
  enviando,
  onSubmit,
}: {
  tipoLabel: string;
  tipoBeneficio: string;
  cupoNumero: number;
  msRestantes: number;
  formValido: boolean;
  enviando: boolean;
  onSubmit: () => void;
}) {
  const min = Math.floor(msRestantes / 60000);
  const seg = Math.floor((msRestantes % 60000) / 1000);
  const tiempo = `${String(min).padStart(2, "0")}:${String(seg).padStart(2, "0")}`;
  const urgente = msRestantes <= 60_000 && msRestantes > 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-ink-200 shadow-lg">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-mono uppercase tracking-wider text-ink-500">
            Tu reserva
          </div>
          <div className="mt-0.5 text-sm text-ink-900 flex flex-wrap items-center gap-x-2">
            <span className="font-medium">
              {tipoLabel} #{cupoNumero}
            </span>
            <span className="text-ink-400">·</span>
            <span className="text-ink-600">{tipoBeneficio}</span>
          </div>
        </div>

        <div className={`flex items-center gap-1.5 text-sm font-mono tabular-nums ${
          urgente ? "text-danger" : "text-ink-700"
        }`}>
          <Clock size={14} />
          <span>{tiempo}</span>
        </div>

        <Button
          type="button"
          onClick={onSubmit}
          loading={enviando}
          disabled={!formValido || enviando}
          leftIcon={!enviando ? <CreditCard size={16} /> : undefined}
          rightIcon={!enviando ? <ArrowRight size={16} /> : undefined}
        >
          {enviando ? "Procesando…" : "Continuar al pago"}
        </Button>
      </div>
    </div>
  );
}

function FooterRegular({
  formValido,
  enviando,
  onSubmit,
}: {
  formValido: boolean;
  enviando: boolean;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-ink-200 shadow-lg">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-mono uppercase tracking-wider text-ink-500">
            Tu registro
          </div>
          <div className="mt-0.5 text-sm text-ink-900 flex flex-wrap items-center gap-x-2">
            <span className="font-medium">Tarifa regular</span>
            <span className="text-ink-400">·</span>
            <span className="text-ink-600">$699 MXN/mes</span>
          </div>
        </div>

        <Button
          type="button"
          onClick={onSubmit}
          loading={enviando}
          disabled={!formValido || enviando}
          leftIcon={!enviando ? <CreditCard size={16} /> : undefined}
          rightIcon={!enviando ? <ArrowRight size={16} /> : undefined}
        >
          {enviando ? "Procesando…" : "Continuar al pago"}
        </Button>
      </div>
    </div>
  );
}

function EstadoEmpty({
  icon,
  titulo,
  copy,
  ctaLabel,
  ctaTo,
  tono = "neutral",
}: {
  icon: React.ReactNode;
  titulo: string;
  copy: string;
  ctaLabel: string;
  ctaTo: string;
  tono?: "neutral" | "danger";
}) {
  const iconBg =
    tono === "danger"
      ? "bg-danger-bg text-danger border-danger-border"
      : "bg-ink-100 text-ink-500 border-ink-200";
  return (
    <div className="bg-ink-50 min-h-screen py-16 px-4">
      <div className="max-w-xl mx-auto bg-white border border-ink-200 rounded p-8 sm:p-10 text-center">
        <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full border ${iconBg}`}>
          {icon}
        </div>
        <h2 className="mt-5 text-xl font-semibold text-ink-900">{titulo}</h2>
        <p className="mt-2 text-sm text-ink-600 max-w-md mx-auto leading-relaxed">{copy}</p>
        <Link
          to={ctaTo}
          className="mt-6 inline-flex items-center justify-center gap-2 h-11 px-5 rounded bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-medium text-sm transition-colors focus:outline-none focus-visible:shadow-focus"
        >
          {ctaLabel}
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
