// ─────────────────────────────────────────────────────────────
// src/pages/SubmitComplaintPage.tsx
// Citizen complaint intake form with react-hook-form + zod validation.
// Split into clear sections: What happened, Where, Contact details, Attachments.
// Includes character counter, drag-and-drop preview, and success screen with copyable ID.
// ─────────────────────────────────────────────────────────────
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Send,
  Sparkles,
  MapPin,
  Phone,
  Paperclip,
  CheckCircle2,
  Copy,
  Check,
  UploadCloud,
  X,
  ArrowRight,
  PlusCircle,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCreateComplaint } from '../hooks/useComplaints';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import type { ComplaintResponse } from '../types';
import {
  PageHeader,
  Button,
  Input,
  Textarea,
  Card,
  CardHeader,
  CardContent,
} from '../components/ui';

// ── Zod schema — strictly matches backend domain limits ──────────
const complaintFormSchema = z.object({
  text: z
    .string()
    .min(10, 'Please provide at least 10 characters describing the issue.')
    .max(2000, 'Description cannot exceed 2,000 characters.'),
  location: z
    .string()
    .min(3, 'Please enter a specific address, street, or landmark (minimum 3 characters).')
    .max(200, 'Location cannot exceed 200 characters.'),
  reporter_contact: z
    .string()
    .max(200, 'Contact detail cannot exceed 200 characters.')
    .optional()
    .or(z.literal('')),
});

type ComplaintFormData = z.infer<typeof complaintFormSchema>;

interface UploadedFilePreview {
  id: string;
  name: string;
  size: string;
  previewUrl?: string;
}

