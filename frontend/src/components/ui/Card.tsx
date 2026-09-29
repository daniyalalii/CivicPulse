// ─────────────────────────────────────────────────────────────
// src/components/ui/Card.tsx
// Restrained, 1px bordered card container with header, content, and footer.
// ─────────────────────────────────────────────────────────────
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] transition-colors ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

export function CardHeader({
  title,
  description,
  action,
  children,
  className = '',
}: {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`px-5 py-4 border-b border-[var(--border-subtle)] flex items-start justify-between gap-4 ${className}`}
    >
      <div>
        {title && (
          <h3 className="text-scale-base font-semibold text-[var(--text-primary)] tracking-tight">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-scale-xs text-[var(--text-secondary)] mt-0.5">
            {description}
          </p>
        )}
        {children}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardContent({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}

export function CardFooter({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`px-5 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-subtle)] rounded-b-lg flex items-center justify-between text-scale-xs text-[var(--text-secondary)] ${className}`}
    >
      {children}
    </div>
  );
}
