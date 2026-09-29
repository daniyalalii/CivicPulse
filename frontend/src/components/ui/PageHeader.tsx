// ─────────────────────────────────────────────────────────────
// src/components/ui/PageHeader.tsx
// Standard civic page header: title, description, and primary action on the right.
// ─────────────────────────────────────────────────────────────
import { type ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  badge,
  actions,
  className = '',
}: PageHeaderProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 mb-6 border-b border-[var(--border-subtle)] ${className}`}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-scale-xl font-bold tracking-tight text-[var(--text-primary)]">
            {title}
          </h1>
          {badge && <span className="shrink-0">{badge}</span>}
        </div>
        {description && (
          <p className="text-scale-sm text-[var(--text-secondary)]">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
