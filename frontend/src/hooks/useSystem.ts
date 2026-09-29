// ─────────────────────────────────────────────────────────────
// src/hooks/useSystem.ts
// TanStack Query hooks for system endpoints.
// ─────────────────────────────────────────────────────────────
import { useQuery } from '@tanstack/react-query';
import { getHealth, getProviderMeta, getReady } from '../api/system';

export const systemKeys = {
  health:   () => ['system', 'health']    as const,
  ready:    () => ['system', 'ready']     as const,
  provider: () => ['system', 'provider']  as const,
};

export function useHealth() {
  return useQuery({
    queryKey:         systemKeys.health(),
    queryFn:          getHealth,
    staleTime:        10_000,
    refetchInterval:  30_000,   // poll every 30 s for liveness indicator
    retry:            1,
  });
}

export function useReady() {
  return useQuery({
    queryKey:         systemKeys.ready(),
    queryFn:          getReady,
    staleTime:        10_000,
    refetchInterval:  30_000,
    retry:            1,
  });
}

export function useProviderMeta() {
  return useQuery({
    queryKey: systemKeys.provider(),
    queryFn:  getProviderMeta,
    staleTime: 60_000,
  });
}