// ── Step indicator (non-interactive, visual progress only) ───────
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5 mb-6" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1 rounded-full transition-all duration-300 ${
            i < current ? 'flex-1 bg-[var(--primary)]' : 'flex-1 bg-[var(--border-subtle)]'
          }`}
        />
      ))}
    </div>
  );
}

export default function SubmitComplaintPage() {
  useDocumentTitle('Submit Complaint');
  const navigate = useNavigate();
  const createMutation = useCreateComplaint();

  // Submission success state
  const [createdComplaint, setCreatedComplaint] = useState<ComplaintResponse | null>(null);
  const [copied, setCopied] = useState(false);

  // Local attachment preview state (client-side only)
  const [attachments, setAttachments] = useState<UploadedFilePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isSubmitting },
    reset,
  } = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintFormSchema),
    mode: 'onChange',
    defaultValues: {
      text: '',
      location: '',
      reporter_contact: '',
    },
  });

  const descriptionValue = watch('text') ?? '';
  const charCount = descriptionValue.length;
  const charWarning = charCount > 1800;
  const charError = charCount > 2000;

  // ── Handlers ────────────────────────────────────────────────

  function handleCopyId() {
    if (!createdComplaint?.id) return;
    navigator.clipboard.writeText(createdComplaint.id).catch(() => {
      /* clipboard API may be denied in some contexts */
    });
    setCopied(true);
    toast.success('Tracking ID copied to clipboard');
    setTimeout(() => setCopied(false), 2500);
  }

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const newItems: UploadedFilePreview[] = [];

    Array.from(files).forEach((file) => {
      const isImg = file.type.startsWith('image/');
      const previewUrl = isImg ? URL.createObjectURL(file) : undefined;
      const sizeStr = file.size < 1024
        ? `${file.size} B`
        : `${(file.size / 1024).toFixed(0)} KB`;

      newItems.push({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        name: file.name,
        size: sizeStr,
        previewUrl,
      });
    });

    setAttachments((prev) => [...prev, ...newItems]);
    toast.success(`${newItems.length} file${newItems.length !== 1 ? 's' : ''} attached`);
  }

  function handleRemoveAttachment(id: string) {
    setAttachments((prev) => {
      const removed = prev.find((a) => a.id === id);
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((a) => a.id !== id);
    });
  }

  function onSubmit(data: ComplaintFormData) {
    createMutation.mutate(
      {
        text: data.text.trim(),
        location: data.location.trim(),
        reporter_contact: data.reporter_contact?.trim() || null,
      },
      {
        onSuccess: (result) => {
          setCreatedComplaint(result);
        },
      }
    );
  }

  function handleResetForm() {
    setCreatedComplaint(null);
    setAttachments([]);
    reset();
  }

  // ── Success Screen ───────────────────────────────────────────
  if (createdComplaint) {
    return (
      <div className="max-w-xl mx-auto pt-4 fade-in">
        <Card className="p-8 space-y-6">
          {/* Icon */}
          <div className="w-14 h-14 rounded-full bg-[var(--status-resolved-bg)] border border-[var(--status-resolved-border)] text-[var(--status-resolved-fg)] mx-auto flex items-center justify-center">
            <CheckCircle2 size={30} strokeWidth={1.75} />
          </div>

          {/* Heading */}
          <div className="text-center space-y-2">
            <h1 className="text-scale-xl font-bold text-[var(--text-primary)]">
              Complaint submitted
            </h1>
            <p className="text-scale-sm text-[var(--text-secondary)] max-w-md mx-auto">
              Your report has been entered into the municipal system and
              triaged automatically.
            </p>
          </div>

          {/* Tracking ID callout */}
          <div className="p-4 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-scale-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Case Tracking ID
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                aria-label="Copy tracking ID to clipboard"
                className="inline-flex items-center gap-1.5 text-scale-xs font-semibold text-[var(--primary)] hover:underline focus-ring rounded px-1"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                <span>{copied ? 'Copied!' : 'Copy ID'}</span>
              </button>
            </div>
            <div
              className="font-mono text-scale-sm font-bold text-[var(--text-primary)] break-all select-all cursor-text"
              title="Click to select all"
            >
              {createdComplaint.id}
            </div>
          </div>

          {/* Triage result */}
          {createdComplaint.ai_summary && (
            <div className="p-3.5 rounded-md bg-[var(--primary-subtle)] border border-[var(--primary-border)] text-scale-xs space-y-1">
              <div className="font-semibold text-[var(--primary)] flex items-center gap-1.5">
                <Sparkles size={13} />
                <span>Automated triage outcome</span>
              </div>
              <p className="text-[var(--text-secondary)]">
                Assigned to{' '}
                <strong className="text-[var(--text-primary)]">
                  {createdComplaint.category}
                </strong>{' '}
                with{' '}
                <strong className="text-[var(--text-primary)]">
                  {createdComplaint.priority}
                </strong>{' '}
                priority.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="secondary"
              size="md"
              icon={<PlusCircle size={15} />}
              onClick={handleResetForm}
            >
              Submit another
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={<ArrowRight size={15} />}
              onClick={() => navigate(`/complaints/${createdComplaint.id}`)}
            >
              View details
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ── Intake Form ──────────────────────────────────────────────
  const isLoading = createMutation.isPending || isSubmitting;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader
        title="Submit a complaint"
        description="Report utility disruptions, damaged infrastructure, or sanitation concerns for municipal review."
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/complaints')}
          >
            Cancel
          </Button>
        }
      />

      {/* Visual progress bar */}
      <StepIndicator current={4} total={4} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

        {/* Section 1: What happened */}
        <Card>
          <CardHeader
            title="1 · What happened?"
            description="Describe the civic issue with as much relevant detail as possible"
          />
          <CardContent className="p-5 space-y-3">
            <Textarea
              label="Complaint description *"
              placeholder="e.g. Major water main leaking near the market entrance, causing deep flooding and road erosion since 6:00 AM..."
              rows={4}
              error={errors.text?.message}
              {...register('text')}
            />
            <div className="flex items-center justify-between text-scale-xs text-[var(--text-muted)]">
              <span>Minimum 10 characters required</span>
              <span
                className={
                  charError
                    ? 'text-[var(--status-rejected-fg)] font-bold'
                    : charWarning
                    ? 'text-[var(--status-inprogress-fg)] font-medium'
                    : ''
                }
              >
                {charCount.toLocaleString()} / 2,000
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Where */}
        <Card>
          <CardHeader
            title="2 · Where is the issue?"
            description="Specify where the municipal issue is located"
          />
          <CardContent className="p-5 space-y-3">
            <Input
              label="Street address or municipal sector *"
              placeholder="e.g. Street 14, Sector G-9/2, Islamabad"
              leftIcon={<MapPin size={15} />}
              error={errors.location?.message}
              {...register('location')}
            />
            <p className="text-scale-xs text-[var(--text-muted)]">
              Include landmarks, street numbers, or intersection markers to help
              response teams locate the site quickly.
            </p>
          </CardContent>
        </Card>

        {/* Section 3: Contact */}
        <Card>
          <CardHeader
            title="3 · Your contact details"
            description="Optional — for field team clarification only"
          />
          <CardContent className="p-5 space-y-3">
            <Input
              label="Phone number or email address (optional)"
              placeholder="e.g. 0300-1234567 or resident@example.com"
              leftIcon={<Phone size={15} />}
              error={errors.reporter_contact?.message}
              {...register('reporter_contact')}
            />
            <p className="text-scale-xs text-[var(--text-muted)]">
              Kept strictly confidential. Only used if the field team needs
              clarification.
            </p>
          </CardContent>
        </Card>

        {/* Section 4: Attachments */}
        <Card>
          <CardHeader
            title="4 · Evidence photos (optional)"
            description="Attach photographs or documents illustrating the condition"
          />
          <CardContent className="p-5 space-y-4">
            {/* Drop zone */}
            <div
              role="button"
              tabIndex={0}
              aria-label="Upload files — click or drag and drop"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFiles(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors duration-150 flex flex-col items-center justify-center gap-2 focus-ring ${
                isDragging
                  ? 'border-[var(--primary)] bg-[var(--primary-subtle)]'
                  : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)] bg-[var(--bg-subtle)]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf"
                className="hidden"
                aria-hidden="true"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <UploadCloud
                size={24}
                className={isDragging ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}
              />
              <div className="text-scale-sm font-medium text-[var(--text-primary)]">
                Drag files here, or{' '}
                <span className="text-[var(--primary)] underline">browse</span>
              </div>
              <div className="text-scale-xs text-[var(--text-muted)]">
                JPG, PNG, PDF — up to 10 MB each
              </div>
            </div>

            {/* Attachment list */}
            {attachments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {attachments.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-scale-xs gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {file.previewUrl ? (
                        <img
                          src={file.previewUrl}
                          alt=""
                          aria-hidden="true"
                          className="w-8 h-8 rounded object-cover border border-[var(--border-subtle)] shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-[var(--bg-subtle)] flex items-center justify-center shrink-0">
                          <Paperclip size={14} className="text-[var(--text-muted)]" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-medium text-[var(--text-primary)] truncate">
                          {file.name}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)]">
                          {file.size}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(file.id)}
                      className="p-1 hover:text-[var(--status-rejected-fg)] rounded focus-ring text-[var(--text-muted)] shrink-0 transition-colors duration-150"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-[11px] text-[var(--text-muted)]">
              Note: The current backend does not store attachments. Files are
              previewed locally for field coordination reference only.
            </p>
          </CardContent>
        </Card>

        {/* AI Notice */}
        <div className="p-3.5 rounded-md bg-[var(--primary-subtle)] border border-[var(--primary-border)] text-scale-xs text-[var(--primary)] flex items-start gap-2.5">
          <Sparkles size={15} className="shrink-0 mt-0.5" />
          <span>
            Upon submission the platform will automatically categorise the
            report and assign a priority rating via AI triage.
          </span>
        </div>

        {/* Server error alert */}
        {createMutation.isError && (
          <div className="p-3 rounded-md bg-[var(--status-rejected-bg)] border border-[var(--status-rejected-border)] text-scale-xs text-[var(--status-rejected-fg)] flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>
              Submission failed. Please check your connection and try again.
            </span>
          </div>
        )}

        {/* Form actions */}
        <div className="flex items-center justify-end gap-3 pb-2">
          <Button
            variant="ghost"
            size="md"
            onClick={() => navigate('/complaints')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={<Send size={15} />}
            loading={isLoading}
            disabled={!isValid || isLoading}
          >
            Submit complaint
          </Button>
        </div>
      </form>
    </div>
  );
}
