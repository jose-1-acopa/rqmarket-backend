/**
 * Input.tsx
 *
 * Inputs unificados: text, email, tel, number, password.
 * Incluye label, error, hint, y prefix/suffix opcionales.
 *
 * Uso:
 *   <Input label="Email" type="email" required />
 *   <Input label="RFC" maxLength={13} error="RFC inválido" />
 *   <Input label="Precio" type="number" prefix="$" suffix="MXN" />
 */

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      hint,
      error,
      prefix,
      suffix,
      fullWidth = true,
      className = "",
      ...rest
    },
    ref
  ) => {
    const id = rest.id || rest.name;
    const tieneError = !!error;

    return (
      <div className={fullWidth ? "w-full" : "inline-block"}>
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-ink-700 mb-1.5">
            {label}
            {rest.required && <span className="text-danger ml-0.5">*</span>}
          </label>
        )}

        <div
          className={`
            flex items-center
            bg-white
            border rounded
            transition-colors
            ${tieneError ? "border-danger" : "border-ink-300 hover:border-ink-400"}
            focus-within:shadow-focus
            ${tieneError ? "focus-within:border-danger" : "focus-within:border-brand-500"}
          `}
        >
          {prefix && (
            <span className="pl-3 text-ink-500 text-sm select-none">{prefix}</span>
          )}
          <input
            ref={ref}
            id={id}
            className={`
              flex-1 px-3 py-2 text-base bg-transparent
              focus:outline-none
              placeholder:text-ink-400
              disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-500
              ${className}
            `}
            {...rest}
          />
          {suffix && (
            <span className="pr-3 text-ink-500 text-sm select-none">{suffix}</span>
          )}
        </div>

        {error ? (
          <p className="mt-1 text-xs text-danger">{error}</p>
        ) : hint ? (
          <p className="mt-1 text-xs text-ink-500">{hint}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";

// ── Select ──────────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      hint,
      error,
      options,
      placeholder,
      fullWidth = true,
      className = "",
      ...rest
    },
    ref
  ) => {
    const id = rest.id || rest.name;
    const tieneError = !!error;

    return (
      <div className={fullWidth ? "w-full" : "inline-block"}>
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-ink-700 mb-1.5">
            {label}
            {rest.required && <span className="text-danger ml-0.5">*</span>}
          </label>
        )}

        <div
          className={`
            relative
            bg-white
            border rounded
            transition-colors
            ${tieneError ? "border-danger" : "border-ink-300 hover:border-ink-400"}
            focus-within:shadow-focus
            ${tieneError ? "focus-within:border-danger" : "focus-within:border-brand-500"}
          `}
        >
          <select
            ref={ref}
            id={id}
            className={`
              w-full px-3 py-2 text-base bg-transparent appearance-none cursor-pointer
              focus:outline-none
              disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-500
              pr-8
              ${className}
            `}
            {...rest}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-500"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {error ? (
          <p className="mt-1 text-xs text-danger">{error}</p>
        ) : hint ? (
          <p className="mt-1 text-xs text-ink-500">{hint}</p>
        ) : null}
      </div>
    );
  }
);
Select.displayName = "Select";

// ── Textarea ────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      hint,
      error,
      fullWidth = true,
      className = "",
      ...rest
    },
    ref
  ) => {
    const id = rest.id || rest.name;
    const tieneError = !!error;

    return (
      <div className={fullWidth ? "w-full" : "inline-block"}>
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-ink-700 mb-1.5">
            {label}
            {rest.required && <span className="text-danger ml-0.5">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={id}
          className={`
            w-full px-3 py-2 text-base bg-white
            border rounded
            transition-colors
            ${tieneError ? "border-danger" : "border-ink-300 hover:border-ink-400"}
            focus:outline-none focus:shadow-focus
            ${tieneError ? "focus:border-danger" : "focus:border-brand-500"}
            placeholder:text-ink-400
            disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-500
            resize-y
            ${className}
          `}
          {...rest}
        />

        {error ? (
          <p className="mt-1 text-xs text-danger">{error}</p>
        ) : hint ? (
          <p className="mt-1 text-xs text-ink-500">{hint}</p>
        ) : null}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
