// ─────────────────────────────────────────────────────────────
// src/pages/LoginPage.tsx
// Split layout: form on one side and a tasteful, restrained civic brand panel on the other.
// No gradients or stock illustrations. Show/hide password, clear errors, remember-me.
// ─────────────────────────────────────────────────────────────
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Landmark,
  Eye,
  EyeOff,
  ShieldCheck,
  Sun,
  Moon,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Button, Input } from '../components/ui';
import type { UserRole } from '../types';

export default function LoginPage() {
  useDocumentTitle('Sign In');
  const { login, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ??
    '/dashboard';

  const [email, setEmail] = useState('triage.officer@city.gov');
  const [password, setPassword] = useState('civicpulse2026');
  const [role, setRole] = useState<UserRole>('staff');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, navigate, from]);

  function validate(): boolean {
    const errs: typeof fieldErrors = {};
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 4) {
      errs.password = 'Password must be at least 4 characters';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGlobalError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim(), password, role);
      if (rememberMe) {
        localStorage.setItem('civicpulse_remember', 'true');
      } else {
        localStorage.removeItem('civicpulse_remember');
      }
      navigate(from, { replace: true });
    } catch {
      setGlobalError('Unable to sign in. Please verify your credentials and try again.');
    } finally {
      setLoading(false);
    }
  }

  // Fill demo credentials when switching role
  function handleRoleSwitch(newRole: UserRole) {
    setRole(newRole);
    setGlobalError('');
    if (newRole === 'staff') {
      if (email === 'citizen@example.com') setEmail('triage.officer@city.gov');
    } else {
      if (email === 'triage.officer@city.gov') setEmail('citizen@example.com');
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[var(--bg-base)] text-[var(--text-primary)]">

      {/* ── Left: Civic Brand Panel ─────────────────────────── */}
      <div className="lg:w-[52%] p-8 lg:p-14 bg-[var(--bg-surface)] border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] flex flex-col justify-between select-none">
        {/* Top branding row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[var(--primary)] text-[var(--primary-fg)] flex items-center justify-center">
              <Landmark size={17} />
            </div>
            <div>
              <div className="font-bold text-scale-base tracking-tight text-[var(--text-primary)]">
                CivicPulse
              </div>
              <div className="text-[11px] text-[var(--text-muted)]">
                Municipal Operations Portal
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] border border-[var(--border-subtle)] transition-colors duration-150 focus-ring cursor-pointer flex items-center gap-1.5 text-scale-xs"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            <span className="capitalize">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
        </div>

        {/* Mission statement */}
        <div className="my-10 lg:my-0 max-w-md space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[var(--primary-subtle)] border border-[var(--primary-border)] text-scale-xs font-semibold text-[var(--primary)]">
              <Sparkles size={13} />
              <span>Automated Complaint Triage</span>
            </div>
            <h1 className="text-scale-2xl font-bold tracking-tight text-[var(--text-primary)] leading-tight">
              Calm, efficient municipal triage for modern city services.
            </h1>
            <p className="text-scale-base text-[var(--text-secondary)] leading-relaxed">
              CivicPulse connects citizen reports with municipal response
              divisions, classifying incidents across utilities, road hazards,
              and sanitation with automated priority triage.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[var(--border-subtle)]">
            <div className="space-y-1">
              <div className="text-scale-sm font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-[var(--primary)]" />
                Deterministic Rules
              </div>
              <p className="text-scale-xs text-[var(--text-secondary)]">
                Strict workflow state transitions prevent invalid status
                progression.
              </p>
            </div>
            <div className="space-y-1">
              <div className="text-scale-sm font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                <Clock size={15} className="text-[var(--primary)]" />
                Sub-second Triage
              </div>
              <p className="text-scale-xs text-[var(--text-secondary)]">
                AI categorises incoming reports immediately upon intake.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-[11px] text-[var(--text-muted)]">
          Official Municipal Services Infrastructure · v0.1.0
        </p>
      </div>

      {/* ── Right: Sign-in form ─────────────────────────────── */}
      <div className="lg:w-[48%] p-6 sm:p-10 lg:p-16 flex items-center justify-center bg-[var(--bg-base)]">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1.5">
            <h2 className="text-scale-xl font-bold tracking-tight text-[var(--text-primary)]">
              Sign in
            </h2>
            <p className="text-scale-sm text-[var(--text-secondary)]">
              Enter your credentials to access the municipal workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Role selector */}
            <div className="space-y-1.5">
              <label className="text-scale-xs font-medium text-[var(--text-secondary)] select-none">
                Workspace role
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-md">
                {(
                  [
                    { value: 'staff', label: 'Municipal staff' },
                    { value: 'citizen', label: 'Citizen / Resident' },
                  ] as const
                ).map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleRoleSwitch(value)}
                    className={`py-1.5 px-3 text-scale-xs rounded transition-colors duration-150 focus-ring cursor-pointer select-none text-center ${
                      role === value
                        ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm font-semibold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Email */}
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
                setGlobalError('');
              }}
              error={fieldErrors.email}
              placeholder="officer@city.gov"
              autoComplete="email"
              required
            />

            {/* Password */}
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
                setGlobalError('');
              }}
              error={fieldErrors.password}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="p-1 hover:text-[var(--text-primary)] focus-ring rounded transition-colors duration-150"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />

            {/* Remember me */}
            <div className="flex items-center justify-between text-scale-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[var(--text-secondary)]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--border-strong)] accent-[var(--primary)]"
                />
                <span>Remember this workstation</span>
              </label>
              <span className="text-[11px] text-[var(--text-muted)]">
                Session stored locally
              </span>
            </div>

            {/* Global error */}
            {globalError && (
              <div
                role="alert"
                className="p-3 rounded-md bg-[var(--status-rejected-bg)] border border-[var(--status-rejected-border)] text-scale-xs text-[var(--status-rejected-fg)] flex items-start gap-2"
              >
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{globalError}</span>
              </div>
            )}

            {/* Security note */}
            <div className="p-3 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[12px] text-[var(--text-secondary)] flex items-start gap-2">
              <ShieldCheck size={15} className="text-[var(--primary)] shrink-0 mt-0.5" />
              <span>
                <strong className="text-[var(--text-primary)]">Simulated session:</strong> The
                CivicPulse backend has no authentication endpoints. Any
                credentials accepted.
              </span>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="w-full"
              icon={<ArrowRight size={15} />}
            >
              Sign in to workspace
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
