/**
 * AdminProveedores.tsx
 * Panel de administración para gestionar proveedores del directorio.
 *
 * Funcionalidades:
 *   - Estadísticas rápidas (pendientes, aprobados, rechazados, tiers)
 *   - Tabla con todos los proveedores
 *   - Filtro por estado (pendientes primero)
 *   - Aprobar con selección de tier
 *   - Rechazar con motivo
 *   - Ver todos los datos (incluyendo contactos)
 *
 * Nota: TODO endpoint admin requiere auth + rol admin en producción.
 * En desarrollo local funciona porque tienes AUTH_MODE=dev en el backend.
 */

import { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Inbox,
  Users,
  Clock,
  ShieldAlert,
} from "lucide-react";
import {
  obtenerEstadisticasAdmin,
  listarProveedoresAdmin,
  aprobarProveedor,
  rechazarProveedor,
  type EstadisticasAdmin,
  type ProveedorCompleto,
  type EstadoVerificacion,
  type ProveedorTier,
} from "../services/rqmarketApi";
import { Stat, StatGroup } from "../components/ui/Stat";
import { TierBadge, EstadoBadge } from "../components/ui/Badge";

export default function AdminProveedores() {
  const [estadisticas, setEstadisticas] = useState<EstadisticasAdmin | null>(null);
  const [proveedores, setProveedores] = useState<ProveedorCompleto[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<EstadoVerificacion | "todos">("pendiente");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proveedorExpandido, setProveedorExpandido] = useState<string | null>(null);

  const cargarEstadisticas = () => {
    obtenerEstadisticasAdmin()
      .then(setEstadisticas)
      .catch(err => console.error("Error cargando estadísticas:", err));
  };

  const cargarProveedores = () => {
    setCargando(true);
    setError(null);
    listarProveedoresAdmin(filtroEstado)
      .then(data => {
        setProveedores(data);
        setCargando(false);
      })
      .catch(err => {
        console.error("Error cargando proveedores admin:", err);
        setError(err.message || "No se pudieron cargar los proveedores");
        setCargando(false);
      });
  };

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  useEffect(() => {
    cargarProveedores();
  }, [filtroEstado]);

  const handleAprobar = async (id: string, nombre: string) => {
    const tierSeleccionado = window.prompt(
      `Aprobar a "${nombre}". ¿Qué tier le asignas?\n\nbronze / silver / gold`,
      "silver"
    );
    if (!tierSeleccionado) return;

    const tier = tierSeleccionado.trim().toLowerCase() as ProveedorTier;
    if (!["bronze", "silver", "gold"].includes(tier)) {
      alert("Tier inválido. Debe ser: bronze, silver o gold");
      return;
    }

    try {
      await aprobarProveedor(id, tier);
      alert(`✅ Proveedor aprobado con tier ${tier}`);
      cargarProveedores();
      cargarEstadisticas();
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  const handleRechazar = async (id: string, nombre: string) => {
    const motivo = window.prompt(
      `¿Por qué rechazas a "${nombre}"? (opcional)`,
      ""
    );
    if (motivo === null) return;

    const confirmacion = window.confirm(`¿Confirmas rechazar a "${nombre}"?`);
    if (!confirmacion) return;

    try {
      await rechazarProveedor(id, motivo);
      alert(`Proveedor rechazado`);
      cargarProveedores();
      cargarEstadisticas();
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  const filtros = useMemo(
    () => ([
      { value: "pendiente", label: "Pendientes", count: estadisticas?.pendiente },
      { value: "aprobado", label: "Aprobados", count: estadisticas?.aprobado },
      { value: "rechazado", label: "Rechazados", count: estadisticas?.rechazado },
      { value: "todos", label: "Todos", count: estadisticas?.total },
    ] as const),
    [estadisticas]
  );

  return (
    <div className="bg-ink-50 min-h-screen">
      {/* Header institucional */}
      <header className="bg-white border-b border-ink-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-700">
            Panel admin
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-ink-900 tracking-tight">
            Proveedores del directorio
          </h1>
          <p className="mt-1 text-sm text-ink-600">
            Gestiona los registros del directorio. Aprueba o rechaza según verificación documental.
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Estadísticas */}
        {estadisticas && (
          <StatGroup columns={4}>
            <Stat
              label="Total registros"
              value={estadisticas.total}
              icon={<Users size={16} />}
            />
            <Stat
              label="Pendientes"
              value={estadisticas.pendiente}
              accent="warning"
              icon={<Clock size={16} />}
              hint={estadisticas.pendiente === 1 ? "1 por revisar" : `${estadisticas.pendiente} por revisar`}
            />
            <Stat
              label="Aprobados"
              value={estadisticas.aprobado}
              accent="success"
              icon={<CheckCircle2 size={16} />}
            />
            <Stat
              label="Rechazados"
              value={estadisticas.rechazado}
              accent="danger"
              icon={<XCircle size={16} />}
            />
          </StatGroup>
        )}

        {/* Filtros */}
        <div className="bg-white border border-ink-200 rounded">
          <div className="flex flex-wrap items-center divide-x divide-ink-200" role="tablist">
            {filtros.map((f) => {
              const isActive = filtroEstado === f.value;
              return (
                <button
                  key={f.value}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setFiltroEstado(f.value)}
                  className={`relative px-5 py-3 text-sm font-medium transition-colors focus:outline-none focus-visible:shadow-focus ${
                    isActive
                      ? "text-brand-700 bg-brand-50/50"
                      : "text-ink-700 hover:text-ink-900 hover:bg-ink-50"
                  }`}
                >
                  <span>{f.label}</span>
                  {f.count !== undefined && (
                    <span className={`ml-2 font-mono text-xs tabular-nums ${isActive ? "text-brand-600" : "text-ink-500"}`}>
                      ({f.count})
                    </span>
                  )}
                  {isActive && <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-brand-600" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tabla */}
        <section>
          {cargando && (
            <div className="bg-white border border-ink-200 rounded p-12 flex items-center justify-center text-ink-500">
              <Loader2 size={18} className="animate-spin mr-2" />
              Cargando proveedores…
            </div>
          )}

          {error && (
            <div className="bg-danger-bg border border-danger-border text-danger px-4 py-3 rounded flex items-start gap-2.5">
              <AlertTriangle size={18} className="shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">No se pudieron cargar los proveedores</div>
                <div className="text-sm mt-0.5">{error}</div>
              </div>
            </div>
          )}

          {!cargando && !error && proveedores.length === 0 && (
            <div className="bg-white border border-dashed border-ink-300 rounded p-12 text-center">
              <Inbox size={28} strokeWidth={1.25} className="mx-auto text-ink-400" />
              <p className="mt-3 text-ink-600">No hay proveedores en este estado.</p>
            </div>
          )}

          {!cargando && !error && proveedores.length > 0 && (
            <div className="bg-white border border-ink-200 rounded overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-ink-50 border-b border-ink-200">
                    <tr>
                      <th className="w-8 px-2"></th>
                      <Th>Proveedor</Th>
                      <Th>RFC</Th>
                      <Th>Ubicación</Th>
                      <Th>Estado</Th>
                      <Th>Tier</Th>
                      <Th className="text-right">Acciones</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100">
                    {proveedores.map(p => (
                      <ProveedorFila
                        key={p.id}
                        proveedor={p}
                        expandido={proveedorExpandido === p.id}
                        onToggle={() => setProveedorExpandido(proveedorExpandido === p.id ? null : p.id)}
                        onAprobar={() => handleAprobar(p.id, p.nombre_comercial)}
                        onRechazar={() => handleRechazar(p.id, p.nombre_comercial)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// ── Sub-componentes ──────────────────────────────────────────────────

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`text-left font-mono text-[11px] uppercase tracking-wider text-ink-500 px-3 py-2.5 ${className}`}>
      {children}
    </th>
  );
}

function ProveedorFila({
  proveedor,
  expandido,
  onToggle,
  onAprobar,
  onRechazar,
}: {
  proveedor: ProveedorCompleto;
  expandido: boolean;
  onToggle: () => void;
  onAprobar: () => void;
  onRechazar: () => void;
}) {
  return (
    <>
      <tr className={`hover:bg-ink-50/60 transition-colors ${expandido ? "bg-brand-50/30" : ""}`}>
        <td className="w-8 px-2 align-top pt-3">
          <button
            onClick={onToggle}
            aria-label={expandido ? "Ocultar detalle" : "Ver detalle"}
            aria-expanded={expandido}
            className="text-ink-400 hover:text-ink-700 focus:outline-none focus-visible:shadow-focus rounded"
          >
            {expandido ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        </td>
        <td className="px-3 py-2.5 align-top">
          <button onClick={onToggle} className="text-left group">
            <div className="font-medium text-ink-900 group-hover:text-brand-700">{proveedor.nombre_comercial}</div>
            {proveedor.razon_social && (
              <div className="text-xs text-ink-500 mt-0.5">{proveedor.razon_social}</div>
            )}
          </button>
        </td>
        <td className="px-3 py-2.5 font-mono text-xs text-ink-700 align-top tabular-nums">
          {proveedor.rfc}
        </td>
        <td className="px-3 py-2.5 text-ink-700 align-top">
          {proveedor.ciudad}
          <span className="text-ink-400">, </span>
          <span className="text-ink-500">{proveedor.estado}</span>
        </td>
        <td className="px-3 py-2.5 align-top">
          <div className="flex flex-col gap-1 items-start">
            <EstadoBadge estado={proveedor.estado_verificacion} size="sm" />
            {proveedor.alerta_sat && (
              <span
                title="Presunto defraudador en lista 69-B"
                className="inline-flex items-center gap-1 text-[11px] text-warning font-medium"
              >
                <ShieldAlert size={12} />
                Alerta SAT
              </span>
            )}
          </div>
        </td>
        <td className="px-3 py-2.5 align-top">
          {proveedor.tier ? (
            <TierBadge tier={proveedor.tier} size="sm" />
          ) : (
            <span className="text-ink-400 text-xs">—</span>
          )}
        </td>
        <td className="px-3 py-2.5 text-right whitespace-nowrap align-top">
          {proveedor.estado_verificacion === "pendiente" ? (
            <div className="inline-flex items-center gap-1">
              <button
                onClick={onAprobar}
                className="px-2.5 py-1 rounded text-xs font-medium text-success hover:bg-success-bg transition-colors focus:outline-none focus-visible:shadow-focus"
              >
                Aprobar
              </button>
              <span className="text-ink-300">·</span>
              <button
                onClick={onRechazar}
                className="px-2.5 py-1 rounded text-xs font-medium text-danger hover:bg-danger-bg transition-colors focus:outline-none focus-visible:shadow-focus"
              >
                Rechazar
              </button>
            </div>
          ) : (
            <span className="text-xs text-ink-400">—</span>
          )}
        </td>
      </tr>

      {expandido && (
        <tr className="bg-ink-50/50">
          <td colSpan={7} className="px-0 py-0 border-l-2 border-brand-500">
            <div className="px-6 py-5">
              <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500 mb-3">
                Detalle del proveedor
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                <Campo label="Teléfono" valor={proveedor.telefono} mono />
                <Campo label="Email" valor={proveedor.email} mono />
                <Campo label="WhatsApp" valor={proveedor.whatsapp} mono />
                <Campo label="Sitio web" valor={proveedor.sitio_web} />
                <Campo label="Año fundación" valor={proveedor.año_fundacion?.toString()} mono />
                <Campo label="Contacto comercial" valor={proveedor.contacto_comercial} />
                <Campo label="Dirección exacta" valor={proveedor.direccion_exacta} className="md:col-span-2" />
                <Campo label="Categorías" valor={proveedor.categorias?.join(", ")} />
                <Campo label="Descripción" valor={proveedor.descripcion_corta} className="md:col-span-2 lg:col-span-3" />
                {proveedor.motivo_rechazo && (
                  <Campo
                    label="Motivo de rechazo"
                    valor={proveedor.motivo_rechazo}
                    className="md:col-span-2 lg:col-span-3"
                    accent="danger"
                  />
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function Campo({
  label,
  valor,
  mono = false,
  className = "",
  accent,
}: {
  label: string;
  valor?: string;
  mono?: boolean;
  className?: string;
  accent?: "danger";
}) {
  if (!valor) return null;
  return (
    <div className={className}>
      <div className="font-mono text-[10px] uppercase tracking-wider text-ink-500">{label}</div>
      <div className={`mt-0.5 text-sm ${mono ? "font-mono" : ""} ${accent === "danger" ? "text-danger" : "text-ink-800"}`}>
        {valor}
      </div>
    </div>
  );
}
