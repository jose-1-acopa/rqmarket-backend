/**
 * Directorio.tsx
 * Página pública del directorio de proveedores verificados.
 *
 * Funcionalidad:
 *   - Lista proveedores aprobados
 *   - Filtros: categoría, estado (de México)
 *   - Búsqueda local por nombre (filtra en el cliente)
 *   - Loading, error, y empty states
 *
 * Esta página es indexable por Google (sin auth requerida).
 */

import { useEffect, useState, useMemo } from "react";
import { Search, X, Loader2, AlertTriangle, SearchX } from "lucide-react";
import {
  listarCategorias,
  listarProveedores,
  type Categoria,
  type ProveedorPublico,
  type FiltrosProveedores,
} from "../services/rqmarketApi";
import ProveedorCard from "../components/ProveedorCard";
import { Input, Select } from "../components/ui/Input";
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

export default function Directorio() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [proveedores, setProveedores] = useState<ProveedorPublico[]>([]);

  const [filtroCategoria, setFiltroCategoria] = useState<string>("");
  const [filtroEstado, setFiltroEstado] = useState<string>("");
  const [busquedaNombre, setBusquedaNombre] = useState<string>("");

  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listarCategorias()
      .then(setCategorias)
      .catch((err) => console.error("Error cargando categorías:", err));
  }, []);

  useEffect(() => {
    setCargando(true);
    setError(null);

    const filtros: FiltrosProveedores = {};
    if (filtroCategoria) filtros.categoria = filtroCategoria;
    if (filtroEstado) filtros.estado = filtroEstado;

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
  }, [filtroCategoria, filtroEstado]);

  const proveedoresFiltrados = useMemo(() => {
    if (!busquedaNombre.trim()) return proveedores;
    const q = busquedaNombre.toLowerCase().trim();
    return proveedores.filter((p) =>
      p.nombre_comercial.toLowerCase().includes(q)
    );
  }, [proveedores, busquedaNombre]);

  const limpiarFiltros = () => {
    setFiltroCategoria("");
    setFiltroEstado("");
    setBusquedaNombre("");
  };

  const hayFiltrosActivos = Boolean(
    filtroCategoria || filtroEstado || busquedaNombre
  );

  return (
    <div className="bg-ink-50 min-h-screen">
      {/* Header institucional */}
      <header className="bg-white border-b border-ink-200">
        <Reveal as="div" className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-700">
            Directorio público
          </p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-ink-900 tracking-tight">
            Proveedores industriales verificados
          </h1>
          <p className="mt-2 text-ink-600 max-w-3xl">
            Cada RFC de este directorio se valida automáticamente contra las 6 listas oficiales del SAT (Artículo 69 del CFF + lista 69-B de EFOS), con actualización diaria.
          </p>
          <div className="mt-4 flex items-center gap-4 text-xs font-mono uppercase tracking-wider text-ink-500">
            <span className="tabular-nums">
              <strong className="text-ink-900">{proveedores.length}</strong> proveedores
            </span>
            <span className="text-ink-300">·</span>
            <span className="tabular-nums">
              <strong className="text-ink-900">{categorias.length}</strong> categorías
            </span>
            {hayFiltrosActivos && (
              <>
                <span className="text-ink-300">·</span>
                <span className="text-brand-700 tabular-nums">
                  {proveedoresFiltrados.length} en vista
                </span>
              </>
            )}
          </div>
        </Reveal>
      </header>

      {/* Filtros sticky */}
      <div className="sticky top-14 z-30 bg-white border-b border-ink-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_240px_200px_auto] gap-3 items-end">
            <Input
              label="Buscar por nombre"
              name="busqueda"
              type="search"
              value={busquedaNombre}
              onChange={(e) => setBusquedaNombre(e.target.value)}
              placeholder="ej: Soldaduras del Golfo"
              prefix={<Search size={16} />}
            />
            <Select
              label="Categoría"
              name="categoria"
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              placeholder="Todas las categorías"
              options={categorias.map((cat) => ({
                value: cat.slug,
                label: cat.icono ? `${cat.icono} ${cat.nombre}` : cat.nombre,
              }))}
            />
            <Select
              label="Estado"
              name="estado"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              placeholder="Todos los estados"
              options={ESTADOS_MEXICO.map((est) => ({ value: est, label: est }))}
            />
            <div className="flex">
              {hayFiltrosActivos ? (
                <button
                  onClick={limpiarFiltros}
                  className="inline-flex items-center gap-1.5 h-10 px-3 rounded text-sm text-ink-600 hover:text-ink-900 hover:bg-ink-50 transition-colors focus:outline-none focus-visible:shadow-focus"
                >
                  <X size={14} />
                  Limpiar
                </button>
              ) : (
                <span className="text-xs text-ink-400 self-end pb-2.5">
                  Sin filtros activos
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Listado */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {cargando && (
          <div className="bg-white border border-ink-200 rounded p-12 flex items-center justify-center text-ink-500 shadow-card">
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

        {!cargando && !error && proveedoresFiltrados.length === 0 && (
          <div className="bg-white border border-dashed border-ink-300 rounded p-12 text-center shadow-card">
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-ink-100 text-ink-500">
              <SearchX size={26} strokeWidth={1.5} />
            </span>
            <h3 className="mt-4 text-lg font-semibold text-ink-900">
              No encontramos proveedores
            </h3>
            <p className="mt-2 text-sm text-ink-600 max-w-md mx-auto">
              {hayFiltrosActivos
                ? "Prueba a ajustar los filtros o limpiar la búsqueda."
                : "Todavía no hay proveedores aprobados en el directorio."}
            </p>
            {hayFiltrosActivos && (
              <button
                onClick={limpiarFiltros}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800"
              >
                <X size={14} />
                Limpiar filtros
              </button>
            )}
          </div>
        )}

        {!cargando && !error && proveedoresFiltrados.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-up">
            {proveedoresFiltrados.map((p) => (
              <ProveedorCard key={p.id} proveedor={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
