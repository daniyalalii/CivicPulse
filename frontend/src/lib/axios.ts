// ─────────────────────────────────────────────────────────────
// src/lib/axios.ts
// Typed Axios instance. Base URL from VITE_API_BASE_URL env var.
// ─────────────────────────────────────────────────────────────
import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';

const envUrl = import.meta.env.VITE_API_BASE_URL;
const baseURL = typeof envUrl === 'string' && envUrl.trim() !== '' ? envUrl.trim() : '';

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// ── Response interceptor: global error handling ────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const data   = error.response?.data as Record<string, unknown> | undefined;

    if (!error.response) {
      // Network / CORS error
      toast.error('Cannot reach the server. Is the backend running?');
      return Promise.reject(error);
    }

    // 409 – InvalidStatusTransition (show inline, not toast)
    if (status === 409) return Promise.reject(error);

    // 404 – shown inline by the caller
    if (status === 404) return Promise.reject(error);

    // 422 – validation error: extract first message
    if (status === 422) {
      const detail = (data?.detail as Array<{ msg: string }> | undefined);
      const msg = detail?.[0]?.msg ?? 'Validation error';
      toast.error(`Validation: ${msg}`);
      return Promise.reject(error);
    }

    // 429 – rate limited
    if (status === 429) {
      const retryAfter = error.response.headers['retry-after'] ?? '60';
      toast.error(`Rate limited — try again in ${retryAfter}s`);
      return Promise.reject(error);
    }

    // 5xx
    if (status && status >= 500) {
      toast.error(`Server error (${status}). Check the backend logs.`);
      return Promise.reject(error);
    }

    // Fallback
    const msg = (data?.detail as string | undefined) ?? error.message;
    toast.error(msg);
    return Promise.reject(error);
  }
);
