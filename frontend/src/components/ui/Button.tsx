// ─────────────────────────────────────────────────────────────
// src/components/ui/Button.tsx
// Accessible, restrained button with primary, secondary, ghost, danger variants.
// ─────────────────────────────────────────────────────────────
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'md',
      loading = false,
      icon,
      children,
      disabled,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    // Size styles
    const sizeClasses = {
      sm: 'h-8 px-2.5 text-scale-xs font-medium gap-1.5 rounded-md',
      md: 'h-9 px-3.5 text-scale-sm font-medium gap-2 rounded-md',
      lg: 'h-10 px-4 text-scale-base font-medium gap-2.5 rounded-lg',
    }[size];

    // Variant styles
    const variantClasses = {
      primary:
        'bg-[var(--primary)] text-[var(--primary-fg)] border border-[var(--primary)] hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)] shadow-sm disabled:opacity-50 disabled:pointer-events-none',
      secondary:
        'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-subtle)] hover:border-[var(--border-strong)] active:bg-[var(--bg-muted)] shadow-sm disabled:opacity-50 disabled:pointer-events-none',
      ghost:
        'bg-transparent text-[var(--text-secondary)] border border-transparent hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] active:bg-[var(--bg-muted)] disabled:opacity-50 disabled:pointer-events-none',
      danger:
        'bg-[var(--status-rejected-bg)] text-[var(--status-rejected-fg)] border border-[var(--status-rejected-border)] hover:opacity-90 active:opacity-100 disabled:opacity-50 disabled:pointer-events-none',
    }[variant];

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={`inline-flex items-center justify-center select-none transition-colors duration-150 focus-ring cursor-pointer ${sizeClasses} ${variantClasses} ${className}`}
        {...props}
      >
        {loading ? (
          <Loader2 className="animate-spin text-current" size={size === 'sm' ? 14 : 16} />
        ) : (
          icon && <span className="inline-flex shrink-0">{icon}</span>
        )}
        {children && <span>{children}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
