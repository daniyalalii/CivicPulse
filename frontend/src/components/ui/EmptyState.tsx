// ─────────────────────────────────────────────────────────────
// src/components/ui/EmptyState.tsx
// Restrained, helpful empty state (GOV.UK / Linear style).
// ─────────────────────────────────────────────────────────────
import { type ReactNode } from 'react';
import { Inbox } from 'lucide-react';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon = <Inbox size={24} className="text-[var(--text-muted)]" />,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 border border-dashed border-[var(--border-subtle)] rounded-lg bg-[var(--bg-surface)] ${className}`}
    >
      <div className="w-11 h-11 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="text-scale-base font-semibold text-[var(--text-primary)]">
        {title}
      </h3>
      <p className="text-scale-sm text-[var(--text-secondary)] mt-1 max-w-sm">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
