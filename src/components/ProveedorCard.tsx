/**
 * ProveedorCard.tsx
 * Tarjeta visual de un proveedor en el listado del directorio.
 *
 * Muestra SOLO datos públicos. Para ver contactos (teléfono, email),
 * el usuario tendrá que pagar suscripción (Fase 2).
 */

import { Link } from "react-router-dom";
import { MapPin, ShieldCheck, FileCheck2, Calendar, ArrowRight } from "lucide-react";
import type { ProveedorPublico } from "../services/rqmarketApi";
import { TierBadge } from "./ui/Badge";

interface Props {
  proveedor: ProveedorPublico;
}

export default function ProveedorCard({ proveedor }: Props) {
  const inicial = proveedor.nombre_comercial.charAt(0).toUpperCase();

  return (
    <Link
      to={`/directorio/${proveedor.id}`}
      className="group bg-white border border-ink-200 rounded p-5 flex flex-col h-full hover:border-brand-500 transition-colors focus:outline-none focus-visible:shadow-focus"
    >
      <header className="flex items-start gap-3 mb-3">
        {/* Avatar/Inicial */}
        <div className="shrink-0 w-10 h-10 rounded bg-ink-100 border border-ink-200 flex items-center justify-center font-mono text-sm font-semibold text-ink-700 group-hover:bg-brand-50 group-hover:border-brand-200 group-hover:text-brand-700 transition-colors">
          {inicial}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base text-ink-900 leading-tight truncate group-hover:text-brand-700 transition-colors">
            {proveedor.nombre_comercial}
          </h3>
          <p className="text-xs text-ink-500 mt-0.5 font-mono tabular-nums">{proveedor.rfc_publico}</p>
        </div>
        <TierBadge tier={proveedor.tier} size="sm" />
      </header>

      {/* Descripción */}
      {proveedor.descripcion_corta && (
        <p className="text-sm text-ink-600 mb-3 line-clamp-2 leading-snug">
          {proveedor.descripcion_corta}
        </p>
      )}

      {/* Ubicación */}
      <div className="text-sm text-ink-700 mb-3 flex items-center gap-1.5">
        <MapPin size={14} className="text-ink-400 shrink-0" />
        <span>
          {proveedor.ciudad}
          <span className="text-ink-400">, </span>
          <span className="text-ink-500">{proveedor.estado}</span>
        </span>
      </div>

      {/* Categorías */}
      {proveedor.categorias.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {proveedor.categorias.slice(0, 3).map((cat) => (
            <span
              key={cat}
              className="inline-flex items-center bg-ink-50 text-ink-700 text-xs px-2 py-0.5 rounded border border-ink-200"
            >
              {cat}
            </span>
          ))}
          {proveedor.categorias.length > 3 && (
            <span className="inline-flex items-center text-xs text-ink-500 px-1">
              +{proveedor.categorias.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Indicadores de verificación */}
      <div className="flex flex-wrap gap-3 text-xs text-ink-600 mb-3">
        {proveedor.verificacion_rfc && (
          <span title="RFC verificado contra SAT" className="inline-flex items-center gap-1">
            <ShieldCheck size={12} className="text-success" /> RFC
          </span>
        )}
        {proveedor.verificacion_csf && (
          <span title="Constancia de Situación Fiscal verificada" className="inline-flex items-center gap-1">
            <FileCheck2 size={12} className="text-success" /> CSF
          </span>
        )}
        {proveedor.año_fundacion && (
          <span title="Año de fundación" className="inline-flex items-center gap-1 text-ink-500">
            <Calendar size={12} /> Desde {proveedor.año_fundacion}
          </span>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-auto pt-3 border-t border-ink-200 flex items-center justify-between">
        <div className="text-xs text-ink-500 font-mono">
          {proveedor.transacciones_completadas > 0 ? (
            <span className="tabular-nums">{proveedor.transacciones_completadas} transacciones</span>
          ) : (
            <span className="text-ink-400">Nuevo en RQ MARKET</span>
          )}
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 group-hover:text-brand-800">
          Ver detalle
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </footer>
    </Link>
  );
}
