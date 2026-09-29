// ─────────────────────────────────────────────────────────────
// src/api/complaints.ts
// One typed function per backend endpoint.
// All paths match backend/app/routes/complaints.py exactly.
// ─────────────────────────────────────────────────────────────
import { apiClient } from '../lib/axios';
import type {
  ComplaintCreate,
  ComplaintListParams,
  ComplaintListResponse,
  ComplaintResponse,
  ComplaintStatusUpdate,
  StatsResponse,
} from '../types';

// POST /api/complaints  →  201 ComplaintResponse
export async function createComplaint(payload: ComplaintCreate): Promise<ComplaintResponse> {
  const { data } = await apiClient.post<ComplaintResponse>('/api/complaints', payload);
  return data;
}

// GET /api/complaints  →  200 ComplaintListResponse
export async function listComplaints(params: ComplaintListParams = {}): Promise<ComplaintListResponse> {
  // Strip undefined values so they don't appear as "undefined" query strings
  const clean: Record<string, string | number> = {};
  if (params.category)  clean.category  = params.category;
  if (params.priority)  clean.priority  = params.priority;
  if (params.status)    clean.status    = params.status;
  if (params.page)      clean.page      = params.page;
  if (params.page_size) clean.page_size = params.page_size;

  const { data } = await apiClient.get<ComplaintListResponse>('/api/complaints', { params: clean });
  return data;
}

// GET /api/complaints/:id  →  200 ComplaintResponse
export async function getComplaint(id: string): Promise<ComplaintResponse> {
  const { data } = await apiClient.get<ComplaintResponse>(`/api/complaints/${id}`);
  return data;
}

// PATCH /api/complaints/:id/status  →  200 ComplaintResponse
export async function updateComplaintStatus(
  id: string,
  payload: ComplaintStatusUpdate
): Promise<ComplaintResponse> {
  const { data } = await apiClient.patch<ComplaintResponse>(
    `/api/complaints/${id}/status`,
    payload
  );
  return data;
}

// GET /api/stats  →  200 StatsResponse
export async function getStats(): Promise<StatsResponse> {
  const { data } = await apiClient.get<StatsResponse>('/api/stats');
  return data;
}
