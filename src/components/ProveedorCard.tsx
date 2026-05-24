/**
 * ProveedorCard.tsx
 * Tarjeta visual de un proveedor en el listado del directorio.
 * 
 * Muestra SOLO datos públicos. Para ver contactos (teléfono, email),
 * el usuario tendrá que pagar suscripción (Fase 2).
 */

import { Link } from "react-router-dom";
import type { ProveedorPublico, ProveedorTier } from "../services/rqmarketApi";

interface Props {
  proveedor: ProveedorPublico;
}

// Estilos por tier (Bronze / Silver / Gold)
const TIER_STYLES: Record<ProveedorTier, { bg: string; text: string; emoji: string; label: string }> = {
  bronze: {
    bg: "bg-amber-100",
    text: "text-amber-800",
    emoji: "🥉",
    label: "Bronze",
  },
  silver: {
    bg: "bg-slate-200",
    text: "text-slate-700",
    emoji: "🥈",
    label: "Silver",
  },
  gold: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    emoji: "🥇",
    label: "Gold",
  },
};

export default function ProveedorCard({ proveedor }: Props) {
  const tier = TIER_STYLES[proveedor.tier] || TIER_STYLES.bronze;

  return (
    <article className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 p-5 flex flex-col h-full">
      {/* Encabezado */}
      <header className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900 leading-tight">
            {proveedor.nombre_comercial}
          </h3>
          <p className="text-xs text-gray-500 mt-1 font-mono">{proveedor.rfc_publico}</p>
        </div>

        {/* Badge de tier */}
        <span
          className={`${tier.bg} ${tier.text} text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ml-2`}
          title={`Tier ${tier.label}`}
        >
          {tier.emoji} {tier.label}
        </span>
      </header>

      {/* Descripción */}
      {proveedor.descripcion_corta && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{proveedor.descripcion_corta}</p>
      )}

      {/* Ubicación */}
      <div className="text-sm text-gray-700 mb-3 flex items-center gap-1">
        <span>📍</span>
        <span>
          {proveedor.ciudad}, {proveedor.estado}
        </span>
      </div>

      {/* Categorías */}
      <div className="flex flex-wrap gap-1 mb-3">
        {proveedor.categorias.slice(0, 3).map((cat) => (
          <span
            key={cat}
            className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded"
          >
            {cat}
          </span>
        ))}
        {proveedor.categorias.length > 3 && (
          <span className="text-xs text-gray-500 px-1">
            +{proveedor.categorias.length - 3}
          </span>
        )}
      </div>

      {/* Indicadores de verificación */}
      <div className="flex gap-3 text-xs text-gray-600 mb-3">
        {proveedor.verificacion_rfc && (
          <span title="RFC verificado contra SAT" className="flex items-center gap-1">
            <span className="text-green-600">✓</span> RFC
          </span>
        )}
        {proveedor.verificacion_csf && (
          <span title="Constancia de Situación Fiscal verificada" className="flex items-center gap-1">
            <span className="text-green-600">✓</span> CSF
          </span>
        )}
        {proveedor.año_fundacion && (
          <span title="Año de fundación">
            🗓️ Desde {proveedor.año_fundacion}
          </span>
        )}
      </div>

      {/* Métricas y CTA */}
      <footer className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {proveedor.transacciones_completadas > 0 ? (
            <span>{proveedor.transacciones_completadas} transacciones</span>
          ) : (
            <span className="text-gray-400">Nuevo en RQ MARKET</span>
          )}
        </div>
        <Link
          to={`/directorio/${proveedor.id}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          Ver detalle →
        </Link>
      </footer>
    </article>
  );
}
