// ─────────────────────────────────────────────────────────────
// src/pages/ComplaintDetailPage.tsx
// Complaint triage & detail view.
// Two-column layout: complaint description, AI triage metadata, location,
// attachments, and timeline on the left; action panel with status transitions,
// optimistic updates, confirmation dialog for terminal actions, and notes on right.
// ─────────────────────────────────────────────────────────────
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Sparkles,
  Paperclip,
  AlertTriangle,
  Send,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useComplaint, useUpdateComplaintStatus } from '../hooks/useComplaints';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatFullDateTime, formatRelativeTime } from '../lib/date';
import type { Status } from '../types';
import {
  PageHeader,
  Button,
  Select,
  Textarea,
  Card,
  CardHeader,
  CardContent,
  StatusBadge,
  PriorityBadge,
  CategoryBadge,
  Modal,
  Skeleton,
  EmptyState,
} from '../components/ui';

export default function ComplaintDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: complaint, isLoading, isError } = useComplaint(id);
  const updateStatusMutation = useUpdateComplaintStatus(id ?? '');

  // Dynamic document title — updates once complaint loads
  useDocumentTitle(complaint ? `Case ${complaint.id.slice(0, 8).toUpperCase()}` : 'Complaint Detail');

  // Local state for internal notes and assignee (simulated since backend has no notes table)
  const [internalNote, setInternalNote] = useState('');
  const [notesList, setNotesList] = useState<Array<{ id: string; author: string; text: string; time: string }>>([
    {
      id: '1',
      author: 'Triage System',
      text: 'Automated initial classification applied based on complaint keywords and severity assessment.',
      time: 'At creation',
    },
  ]);
  const [assignee, setAssignee] = useState('Unassigned');

  // Confirmation modal state for terminal actions (resolved or rejected)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<Status | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton width={120} height={24} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 space-y-4">
              <Skeleton width="60%" height={28} />
              <Skeleton width="100%" height={80} />
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="p-6 space-y-4">
              <Skeleton width="40%" height={24} />
              <Skeleton width="100%" height={120} />
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !complaint) {
    return (
      <div className="space-y-6">
        <PageHeader title="Complaint not found" />
        <Card>
          <EmptyState
            icon={<AlertCircle size={28} className="text-[var(--status-rejected-fg)]" />}
            title="Complaint record could not be loaded"
            description="The requested complaint UUID does not exist or the backend service is currently unreachable."
            action={
              <Button variant="secondary" icon={<ArrowLeft size={16} />} onClick={() => navigate('/complaints')}>
                Back to complaints registry
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  // Allowed transitions per backend domain rules
  const currentStatus = complaint.status;
  const isTerminal = currentStatus === 'resolved' || currentStatus === 'rejected';

  const allowedNextStatuses: Status[] = (() => {
    switch (currentStatus) {
      case 'open':
        return ['in_progress', 'rejected'];
      case 'in_progress':
        return ['resolved', 'rejected'];
      case 'resolved':
      case 'rejected':
      default:
        return [];
    }
  })();

  function handleStatusChangeRequest(newStatus: Status) {
    if (newStatus === currentStatus) return;

    // Destructive or terminal actions require explicit confirmation
    if (newStatus === 'rejected' || newStatus === 'resolved') {
      setPendingStatus(newStatus);
      setConfirmModalOpen(true);
    } else {
      executeStatusUpdate(newStatus);
    }
  }

  function executeStatusUpdate(statusToSet: Status) {
    updateStatusMutation.mutate({ status: statusToSet });
    setConfirmModalOpen(false);
    setPendingStatus(null);
  }

  function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!internalNote.trim()) return;
    setNotesList((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        author: 'Staff Officer',
        text: internalNote.trim(),
        time: 'Just now',
      },
    ]);
    setInternalNote('');
    toast.success('Internal note appended to local session log');
  }

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb Navigation ──────────────────────────────── */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-scale-xs text-[var(--text-muted)]">
        <Link to="/complaints" className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1">
          <ArrowLeft size={13} />
          <span>Complaints</span>
        </Link>
        <span>/</span>
        <span className="font-mono text-[var(--text-secondary)]">{complaint.id}</span>
      </nav>

      {/* ── Page Header ────────────────────────────────────────── */}
      <PageHeader
        title={complaint.ai_summary || 'Complaint inspection'}
        description={`Record logged on ${formatFullDateTime(complaint.created_at)}`}
        badge={<StatusBadge status={complaint.status} />}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" icon={<ArrowLeft size={14} />} onClick={() => navigate('/complaints')}>
              Back to list
            </Button>
          </div>
        }
      />

      {/* ── Two-Column Layout ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ── Left Column: Complaint Content (2 cols) ─────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Summary & Triage Metadata Card */}
          {complaint.ai_summary && (
            <Card className="border-[var(--primary-border)] bg-[var(--primary-subtle)]/40">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-[var(--primary)] text-[var(--primary-fg)] flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles size={16} />
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 text-scale-xs font-semibold text-[var(--primary)]">
                    <span>AI Triage Summary</span>
                    <span className="text-[11px] font-normal text-[var(--text-muted)]">
                      via {complaint.triaged_by} ({complaint.triage_latency_ms}ms)
                    </span>
                  </div>
                  <p className="text-scale-sm font-medium text-[var(--text-primary)]">
                    {complaint.ai_summary}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Description & Citizen Statement */}
          <Card>
            <CardHeader
              title="Citizen report statement"
              description="Verbatim text registered during intake"
            />
            <CardContent className="p-5 space-y-4">
              <div className="p-4 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-scale-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                {complaint.text}
              </div>

              {/* Location & Reporter details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-2.5 p-3 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                  <MapPin size={16} className="text-[var(--text-muted)] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
                      Location
                    </div>
                    <div className="text-scale-sm font-medium text-[var(--text-primary)] mt-0.5">
                      {complaint.location}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                  <Phone size={16} className="text-[var(--text-muted)] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
                      Reporter Contact
                    </div>
                    <div className="text-scale-sm font-medium text-[var(--text-primary)] mt-0.5">
                      {complaint.reporter_contact || 'None provided'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attachments Section */}
          <Card>
            <CardHeader
              title="Attachments & photographic evidence"
              description="Visual records submitted to support field verification"
            />
            <CardContent className="p-5">
              <div className="p-6 rounded-md border border-dashed border-[var(--border-subtle)] text-center text-scale-sm text-[var(--text-muted)] flex flex-col items-center justify-center gap-2">
                <Paperclip size={20} className="text-[var(--text-muted)]" />
                <span>No photographic or document attachments were provided with this intake report.</span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  (Backend currently stores text fields only; attachment support is a suggested addition)
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Timeline of Updates */}
          <Card>
            <CardHeader
              title="Activity & status history"
              description="Audit log of state modifications and system timestamps"
            />
            <CardContent className="p-5">
              <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border-subtle)]">
                {/* Created Event */}
                <div className="relative">
                  <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-[var(--primary)] border-2 border-[var(--bg-surface)]" />
                  <div className="text-scale-xs font-semibold text-[var(--text-primary)]">
                    Complaint logged and triaged
                  </div>
                  <div className="text-scale-xs text-[var(--text-secondary)] mt-0.5">
                    Categorized as <strong className="capitalize">{complaint.category}</strong> with <strong className="capitalize">{complaint.priority}</strong> priority by {complaint.triaged_by}.
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-1">
                    {formatFullDateTime(complaint.created_at)} ({formatRelativeTime(complaint.created_at)})
                  </div>
                </div>

                {/* Status Update Event if updated */}
                {complaint.updated_at && complaint.updated_at !== complaint.created_at && (
                  <div className="relative">
                    <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[var(--bg-surface)]" />
                    <div className="text-scale-xs font-semibold text-[var(--text-primary)]">
                      Status transitioned to {complaint.status.replace('_', ' ')}
                    </div>
                    <div className="text-scale-xs text-[var(--text-secondary)] mt-0.5">
                      Case state updated in municipal records.
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] mt-1">
                      {formatFullDateTime(complaint.updated_at)} ({formatRelativeTime(complaint.updated_at)})
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Right Column: Action & Triage Panel (1 col) ──────── */}
        <div className="space-y-6">
          {/* Triage Status Control Card */}
          <Card>
            <CardHeader
              title="Workflow status"
              description="Manage municipal queue transition"
            />
            <CardContent className="p-5 space-y-4">
              {/* Current Status Banner */}
              <div className="flex items-center justify-between p-3 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
                <span className="text-scale-xs text-[var(--text-secondary)] font-medium">
                  Current state:
                </span>
                <StatusBadge status={complaint.status} />
              </div>

              {/* Status Transition Selector */}
              {isTerminal ? (
                <div className="p-3 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-scale-xs text-[var(--text-secondary)] space-y-1">
                  <div className="font-semibold text-[var(--text-primary)]">Terminal state reached</div>
                  <div>
                    This complaint is marked as <strong className="capitalize">{complaint.status}</strong>. Per municipal business rules, terminal records cannot be transitioned further.
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-scale-xs font-medium text-[var(--text-secondary)]">
                    Transition to next status
                  </label>
                  <div className="flex flex-col gap-2">
                    {allowedNextStatuses.map((st) => (
                      <Button
                        key={st}
                        variant={st === 'rejected' ? 'danger' : 'primary'}
                        size="sm"
                        loading={updateStatusMutation.isPending && pendingStatus === st}
                        disabled={updateStatusMutation.isPending}
                        onClick={() => handleStatusChangeRequest(st)}
                        className="w-full justify-start capitalize"
                      >
                        Move to {st.replace('_', ' ')}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Classification Badges */}
              <div className="pt-3 border-t border-[var(--border-subtle)] space-y-2">
                <div className="flex items-center justify-between text-scale-xs">
                  <span className="text-[var(--text-secondary)]">Department:</span>
                  <CategoryBadge category={complaint.category} />
                </div>
                <div className="flex items-center justify-between text-scale-xs">
                  <span className="text-[var(--text-secondary)]">Priority level:</span>
                  <PriorityBadge priority={complaint.priority} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Field Assignment (Simulated Session) */}
          <Card>
            <CardHeader
              title="Department dispatch"
              description="Assign to field officer or response crew"
            />
            <CardContent className="p-5 space-y-3">
              <Select
                label="Assigned response crew"
                value={assignee}
                onChange={(e) => {
                  setAssignee(e.target.value);
                  toast.success(`Assigned to ${e.target.value}`);
                }}
              >
                <option value="Unassigned">Unassigned</option>
                <option value="Water Works Emergency Crew A">Water Works Emergency Crew A</option>
                <option value="IESCO Distribution Feeder Team">IESCO Distribution Feeder Team</option>
                <option value="Sanitation Sanitation Rapid Unit">Sanitation Rapid Unit</option>
                <option value="Road Maintenance Division 2">Road Maintenance Division 2</option>
                <option value="Streetlight Maintenance Team">Streetlight Maintenance Team</option>
              </Select>
              <div className="text-[11px] text-[var(--text-muted)]">
                Field assignment saved in active session (backend User/Assignment model suggested).
              </div>
            </CardContent>
          </Card>

          {/* Internal Notes */}
          <Card>
            <CardHeader
              title="Internal staff notes"
              description="Collaborative dispatch remarks"
            />
            <CardContent className="p-5 space-y-4">
              <form onSubmit={handleAddNote} className="space-y-2.5">
                <Textarea
                  placeholder="Record an inspection note or crew update..."
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  rows={3}
                />
                <Button
                  type="submit"
                  variant="secondary"
                  size="sm"
                  icon={<Send size={13} />}
                  disabled={!internalNote.trim()}
                  className="w-full"
                >
                  Append note
                </Button>
              </form>

              {/* Notes List */}
              <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)] max-h-48 overflow-y-auto">
                {notesList.map((n) => (
                  <div key={n.id} className="p-2.5 rounded-md bg-[var(--bg-subtle)] text-scale-xs space-y-1">
                    <div className="flex items-center justify-between font-semibold text-[var(--text-primary)]">
                      <span>{n.author}</span>
                      <span className="text-[11px] font-normal text-[var(--text-muted)]">{n.time}</span>
                    </div>
                    <div className="text-[var(--text-secondary)]">{n.text}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Confirmation Modal for Terminal / Destructive Actions ── */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setPendingStatus(null);
        }}
        title={`Confirm transition to "${pendingStatus?.replace('_', ' ')}"`}
        description="This is a terminal workflow action."
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setConfirmModalOpen(false);
                setPendingStatus(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant={pendingStatus === 'rejected' ? 'danger' : 'primary'}
              size="sm"
              loading={updateStatusMutation.isPending}
              onClick={() => {
                if (pendingStatus) executeStatusUpdate(pendingStatus);
              }}
            >
              Confirm and transition
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-scale-sm text-[var(--text-secondary)]">
          <p>
            Are you sure you want to transition this complaint to{' '}
            <strong className="text-[var(--text-primary)] uppercase font-mono">{pendingStatus}</strong>?
          </p>
          <div className="flex items-start gap-2 p-3 rounded-md bg-[var(--status-rejected-bg)]/50 border border-[var(--status-rejected-border)] text-scale-xs text-[var(--status-rejected-fg)]">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>
              Once marked as {pendingStatus}, this case record reaches a terminal status and cannot be reopened or edited under backend domain rules.
            </span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
