// ─────────────────────────────────────────────────────────────
// src/components/ui/Badge.tsx
// Semantic status, priority, and category badges.
// Clean, professional pills: 12px medium text, px-2.5 py-1, rounded-full,
// soft tinted background with darker text, NO borders.
// ─────────────────────────────────────────────────────────────
import { type ReactNode } from 'react';
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowUp,
  Minus,
  ArrowDown,
} from 'lucide-react';
import type { Category, Priority, Status } from '../../types';
import { getCategoryMeta } from '../../constants/categories';

export interface BadgeProps {
  children?: ReactNode;
  variant?: 'default' | 'open' | 'in_progress' | 'resolved' | 'rejected' | 'high' | 'normal' | 'low';
  icon?: ReactNode;
  className?: string;
}

export function Badge({ children, variant = 'default', icon, className = '' }: BadgeProps) {
  const variantClasses = {
    default:
      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    open:
      'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
    in_progress:
      'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    resolved:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    rejected:
      'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
    high:
      'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300',
    normal:
      'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    low:
      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] leading-none font-medium rounded-full select-none border-0 ${variantClasses} ${className}`}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

// ── Specialized Status Badge ───────────────────────────────────
export function StatusBadge({ status }: { status: Status | string }) {
  switch (status) {
    case 'open':
      return (
        <Badge variant="open" icon={<AlertCircle size={12} />}>
          New
        </Badge>
      );
    case 'in_progress':
      return (
        <Badge variant="in_progress" icon={<Clock size={12} />}>
          In progress
        </Badge>
      );
    case 'resolved':
      return (
        <Badge variant="resolved" icon={<CheckCircle2 size={12} />}>
          Resolved
        </Badge>
      );
    case 'rejected':
      return (
        <Badge variant="rejected" icon={<XCircle size={12} />}>
          Rejected
        </Badge>
      );
    default:
      return (
        <Badge variant="default" icon={<HelpCircle size={12} />}>
          {status}
        </Badge>
      );
  }
}

// ── Specialized Priority Badge ─────────────────────────────────
export function PriorityBadge({ priority }: { priority: Priority | string }) {
  switch (priority) {
    case 'high':
      return (
        <Badge variant="high" icon={<ArrowUp size={12} />}>
          High
        </Badge>
      );
    case 'normal':
      return (
        <Badge variant="normal" icon={<Minus size={12} />}>
          Normal
        </Badge>
      );
    case 'low':
      return (
        <Badge variant="low" icon={<ArrowDown size={12} />}>
          Low
        </Badge>
      );
    default:
      return (
        <Badge variant="default">
          {priority}
        </Badge>
      );
  }
}

// ── Specialized Category Badge ─────────────────────────────────
export function CategoryBadge({ category }: { category: Category | string }) {
  const meta = getCategoryMeta(category);
  const Icon = meta.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] leading-none font-medium rounded-full select-none border-0 ${meta.bgClass} ${meta.textClass}`}
    >
      <Icon size={12} className="shrink-0" />
      {meta.label}
    </span>
  );
}
