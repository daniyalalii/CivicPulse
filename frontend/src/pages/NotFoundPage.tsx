// ─────────────────────────────────────────────────────────────
// src/pages/NotFoundPage.tsx
// Polished 404 page: document title, civic styling, keyboard-accessible.
// ─────────────────────────────────────────────────────────────
import { useNavigate } from 'react-router-dom';
import { SearchX, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/ui';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function NotFoundPage() {
  useDocumentTitle('Page Not Found');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-base)] text-[var(--text-primary)]">
      <div className="w-full max-w-md text-center space-y-6 fade-in">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center mx-auto">
          <SearchX size={28} className="text-[var(--text-muted)]" />
        </div>

        {/* Copy */}
        <div className="space-y-2">
          <p className="text-scale-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest">
            404 — Not Found
          </p>
          <h1 className="text-scale-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Page not found
          </h1>
          <p className="text-scale-sm text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
            The requested page or record could not be located in the municipal
            system. It may have been moved, deleted, or the link may be
            incorrect.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="secondary"
            size="md"
            icon={<ArrowLeft size={15} />}
            onClick={() => navigate(-1)}
          >
            Go back
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={<Home size={15} />}
            onClick={() => navigate('/dashboard')}
          >
            Return to overview
          </Button>
        </div>

        {/* Footer note */}
        <p className="text-[11px] text-[var(--text-muted)]">
          CivicPulse Municipal Operations Portal
        </p>
      </div>
    </div>
  );
}
