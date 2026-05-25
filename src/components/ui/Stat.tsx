import type { ReactNode } from "react";

interface StatProps {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: ReactNode;
  icon?: ReactNode;
  accent?: "default" | "brand" | "success" | "warning" | "danger";
}

const accentStyles: Record<NonNullable<StatProps["accent"]>, string> = {
  default: "border-ink-200",
  brand: "border-ink-200 border-l-brand-600 border-l-2",
  success: "border-ink-200 border-l-success border-l-2",
  warning: "border-ink-200 border-l-warning border-l-2",
  danger: "border-ink-200 border-l-danger border-l-2",
};

const trendStyles: Record<NonNullable<StatProps["trend"]>, string> = {
  up: "text-success",
  down: "text-danger",
  neutral: "text-ink-500",
};

const trendSymbol: Record<NonNullable<StatProps["trend"]>, string> = {
  up: "▲",
  down: "▼",
  neutral: "·",
};

export function Stat({
  label,
  value,
  hint,
  trend,
  trendValue,
  icon,
  accent = "default",
}: StatProps) {
  return (
    <div className={`bg-white border ${accentStyles[accent]} rounded p-4`}>
      <div className="flex items-start justify-between gap-3">
        <div className="font-mono text-[11px] uppercase tracking-wider text-ink-500 leading-tight">
          {label}
        </div>
        {icon && <div className="text-ink-400 shrink-0">{icon}</div>}
      </div>
      <div className="mt-2 font-mono text-3xl font-semibold text-ink-900 tabular-nums leading-none">
        {value}
      </div>
      {(hint || trend) && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          {trend && trendValue && (
            <span className={`font-mono font-medium ${trendStyles[trend]}`}>
              {trendSymbol[trend]} {trendValue}
            </span>
          )}
          {hint && <span className="text-ink-500">{hint}</span>}
        </div>
      )}
    </div>
  );
}

interface StatGroupProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

const columnStyles: Record<NonNullable<StatGroupProps["columns"]>, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
};

export function StatGroup({ children, columns = 4, className = "" }: StatGroupProps) {
  return (
    <div className={`grid ${columnStyles[columns]} gap-3 ${className}`}>
      {children}
    </div>
  );
}
