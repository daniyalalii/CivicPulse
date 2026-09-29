// ─────────────────────────────────────────────────────────────
// src/components/ui/Textarea.tsx
// Accessible, restrained multiline text input.
// ─────────────────────────────────────────────────────────────
import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helper,
      id,
      className = '',
      rows = 4,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const textareaId = id || generatedId;
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-scale-xs font-medium text-[var(--text-secondary)] select-none"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helper ? helperId : undefined}
          className={`w-full p-3 text-scale-sm bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder-[var(--text-muted)] border rounded-md transition-colors duration-150 focus-ring disabled:opacity-50 disabled:bg-[var(--bg-subtle)] disabled:cursor-not-allowed resize-y ${
            error
              ? 'border-[var(--status-rejected-fg)] focus-visible:outline-[var(--status-rejected-fg)]'
              : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
          } ${className}`}
          {...props}
        />

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

Textarea.displayName = 'Textarea';
