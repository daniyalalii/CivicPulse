// ─────────────────────────────────────────────────────────────
// src/api/system.ts
// System / meta endpoints from backend/app/routes/system.py
// ─────────────────────────────────────────────────────────────
import { apiClient } from '../lib/axios';
import type { ProviderMeta } from '../types';

// GET /health  →  200 {status, service}
export async function getHealth(): Promise<{ status: string; service: string }> {
  const { data } = await apiClient.get<{ status: string; service: string }>('/health');
  return data;
}

// GET /ready  →  200 {status, database} | 503 text
export async function getReady(): Promise<{ status: string; database: string }> {
  const { data } = await apiClient.get<{ status: string; database: string }>('/ready');
  return data;
}

// GET /api/meta/providers  →  200 ProviderMeta
export async function getProviderMeta(): Promise<ProviderMeta> {
  const { data } = await apiClient.get<ProviderMeta>('/api/meta/providers');
  return data;
}
