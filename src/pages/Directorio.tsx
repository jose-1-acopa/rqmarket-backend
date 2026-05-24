/**
 * Directorio.tsx
 * Página pública del directorio de proveedores verificados.
 * 
 * Funcionalidad:
 *   - Lista proveedores aprobados
 *   - Filtros: categoría, estado (de México), tier
 *   - Búsqueda local por nombre (filtra en el cliente)
 *   - Loading, error, y empty states
 * 
 * Esta página es indexable por Google (sin auth requerida).
 */

import { useEffect, useState, useMemo } from "react";
import {
  listarCategorias,
  listarProveedores,
  type Categoria,
  type ProveedorPublico,
  type ProveedorTier,
  type FiltrosProveedores,
} from "../services/rqmarketApi";
import ProveedorCard from "../components/ProveedorCard";

// Estados de México - se usa para el filtro
const ESTADOS_MEXICO = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche",
  "Chiapas", "Chihuahua", "Ciudad de México", "Coahuila", "Colima",
  "Durango", "Estado de México", "Guanajuato", "Guerrero", "Hidalgo",
  "Jalisco", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca",
  "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa",
  "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán",
  "Zacatecas",
];

export default function Directorio() {
  // Datos del backend
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [proveedores, setProveedores] = useState<ProveedorPublico[]>([]);

  // Filtros activos
  const [filtroCategoria, setFiltroCategoria] = useState<string>("");
  const [filtroEstado, setFiltroEstado] = useState<string>("");
  const [filtroTier, setFiltroTier] = useState<ProveedorTier | "">("");
  const [busquedaNombre, setBusquedaNombre] = useState<string>("");

  // UI state
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Cargar las categorías una sola vez al montar
  useEffect(() => {
    listarCategorias()
      .then(setCategorias)
      .catch((err) => console.error("Error cargando categorías:", err));
  }, []);

  // 2. Cargar proveedores cada vez que cambien los filtros del backend
  useEffect(() => {
    setCargando(true);
    setError(null);

    const filtros: FiltrosProveedores = {};
    if (filtroCategoria) filtros.categoria = filtroCategoria;
    if (filtroEstado) filtros.estado = filtroEstado;
    if (filtroTier) filtros.tier = filtroTier;

    listarProveedores(filtros)
      .then((data) => {
        setProveedores(data);
        setCargando(false);
      })
      .catch((err) => {
        console.error("Error cargando proveedores:", err);
        setError(err.message || "No se pudieron cargar los proveedores");
        setCargando(false);
      });
  }, [filtroCategoria, filtroEstado, filtroTier]);

  // 3. Filtrado por nombre se hace en cliente (más rápido que pedir al servidor)
  const proveedoresFiltrados = useMemo(() => {
    if (!busquedaNombre.trim()) return proveedores;
    const q = busquedaNombre.toLowerCase().trim();
    return proveedores.filter((p) =>
      p.nombre_comercial.toLowerCase().includes(q)
    );
  }, [proveedores, busquedaNombre]);

  // Resetear todos los filtros
  const limpiarFiltros = () => {
    setFiltroCategoria("");
    setFiltroEstado("");
    setFiltroTier("");
    setBusquedaNombre("");
  };

  const hayFiltrosActivos = Boolean(
    filtroCategoria || filtroEstado || filtroTier || busquedaNombre
  );

  return (
    <div className="py-6">
      {/* Header de la página */}
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Directorio de proveedores verificados
        </h1>
        <p className="text-gray-600 max-w-2xl">
          Encuentra proveedores industriales confiables en México. Todos nuestros
          proveedores pasan por un proceso de verificación de RFC contra el SAT
          (Art. 69-B del CFF) y constancia de situación fiscal.
        </p>
      </header>

      {/* Panel de filtros */}
      <section className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Búsqueda por nombre */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Buscar por nombre
            </label>
            <input
              type="text"
              value={busquedaNombre}
              onChange={(e) => setBusquedaNombre(e.target.value)}
              placeholder="ej: Soldaduras del Golfo"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtro de categoría */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Categoría
            </label>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.icono} {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de estado */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Estado
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              {ESTADOS_MEXICO.map((est) => (
                <option key={est} value={est}>
                  {est}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de tier */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Nivel de verificación
            </label>
            <select
              value={filtroTier}
              onChange={(e) => setFiltroTier(e.target.value as ProveedorTier | "")}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los niveles</option>
              <option value="bronze">🥉 Bronze</option>
              <option value="silver">🥈 Silver</option>
              <option value="gold">🥇 Gold</option>
            </select>
          </div>
        </div>

        {/* Indicador de filtros activos */}
        {hayFiltrosActivos && (
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Mostrando {proveedoresFiltrados.length}{" "}
              {proveedoresFiltrados.length === 1 ? "resultado" : "resultados"}
            </span>
            <button
              onClick={limpiarFiltros}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </section>

      {/* Listado de proveedores */}
      <section>
        {cargando && (
          <div className="text-center py-12 text-gray-500">
            Cargando proveedores...
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {!cargando && !error && proveedoresFiltrados.length === 0 && (
          <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <div className="text-5xl mb-3">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No encontramos proveedores
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {hayFiltrosActivos
                ? "Prueba a ajustar los filtros o limpiar la búsqueda."
                : "Todavía no hay proveedores aprobados en el directorio."}
            </p>
            {hayFiltrosActivos && (
              <button
                onClick={limpiarFiltros}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}

        {!cargando && !error && proveedoresFiltrados.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {proveedoresFiltrados.map((p) => (
              <ProveedorCard key={p.id} proveedor={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
