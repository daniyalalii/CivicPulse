// ─────────────────────────────────────────────────────────────
// src/lib/queryClient.ts
// TanStack Query client with sensible defaults for a triage app.
// ─────────────────────────────────────────────────────────────
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:       30_000,   // 30 s — complaints don't change that fast
      gcTime:          5 * 60_000, // 5 min
      retry:           2,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
