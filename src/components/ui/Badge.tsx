/**
 * Badge.tsx
 *
 * Etiqueta visual para estados, categorías, tiers, etc.
 *
 * Uso:
 *   <Badge>default</Badge>
 *   <Badge variant="success">Aprobado</Badge>
 *   <Badge variant="warning">Pendiente</Badge>
 *   <Badge variant="brand" size="lg">Premium</Badge>
 *   <Badge icon={<Icon />}>Con ícono</Badge>
 */

import type { HTMLAttributes, ReactNode } from "react";

type Variant = "default" | "brand" | "success" | "warning" | "danger" | "neutral";
type Size = "sm" | "md" | "lg";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
}

const variantStyles: Record<Variant, string> = {
  default: "bg-ink-100 text-ink-700 border-ink-200",
  brand:   "bg-brand-100 text-brand-700 border-brand-200",
  success: "bg-success-bg text-success border-success-border",
  warning: "bg-warning-bg text-warning border-warning-border",
  danger:  "bg-danger-bg text-danger border-danger-border",
  neutral: "bg-white text-ink-700 border-ink-300",
};

const sizeStyles: Record<Size, string> = {
  sm: "text-xs px-1.5 py-0.5 gap-1",
  md: "text-xs px-2 py-1 gap-1.5",
  lg: "text-sm px-2.5 py-1 gap-1.5",
};

export function Badge({
  variant = "default",
  size = "md",
  icon,
  children,
  className = "",
  ...rest
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center
        font-medium rounded-md border
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...rest}
    >
      {icon && <span className="flex items-center">{icon}</span>}
      {children}
    </span>
  );
}

// ── Badge específico para tiers de proveedor ──────────────────────

type ProveedorTier = "bronze" | "silver" | "gold";

interface TierBadgeProps {
  tier: ProveedorTier;
  size?: Size;
}

const tierConfig: Record<ProveedorTier, { label: string; emoji: string; classes: string }> = {
  bronze: {
    label: "Bronze",
    emoji: "🥉",
    classes: "bg-amber-50 text-amber-800 border-amber-200",
  },
  silver: {
    label: "Silver",
    emoji: "🥈",
    classes: "bg-slate-100 text-slate-700 border-slate-300",
  },
  gold: {
    label: "Gold",
    emoji: "🥇",
    classes: "bg-yellow-50 text-yellow-800 border-yellow-300",
  },
};

export function TierBadge({ tier, size = "md" }: TierBadgeProps) {
  const cfg = tierConfig[tier];
  return (
    <span
      className={`
        inline-flex items-center
        font-medium rounded-md border
        ${cfg.classes}
        ${sizeStyles[size]}
      `}
      title={`Nivel de verificación ${cfg.label}`}
    >
      <span>{cfg.emoji}</span>
      <span>{cfg.label}</span>
    </span>
  );
}

// ── Badge específico para estado de verificación ──────────────────

type EstadoVerificacion = "pendiente" | "aprobado" | "rechazado";

interface EstadoBadgeProps {
  estado: EstadoVerificacion;
  size?: Size;
}

const estadoConfig: Record<EstadoVerificacion, { label: string; variant: Variant }> = {
  pendiente: { label: "Pendiente", variant: "warning" },
  aprobado:  { label: "Aprobado", variant: "success" },
  rechazado: { label: "Rechazado", variant: "danger" },
};

export function EstadoBadge({ estado, size = "md" }: EstadoBadgeProps) {
  const cfg = estadoConfig[estado];
  return (
    <Badge variant={cfg.variant} size={size}>
      {cfg.label}
    </Badge>
  );
}
