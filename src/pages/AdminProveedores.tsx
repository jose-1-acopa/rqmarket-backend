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

import { useEffect, useState } from "react";
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

export default function AdminProveedores() {
  const [estadisticas, setEstadisticas] = useState<EstadisticasAdmin | null>(null);
  const [proveedores, setProveedores] = useState<ProveedorCompleto[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<EstadoVerificacion | "todos">("pendiente");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proveedorExpandido, setProveedorExpandido] = useState<string | null>(null);

  // Cargar estadísticas una sola vez
  const cargarEstadisticas = () => {
    obtenerEstadisticasAdmin()
      .then(setEstadisticas)
      .catch(err => console.error("Error cargando estadísticas:", err));
  };

  // Cargar proveedores cada vez que cambia el filtro
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
    if (motivo === null) return; // canceló

    const confirmacion = window.confirm(
      `¿Confirmas rechazar a "${nombre}"?`
    );
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

  return (
    <div className="py-6">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Panel admin - Proveedores
        </h1>
        <p className="text-gray-600 text-sm">
          Gestiona los registros del directorio. Aprueba o rechaza proveedores según verificación.
        </p>
      </header>

      {/* Estadísticas */}
      {estadisticas && (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total" value={estadisticas.total} color="gray" />
          <StatCard label="Pendientes" value={estadisticas.pendiente} color="yellow" />
          <StatCard label="Aprobados" value={estadisticas.aprobado} color="green" />
          <StatCard label="Rechazados" value={estadisticas.rechazado} color="red" />
        </section>
      )}

      {/* Filtros */}
      <section className="bg-white border border-gray-200 rounded-lg p-3 mb-4 flex flex-wrap gap-2">
        {(["pendiente", "aprobado", "rechazado", "todos"] as const).map(estado => (
          <button
            key={estado}
            onClick={() => setFiltroEstado(estado)}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              filtroEstado === estado
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {estado.charAt(0).toUpperCase() + estado.slice(1)}
          </button>
        ))}
      </section>

      {/* Tabla */}
      <section>
        {cargando && (
          <div className="text-center py-12 text-gray-500">Cargando...</div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {!cargando && !error && proveedores.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-600">No hay proveedores en este estado.</p>
          </div>
        )}

        {!cargando && !error && proveedores.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-gray-700">
                  <th className="px-4 py-3 font-medium">Proveedor</th>
                  <th className="px-4 py-3 font-medium">RFC</th>
                  <th className="px-4 py-3 font-medium">Ubicación</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Tier</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
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
        )}
      </section>
    </div>
  );
}

// ── Sub-componentes ──────────────────────────────────────────────────

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "gray" | "yellow" | "green" | "red";
}) {
  const colors = {
    gray: "bg-gray-100 text-gray-700",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    green: "bg-green-50 text-green-700 border-green-200",
    red: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <div className={`${colors[color]} border rounded-lg p-4`}>
      <div className="text-xs uppercase tracking-wide mb-1">{label}</div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
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
  const estadoColors = {
    pendiente: "bg-yellow-100 text-yellow-800",
    aprobado: "bg-green-100 text-green-800",
    rechazado: "bg-red-100 text-red-800",
  };

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50">
        <td className="px-4 py-3">
          <button onClick={onToggle} className="text-left">
            <div className="font-medium text-gray-900">{proveedor.nombre_comercial}</div>
            {proveedor.razon_social && (
              <div className="text-xs text-gray-500">{proveedor.razon_social}</div>
            )}
          </button>
        </td>
        <td className="px-4 py-3 font-mono text-xs">{proveedor.rfc}</td>
        <td className="px-4 py-3 text-gray-700">
          {proveedor.ciudad}, {proveedor.estado}
        </td>
        <td className="px-4 py-3">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded ${
              estadoColors[proveedor.estado_verificacion] || ""
            }`}
          >
            {proveedor.estado_verificacion}
          </span>
          {proveedor.alerta_sat && (
            <span
              title="Presunto defraudador en lista 69-B"
              className="ml-2 text-xs text-orange-700"
            >
              ⚠️ SAT
            </span>
          )}
        </td>
        <td className="px-4 py-3 text-xs">{proveedor.tier}</td>
        <td className="px-4 py-3 text-right whitespace-nowrap">
          {proveedor.estado_verificacion === "pendiente" && (
            <>
              <button
                onClick={onAprobar}
                className="text-green-600 hover:text-green-800 font-medium text-sm mr-3"
              >
                Aprobar
              </button>
              <button
                onClick={onRechazar}
                className="text-red-600 hover:text-red-800 font-medium text-sm"
              >
                Rechazar
              </button>
            </>
          )}
          <button onClick={onToggle} className="text-gray-500 hover:text-gray-700 text-sm ml-3">
            {expandido ? "Ocultar" : "Ver detalle"}
          </button>
        </td>
      </tr>

      {expandido && (
        <tr className="bg-gray-50">
          <td colSpan={6} className="px-4 py-3 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              <Campo label="Teléfono" valor={proveedor.telefono} />
              <Campo label="Email" valor={proveedor.email} />
              <Campo label="WhatsApp" valor={proveedor.whatsapp} />
              <Campo label="Dirección exacta" valor={proveedor.direccion_exacta} />
              <Campo label="Contacto comercial" valor={proveedor.contacto_comercial} />
              <Campo label="Sitio web" valor={proveedor.sitio_web} />
              <Campo label="Año fundación" valor={proveedor.año_fundacion?.toString()} />
              <Campo label="Categorías" valor={proveedor.categorias?.join(", ")} />
              <Campo label="Descripción" valor={proveedor.descripcion_corta} />
              {proveedor.motivo_rechazo && (
                <Campo label="Motivo rechazo" valor={proveedor.motivo_rechazo} />
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function Campo({ label, valor }: { label: string; valor?: string }) {
  if (!valor) return null;
  return (
    <div>
      <span className="text-xs text-gray-500">{label}:</span>{" "}
      <span className="text-gray-800">{valor}</span>
    </div>
  );
}
