// ─────────────────────────────────────────────────────────────
// src/components/ui/Input.tsx
// Accessible, restrained form input with label, error, helper, and icon slots.
// ─────────────────────────────────────────────────────────────
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helper,
      leftIcon,
      rightIcon,
      id,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-scale-xs font-medium text-[var(--text-secondary)] select-none"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-[var(--text-muted)]">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : helper ? helperId : undefined}
            className={`w-full h-9 px-3 text-scale-sm bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder-[var(--text-muted)] border rounded-md transition-colors duration-150 focus-ring disabled:opacity-50 disabled:bg-[var(--bg-subtle)] disabled:cursor-not-allowed ${
              leftIcon ? 'pl-9' : ''
            } ${rightIcon ? 'pr-9' : ''} ${
              error
                ? 'border-[var(--status-rejected-fg)] focus-visible:outline-[var(--status-rejected-fg)]'
                : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
            } ${className}`}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 flex items-center text-[var(--text-muted)]">
              {rightIcon}
            </div>
          )}
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

Input.displayName = 'Input';
