// ─────────────────────────────────────────────────────────────
// src/components/ui/Select.tsx
// Accessible, styled native Select dropdown with chevron indicator.
// ─────────────────────────────────────────────────────────────
import { forwardRef, useId, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helper?: string;
  options?: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helper,
      options,
      children,
      id,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="text-scale-xs font-medium text-[var(--text-secondary)] select-none"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center w-full">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : helper ? helperId : undefined}
            className={`w-full h-9 pl-3 pr-8 text-scale-sm bg-[var(--bg-surface)] text-[var(--text-primary)] border rounded-md appearance-none transition-colors duration-150 focus-ring cursor-pointer disabled:opacity-50 disabled:bg-[var(--bg-subtle)] disabled:cursor-not-allowed ${
              error
                ? 'border-[var(--status-rejected-fg)] focus-visible:outline-[var(--status-rejected-fg)]'
                : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
            } ${className}`}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <ChevronDown
            size={14}
            className="absolute right-3 pointer-events-none text-[var(--text-muted)]"
          />
        </div>

        {error && (
          <p id={errorId} role="alert" className="text-scale-xs text-[var(--status-rejected-fg)] font-medium">
            {error}
          </p>
        )}

        {!error && helper && (
          <p id={helperId} className="text-scale-xs text-[var(--text-muted)]">
            {helper}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
