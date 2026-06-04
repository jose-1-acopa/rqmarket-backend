/**
 * Button.tsx
 *
 * Botón con variantes y tamaños consistentes.
 *
 * Uso:
 *   <Button>Default</Button>
 *   <Button variant="secondary">Cancelar</Button>
 *   <Button variant="danger" size="sm">Eliminar</Button>
 *   <Button loading>Procesando...</Button>
 *   <Button leftIcon={<Icon />}>Con ícono</Button>
 */

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white shadow-sm hover:bg-brand-700 hover:shadow-card-hover hover:-translate-y-px active:bg-brand-800 active:translate-y-0 active:shadow-sm",
  secondary:
    "bg-white text-ink-900 border border-ink-300 shadow-sm hover:bg-ink-50 hover:border-ink-400 hover:shadow-md hover:-translate-y-px active:bg-ink-100 active:translate-y-0 active:shadow-sm",
  ghost:
    "bg-transparent text-ink-700 hover:bg-ink-100 active:bg-ink-200",
  danger:
    "bg-danger text-white shadow-sm hover:opacity-90 hover:shadow-card-hover hover:-translate-y-px active:opacity-80 active:translate-y-0 active:shadow-sm",
};

const sizeStyles: Record<Size, string> = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-11 px-4 text-base gap-2",
  lg: "h-12 px-6 text-lg gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      className = "",
      ...rest
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center
          font-medium rounded
          transition duration-150
          disabled:opacity-50 disabled:cursor-not-allowed
          disabled:hover:translate-y-0 disabled:hover:shadow-sm
          focus:outline-none focus-visible:shadow-focus
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? "w-full" : ""}
          ${className}
        `}
        {...rest}
      >
        {loading && <Spinner size={size} />}
        {!loading && leftIcon && <span>{leftIcon}</span>}
        <span>{children}</span>
        {!loading && rightIcon && <span>{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";

// ── Spinner interno para estado loading ────────────────────────────

function Spinner({ size }: { size: Size }) {
  const dimensions = size === "sm" ? 14 : size === "lg" ? 20 : 16;
  return (
    <svg
      width={dimensions}
      height={dimensions}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="animate-spin"
    >
      <path
        d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
