// ─────────────────────────────────────────────────────────────
// src/hooks/useDocumentTitle.ts
// Hook to keep document titles consistent across all pages.
// ─────────────────────────────────────────────────────────────
import { useEffect } from 'react';

export function useDocumentTitle(title: string) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = `${title} | CivicPulse`;
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
}
