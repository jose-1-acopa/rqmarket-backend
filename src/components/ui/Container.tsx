/**
 * Container.tsx
 *
 * Wrapper de página con max-width consistente.
 *
 * Uso:
 *   <Container>contenido</Container>
 *   <Container size="narrow">formulario centrado</Container>
 *   <Container size="wide">dashboard amplio</Container>
 */

import type { HTMLAttributes, ReactNode } from "react";

type Size = "narrow" | "default" | "wide" | "full";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: Size;
  children: ReactNode;
}

const sizeStyles: Record<Size, string> = {
  narrow: "max-w-2xl",   // 672px - formularios, login, registro
  default: "max-w-5xl",  // 1024px - mayoría de páginas
  wide: "max-w-7xl",     // 1280px - dashboards, tablas
  full: "max-w-full",    // sin límite
};

export function Container({
  size = "default",
  className = "",
  children,
  ...rest
}: ContainerProps) {
  return (
    <div
      className={`
        mx-auto
        ${sizeStyles[size]}
        ${className}
      `}
      {...rest}
    >
      {children}
    </div>
  );
}

// ── Section: para dividir áreas de una página ──────────────────────

interface SectionProps extends HTMLAttributes<HTMLElement> {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}

export function Section({
  title,
  description,
  action,
  className = "",
  children,
  ...rest
}: SectionProps) {
  return (
    <section className={`mb-8 ${className}`} {...rest}>
      {(title || action) && (
        <header className="flex items-end justify-between mb-4">
          <div>
            {title && (
              <h2 className="text-2xl font-semibold text-ink-900">{title}</h2>
            )}
            {description && (
              <p className="text-sm text-ink-500 mt-1">{description}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </header>
      )}
      {children}
    </section>
  );
}
