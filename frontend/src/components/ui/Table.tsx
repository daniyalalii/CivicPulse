// ─────────────────────────────────────────────────────────────
// src/components/ui/Table.tsx
// Information-dense, accessible data table (Linear / Stripe style).
// ─────────────────────────────────────────────────────────────
import { type HTMLAttributes, type TdHTMLAttributes, type ThHTMLAttributes } from 'react';

export function Table({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-surface)]">
      <table className={`w-full text-left border-collapse text-scale-sm ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={`bg-[var(--bg-subtle)] border-b border-[var(--border-subtle)] text-scale-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider select-none ${className}`}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableBody({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={`divide-y divide-[var(--border-subtle)] ${className}`} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({
  children,
  className = '',
  isClickable = false,
  ...props
}: HTMLAttributes<HTMLTableRowElement> & { isClickable?: boolean }) {
  return (
    <tr
      className={`transition-colors ${
        isClickable
          ? 'hover:bg-[var(--bg-subtle)] cursor-pointer'
          : 'hover:bg-[var(--bg-subtle)]/50'
      } ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({
  children,
  className = '',
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={`px-4 py-3 text-left font-medium text-[var(--text-secondary)] ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({
  children,
  className = '',
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={`px-4 py-3 text-[var(--text-primary)] align-middle ${className}`}
      {...props}
    >
      {children}
    </td>
  );
}
