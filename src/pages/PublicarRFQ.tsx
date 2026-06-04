/**
 * PublicarRFQ.tsx
 * Formulario auth-required para publicar una nueva RFQ.
 *
 * Flow:
 *   1. Si no hay usuario logueado, redirige a /login con state desde
 *   2. Carga categorías del API para el select
 *   3. Valida campos antes de enviar
 *   4. Al crear: navigate('/mis-rfqs', { state: { exitoNuevaRFQ: {...} } })
 *      → MisRFQs muestra el banner de éxito una sola vez
 */

import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Lock,
  ShieldCheck,
  Package,
  MapPin,
  Calendar,
} from "lucide-react";
import { useAuth } from "../firebase/AuthContext";
import {
  listarCategorias,
  crearRFQ,
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

const UNIDADES_COMUNES = [
  "Piezas",
  "Kilogramos (kg)",
  "Toneladas",
  "Metros",
  "Metros cuadrados (m²)",
  "Metros cúbicos (m³)",
  "Litros",
  "Galones",
  "Cajas",
  "Tarimas",
  "Servicio",
  "Lote",
  "Otra",
];

export default function PublicarRFQ() {
  const navigate = useNavigate();
  const { usuario, cargando: cargandoAuth } = useAuth();

  // Categorías
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  // Datos del formulario
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [estado, setEstado] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [unidad, setUnidad] = useState("");
  const [fechaNecesidad, setFechaNecesidad] = useState("");
  const [presupuestoAprox, setPresupuestoAprox] = useState("");

  // Submit
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Redirigir a /login si no hay sesión ──
  useEffect(() => {
    if (!cargandoAuth && !usuario) {
      navigate("/login", { state: { desde: "/publicar-rfq" } });
    }
  }, [usuario, cargandoAuth, navigate]);

  // ── Cargar categorías ──
  useEffect(() => {
    listarCategorias()
      .then(setCategorias)
      .catch((err) => console.error("Error cargando categorías:", err));
  }, []);

  // ── Submit ──
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones cliente
    const cantidadNum = Number(cantidad);
    if (!isFinite(cantidadNum) || cantidadNum <= 0) {
      setError("La cantidad debe ser un número positivo.");
      return;
    }

    let presupuestoNum: number | undefined;
    if (presupuestoAprox.trim()) {
      presupuestoNum = Number(presupuestoAprox);
      if (!isFinite(presupuestoNum) || presupuestoNum < 0) {
        setError("El presupuesto debe ser un número no negativo.");
        return;
      }
    }

    setEnviando(true);
    try {
      const res = await crearRFQ({
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        categoria,
        ciudad: ciudad.trim(),
        estado,
        cantidad: cantidadNum,
        unidad: unidad.trim(),
        fecha_necesidad: fechaNecesidad || undefined,
        presupuesto_aproximado: presupuestoNum,
      });

      navigate("/mis-rfqs", {
        state: {
          exitoNuevaRFQ: {
            rfq_id: res.rfq_id,
            titulo: titulo.trim(),
            mensaje: res.mensaje,
          },
        },
      });
    } catch (err: any) {
      setError(err.message || "No se pudo publicar la RFQ");
      setEnviando(false);
    }
  };

  // ── Loading / no auth ──
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

  return (
    <div className="bg-ink-50 min-h-screen">
      {/* Header institucional */}
      <header className="bg-white border-b border-ink-200">
        <Reveal as="div" className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <button
            type="button"
            onClick={() => navigate("/mis-rfqs")}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-brand-700 transition-colors mb-4"
          >
            <ArrowLeft size={14} />
            Volver a mis RFQs
          </button>

          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-700">
            Nueva solicitud de cotización
          </p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-ink-900 tracking-tight">
            Publicar una RFQ
          </h1>
          <p className="mt-2 text-ink-600 max-w-2xl">
            Tu solicitud se notificará por email a todos los proveedores verificados de la
            categoría. Tu nombre y datos de contacto NO se publican — solo el comprador (tú) ve
            quién cotiza.
          </p>
        </Reveal>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          {/* Sidebar con secciones */}
          <aside className="hidden lg:block">
            <nav className="sticky top-24 border border-ink-200 rounded bg-white p-2 shadow-card" aria-label="Secciones del formulario">
              <SidebarLink href="#producto" icon={<Package size={16} />} number="01" label="Producto" />
              <SidebarLink href="#ubicacion" icon={<MapPin size={16} />} number="02" label="Ubicación" />
              <SidebarLink href="#tiempo" icon={<Calendar size={16} />} number="03" label="Plazo y presupuesto" />
              <div className="mt-3 mx-3 pt-3 border-t border-ink-200">
                <div className="flex items-start gap-2 text-xs text-ink-600">
                  <ShieldCheck size={14} className="text-success shrink-0 mt-0.5" />
                  <span>Tu nombre y contacto no se publican.</span>
                </div>
              </div>
            </nav>
          </aside>

          {/* Formulario */}
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-ink-200 rounded p-6 sm:p-8 space-y-10 shadow-card"
          >
            <section id="producto" className="scroll-mt-24">
              <FormSection
                step="01"
                title="Producto o servicio"
                description="¿Qué necesitas cotizar? Sé específico — los proveedores responden mejor a títulos claros."
              >
                <FormFieldFull>
                  <Input
                    label="Título de la solicitud"
                    name="titulo"
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    required
                    maxLength={120}
                    placeholder="Ej: Cable THW 12 AWG, 500 metros"
                    hint="Aparece como encabezado en el directorio de RFQs."
                  />
                </FormFieldFull>

                <FormFieldFull>
                  <Textarea
                    label="Descripción"
                    name="descripcion"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    required
                    rows={5}
                    maxLength={2000}
                    placeholder="Especificaciones técnicas, normas requeridas, condiciones de entrega, etc."
                    hint={`${descripcion.length} / 2000 caracteres`}
                  />
                </FormFieldFull>

                <Select
                  label="Categoría"
                  name="categoria"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  required
                  placeholder="Selecciona la categoría"
                  options={categorias.map((cat) => ({
                    value: cat.slug,
                    label: cat.icono ? `${cat.icono} ${cat.nombre}` : cat.nombre,
                  }))}
                  hint="Define a qué proveedores se notifica."
                />

                <Input
                  label="Cantidad"
                  name="cantidad"
                  type="number"
                  step="any"
                  min={0}
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  required
                  placeholder="Ej: 500"
                />

                <Select
                  label="Unidad"
                  name="unidad"
                  value={unidad}
                  onChange={(e) => setUnidad(e.target.value)}
                  required
                  placeholder="Selecciona la unidad"
                  options={UNIDADES_COMUNES.map((u) => ({ value: u, label: u }))}
                />
              </FormSection>
            </section>

            <section id="ubicacion" className="scroll-mt-24">
              <FormSection
                step="02"
                title="Ubicación de entrega"
                description="Ciudad y estado donde necesitas el producto o servicio."
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
                  placeholder="Selecciona el estado"
                  options={ESTADOS_MEXICO.map((est) => ({ value: est, label: est }))}
                />
              </FormSection>
            </section>

            <section id="tiempo" className="scroll-mt-24">
              <FormSection
                step="03"
                title="Plazo y presupuesto"
                description="Ambos campos son opcionales pero ayudan a los proveedores a cotizar mejor. Tu presupuesto NO se muestra públicamente."
              >
                <Input
                  label="Fecha de necesidad"
                  name="fechaNecesidad"
                  type="date"
                  value={fechaNecesidad}
                  onChange={(e) => setFechaNecesidad(e.target.value)}
                  hint="Cuándo necesitas el producto entregado."
                />

                <Input
                  label="Presupuesto aproximado (MXN)"
                  name="presupuestoAprox"
                  type="number"
                  step="0.01"
                  min={0}
                  value={presupuestoAprox}
                  onChange={(e) => setPresupuestoAprox(e.target.value)}
                  prefix="$"
                  placeholder="Opcional"
                  hint="Privado — solo tú lo ves."
                />
              </FormSection>
            </section>

            {/* Error */}
            {error && (
              <div className="bg-danger-bg border border-danger-border text-danger px-4 py-3 rounded flex items-start gap-2.5">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">No se pudo publicar la RFQ</div>
                  <div className="text-sm mt-0.5">{error}</div>
                </div>
              </div>
            )}

            {/* Aviso privacidad */}
            <div className="bg-ink-50 border border-ink-200 text-ink-700 px-4 py-3 rounded flex items-start gap-2.5">
              <ShieldCheck size={16} className="shrink-0 mt-0.5 text-success" />
              <div className="text-sm">
                <strong className="text-ink-900">Privacidad:</strong> tu nombre, email y datos de
                contacto no aparecen en la RFQ pública. Cuando un proveedor te cotice, podrás
                contactarlo tú directamente. RQ MARKET no cobra comisión por el contacto.
              </div>
            </div>

            {/* Acciones */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2 border-t border-ink-200">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(-1)}
                disabled={enviando}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                loading={enviando}
                rightIcon={!enviando ? <ArrowRight size={16} /> : undefined}
              >
                {enviando ? "Publicando…" : "Publicar y notificar proveedores"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Subcomponentes ──────────────────────────────────────────────────

function SidebarLink({
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
      <span className="font-mono text-xs text-ink-400 tabular-nums group-hover:text-brand-700">
        {number}
      </span>
      <span className="text-ink-400 group-hover:text-brand-700">{icon}</span>
      <span className="font-medium">{label}</span>
    </a>
  );
}
