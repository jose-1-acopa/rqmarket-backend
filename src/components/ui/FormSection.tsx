import type { HTMLAttributes, ReactNode } from "react";

interface FormSectionProps extends HTMLAttributes<HTMLElement> {
  step?: number | string;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  columns?: 1 | 2;
}

export function FormSection({
  step,
  title,
  description,
  children,
  columns = 2,
  className = "",
  ...rest
}: FormSectionProps) {
  return (
    <section
      className={`border-t border-ink-200 pt-8 first:border-t-0 first:pt-0 ${className}`}
      {...rest}
    >
      <header className="mb-6">
        <div className="flex items-baseline gap-3">
          {step !== undefined && (
            <span className="font-mono text-xs uppercase tracking-wider text-brand-700">
              Paso {step}
            </span>
          )}
          <h2 className="text-xl font-semibold text-ink-900">{title}</h2>
        </div>
        {description && (
          <p className="text-sm text-ink-500 mt-1.5 max-w-2xl">{description}</p>
        )}
      </header>
      <div
        className={
          columns === 2
            ? "grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5"
            : "flex flex-col gap-5"
        }
      >
        {children}
      </div>
    </section>
  );
}

interface FormFieldSpanProps {
  children: ReactNode;
  className?: string;
}

export function FormFieldFull({ children, className = "" }: FormFieldSpanProps) {
  return <div className={`md:col-span-2 ${className}`}>{children}</div>;
}
