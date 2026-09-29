// ─────────────────────────────────────────────────────────────
// src/hooks/useComplaints.ts
// One TanStack Query hook per endpoint.
// ─────────────────────────────────────────────────────────────
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  createComplaint,
  getComplaint,
  getStats,
  listComplaints,
  updateComplaintStatus,
} from '../api/complaints';
import type {
  ComplaintCreate,
  ComplaintListParams,
  ComplaintStatusUpdate,
} from '../types';

// ── Query keys ─────────────────────────────────────────────────
export const complaintsKeys = {
  all:    () => ['complaints']                       as const,
  list:   (p: ComplaintListParams) => ['complaints', 'list', p] as const,
  detail: (id: string)             => ['complaints', 'detail', id] as const,
  stats:  ()                       => ['complaints', 'stats'] as const,
};

// ── GET /api/complaints ────────────────────────────────────────
export function useComplaints(params: ComplaintListParams = {}) {
  return useQuery({
    queryKey: complaintsKeys.list(params),
    queryFn:  () => listComplaints(params),
  });
}

// ── GET /api/complaints/:id ────────────────────────────────────
export function useComplaint(id: string | undefined) {
  return useQuery({
    queryKey: complaintsKeys.detail(id ?? ''),
    queryFn:  () => getComplaint(id!),
    enabled:  !!id,
  });
}

// ── GET /api/stats ─────────────────────────────────────────────
export function useStats() {
  return useQuery({
    queryKey:  complaintsKeys.stats(),
    queryFn:   getStats,
    staleTime: 60_000,   // stats can be slightly stale
  });
}

// ── POST /api/complaints ───────────────────────────────────────
export function useCreateComplaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ComplaintCreate) => createComplaint(payload),
    onSuccess: () => {
      toast.success('Complaint submitted successfully!');
      // Invalidate list & stats so they refetch
      qc.invalidateQueries({ queryKey: complaintsKeys.all() });
      qc.invalidateQueries({ queryKey: complaintsKeys.stats() });
    },
  });
}

// ── PATCH /api/complaints/:id/status ──────────────────────────
export function useUpdateComplaintStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ComplaintStatusUpdate) => updateComplaintStatus(id, payload),
    onMutate: async (newStatusPayload) => {
      // Cancel any outgoing refetches
      await qc.cancelQueries({ queryKey: complaintsKeys.detail(id) });

      // Snapshot the previous complaint
      const previousComplaint = qc.getQueryData<import('../types').ComplaintResponse>(complaintsKeys.detail(id));

      // Optimistically update
      if (previousComplaint) {
        qc.setQueryData<import('../types').ComplaintResponse>(complaintsKeys.detail(id), {
          ...previousComplaint,
          status: newStatusPayload.status,
          updated_at: new Date().toISOString(),
        });
      }

      return { previousComplaint };
    },
    onError: (error: unknown, _vars, context) => {
      // Roll back to previous snapshot
      if (context?.previousComplaint) {
        qc.setQueryData(complaintsKeys.detail(id), context.previousComplaint);
      }
      const axiosError = error as { response?: { status?: number; data?: { detail?: string } } };
      if (axiosError?.response?.status === 409) {
        toast.error(axiosError.response.data?.detail ?? 'Invalid status transition');
      } else {
        toast.error('Status update failed. Changes reverted.');
      }
    },
    onSuccess: (updated) => {
      toast.success(`Status updated to ${updated.status.replace('_', ' ')}`);
      qc.setQueryData(complaintsKeys.detail(id), updated);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: complaintsKeys.detail(id) });
      qc.invalidateQueries({ queryKey: complaintsKeys.all() });
      qc.invalidateQueries({ queryKey: complaintsKeys.stats() });
    },
  });
}
