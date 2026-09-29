// ─────────────────────────────────────────────────────────────
// src/components/ui/Toast.tsx
// Theme-aligned Toaster configuration for react-hot-toast.
// ─────────────────────────────────────────────────────────────
import { Toaster as HotToaster } from 'react-hot-toast';

export function Toaster() {
  return (
    <HotToaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--bg-surface)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-md)',
          fontSize: '0.875rem',
          padding: '10px 14px',
        },
        success: {
          iconTheme: {
            primary: 'var(--status-resolved-fg)',
            secondary: 'var(--bg-surface)',
          },
        },
        error: {
          iconTheme: {
            primary: 'var(--status-rejected-fg)',
            secondary: 'var(--bg-surface)',
          },
        },
      }}
    />
  );
}
