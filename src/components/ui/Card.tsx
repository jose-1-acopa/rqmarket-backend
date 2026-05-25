/**
 * Card.tsx
 *
 * Contenedor con padding y borde consistente.
 *
 * Uso simple:
 *   <Card>contenido</Card>
 *
 * Uso con sub-componentes:
 *   <Card>
 *     <CardHeader title="Mi título" description="Descripción" />
 *     <CardBody>contenido principal</CardBody>
 *     <CardFooter>acciones</CardFooter>
 *   </Card>
 */

import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outlined" | "elevated";
  padding?: "none" | "sm" | "md" | "lg";
}

const variantStyles = {
  default:  "bg-white border border-ink-200",
  outlined: "bg-transparent border border-ink-300",
  elevated: "bg-white border border-ink-200 shadow-md",
};

const paddingStyles = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-8",
};

export function Card({
  variant = "default",
  padding = "md",
  className = "",
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={`
        rounded-lg
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${className}
      `}
      {...rest}
    >
      {children}
    </div>
  );
}

// ── Sub-componentes ────────────────────────────────────────────────

interface CardHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ title, description, action, className = "" }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between mb-4 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
        {description && (
          <p className="text-sm text-ink-500 mt-1">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardBody({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`mt-5 pt-4 border-t border-ink-200 flex items-center justify-end gap-2 ${className}`}>
      {children}
    </div>
  );
}
