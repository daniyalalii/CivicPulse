// ─────────────────────────────────────────────────────────────
// src/types/index.ts
// TypeScript types mirroring the backend schemas EXACTLY.
// Source of truth: backend/app/routes/schemas.py + domain.py
// ─────────────────────────────────────────────────────────────

// ── Enums ──────────────────────────────────────────────────────
export type Category =
  | 'water'
  | 'electricity'
  | 'sanitation'
  | 'roads'
  | 'streetlights'
  | 'other';

export type Priority = 'high' | 'normal' | 'low';

export type Status = 'open' | 'in_progress' | 'resolved' | 'rejected';

// Allowed transitions (mirrors domain.py ALLOWED_TRANSITIONS)
export const ALLOWED_TRANSITIONS: Record<Status, Status[]> = {
  open:        ['in_progress', 'rejected'],
  in_progress: ['resolved', 'rejected'],
  resolved:    [],
  rejected:    [],
};

// ── Request schemas ────────────────────────────────────────────
export interface ComplaintCreate {
  text: string;             // min 10, max 2000
  location: string;         // min 3, max 200
  reporter_contact?: string | null;  // max 200
}

export interface ComplaintStatusUpdate {
  status: Status;
}

// ── Response schemas ───────────────────────────────────────────
export interface ComplaintResponse {
  id: string;               // UUID
  text: string;
  location: string;
  reporter_contact: string | null;
  category: Category;
  priority: Priority;
  status: Status;
  ai_summary: string | null;     // ≤140 chars, set by AI triage
  triaged_by: string;            // e.g. "groq", "simulated", "rules:fallback"
  triage_latency_ms: number;
  created_at: string | null;     // ISO 8601
  updated_at: string | null;     // ISO 8601
}

export interface ComplaintListResponse {
  items: ComplaintResponse[];
  total: number;
  page: number;
  page_size: number;
}

export interface StatsResponse {
  by_category: Record<string, number>;
  by_priority: Record<string, number>;
  by_status:   Record<string, number>;
  total:       number;
}

export interface ProviderMeta {
  active_provider: string;
  groq_model: string;
  recent_outcomes: unknown[];  // always [] in current backend
}

// ── Error shapes ───────────────────────────────────────────────
export interface AppError {
  detail: string;
  error: 'ComplaintNotFound' | 'InvalidStatusTransition' | 'RateLimited';
}

export interface ValidationError {
  detail: Array<{ loc: string[]; msg: string; type: string }>;
}

// ── List query params ──────────────────────────────────────────
export interface ComplaintListParams {
  category?:  Category;
  priority?:  Priority;
  status?:    Status;
  page?:      number;
  page_size?: number;
}

// ── Auth (client-side only — backend has no auth) ──────────────
export type UserRole = 'citizen' | 'staff';

export interface LocalUser {
  name:  string;
  email: string;
  role:  UserRole;
}
