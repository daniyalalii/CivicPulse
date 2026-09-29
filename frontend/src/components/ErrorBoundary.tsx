// ─────────────────────────────────────────────────────────────
// src/components/ErrorBoundary.tsx
// Accessible error boundary with helpful user-facing recovery actions.
// Shows a condensed error message in dev, nothing sensitive in production.
// ─────────────────────────────────────────────────────────────
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CivicPulse unhandled error caught by boundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  public render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV;

      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-base)] text-[var(--text-primary)]">
          <div className="w-full max-w-lg space-y-6 fade-in">
            {/* Icon + heading */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--status-rejected-bg)] border border-[var(--status-rejected-border)] flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle size={22} className="text-[var(--status-rejected-fg)]" />
              </div>
              <div className="space-y-1">
                <h1 className="text-scale-xl font-bold tracking-tight text-[var(--text-primary)]">
                  Something unexpected occurred
                </h1>
                <p className="text-scale-sm text-[var(--text-secondary)] leading-relaxed">
                  The application encountered an issue while rendering this
                  section. Your recorded data has not been lost — you can safely
                  return to the dashboard.
                </p>
              </div>
            </div>

            {/* Dev-only error detail */}
            {isDev && this.state.error && (
              <div className="p-4 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-2">
                <p className="text-scale-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Error detail (development only)
                </p>
                <p className="font-mono text-scale-xs text-[var(--status-rejected-fg)] break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            {/* Recovery actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="md"
                icon={<RefreshCw size={14} />}
                onClick={this.handleReset}
              >
                Reload page
              </Button>
              <Button
                variant="primary"
                size="md"
                icon={<Home size={14} />}
                onClick={this.handleGoHome}
              >
                Return to dashboard
              </Button>
            </div>

            {/* Footer */}
            <p className="text-[11px] text-[var(--text-muted)]">
              If this issue persists, please contact the municipal IT support desk.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
