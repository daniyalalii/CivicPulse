// ─────────────────────────────────────────────────────────────
// src/components/ui/Skeleton.tsx
// Subtle, restrained loading placeholder.
// ─────────────────────────────────────────────────────────────
import { type HTMLAttributes } from 'react';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  variant = 'rectangular',
  width,
  height,
  className = '',
  style,
  ...props
}: SkeletonProps) {
  const variantClasses = {
    text: 'h-4 rounded-sm',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  }[variant];

  return (
    <div
      role="status"
      aria-label="Loading..."
      className={`animate-pulse bg-[var(--bg-subtle)] border border-[var(--border-subtle)]/40 ${variantClasses} ${className}`}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  );
}
