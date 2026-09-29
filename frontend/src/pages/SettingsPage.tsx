// ─────────────────────────────────────────────────────────────
// src/pages/SettingsPage.tsx
// Municipal staff settings: Profile, Password update (simulated session),
// and Theme preference (Light, Dark, System).
// ─────────────────────────────────────────────────────────────
import { useState } from 'react';
import {
  User,
  Shield,
  Palette,
  Sun,
  Moon,
  Laptop,
  Save,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useTheme, type ThemePreference } from '../context/ThemeContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  PageHeader,
  Button,
  Input,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '../components/ui';

// ── Theme option card ─────────────────────────────────────────

interface ThemeCardProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
}

function ThemeCard({ icon, label, description, active, onClick }: ThemeCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-3.5 rounded-lg border text-left transition-colors duration-150 flex items-center gap-3 cursor-pointer focus-ring w-full ${
        active
          ? 'border-[var(--primary)] bg-[var(--primary-subtle)] text-[var(--primary)]'
          : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-[var(--text-primary)]'
      }`}
    >
      <span className="shrink-0">{icon}</span>
      <div>
        <div className={`text-scale-sm font-medium ${active ? 'font-semibold' : ''}`}>
          {label}
        </div>
        <div className={`text-[11px] ${active ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`}>
          {description}
        </div>
      </div>
      {active && (
        <CheckCircle2 size={16} className="ml-auto shrink-0 text-[var(--primary)]" />
      )}
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────

export default function SettingsPage() {
  useDocumentTitle('Settings');
  const { user, updateUser } = useAuth();
  const { themePreference, setThemePreference } = useTheme();

  // Profile form state
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    updateUser({ name: name.trim(), email: email.trim() });
    toast.success('Profile details saved to active session');
  }

  function handleSavePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordError('Please provide your current password');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match — please re-enter to confirm');
      return;
    }
    setPasswordError('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    toast.success('Password updated for current session');
  }

  function handleThemeChange(pref: ThemePreference) {
    setThemePreference(pref);
    const labels: Record<ThemePreference, string> = {
      light: 'Light mode activated',
      dark: 'Dark mode activated',
      system: 'Following system preference',
    };
    toast.success(labels[pref]);
  }

  const avatarInitial = name.trim().charAt(0).toUpperCase() || 'U';

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader
        title="Settings"
        description="Manage your account profile, credentials, and display preferences."
      />

      {/* ── 1. Profile ─────────────────────────────────────────── */}
      <Card>
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              <User size={16} className="text-[var(--text-muted)]" />
              Account profile
            </span>
          }
          description="Your identification across the municipal complaint platform"
        />
        <form onSubmit={handleSaveProfile}>
          <CardContent className="p-5 space-y-5">
            {/* Avatar + role row */}
            <div className="flex items-center gap-4 pb-4 border-b border-[var(--border-subtle)]">
              <div
                className="w-12 h-12 rounded-full bg-[var(--primary-subtle)] text-[var(--primary)] border border-[var(--primary-border)] flex items-center justify-center text-scale-base font-bold select-none"
                aria-hidden="true"
              >
                {avatarInitial}
              </div>
              <div>
                <div className="font-semibold text-[var(--text-primary)]">
                  {name || 'Staff Officer'}
                </div>
                <div className="text-scale-xs text-[var(--text-muted)] capitalize">
                  {user?.role ?? 'staff'} account
                </div>
              </div>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User size={15} />}
                required
                autoComplete="name"
              />
              <Input
                label="Official email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {/* Role note */}
            <div className="p-3 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-scale-xs text-[var(--text-secondary)]">
              Assigned role:{' '}
              <strong className="capitalize text-[var(--text-primary)]">
                {user?.role}
              </strong>
              . Roles govern access to triage and administrative dispatch
              settings.
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" variant="primary" size="sm" icon={<Save size={14} />}>
              Save profile
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* ── 2. Appearance ──────────────────────────────────────── */}
      <Card>
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              <Palette size={16} className="text-[var(--text-muted)]" />
              Appearance &amp; theme
            </span>
          }
          description="Select your preferred color scheme for high readability during day or night shifts"
        />
        <CardContent className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ThemeCard
              icon={<Sun size={18} />}
              label="Light mode"
              description="Default clean theme"
              active={themePreference === 'light'}
              onClick={() => handleThemeChange('light')}
            />
            <ThemeCard
              icon={<Moon size={18} />}
              label="Dark mode"
              description="Low-light contrast"
              active={themePreference === 'dark'}
              onClick={() => handleThemeChange('dark')}
            />
            <ThemeCard
              icon={<Laptop size={18} />}
              label="System default"
              description="Follows OS preference"
              active={themePreference === 'system'}
              onClick={() => handleThemeChange('system')}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── 3. Password ────────────────────────────────────────── */}
      <Card>
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              <Shield size={16} className="text-[var(--text-muted)]" />
              Security &amp; password
            </span>
          }
          description="Update portal login credentials"
        />
        <form onSubmit={handleSavePassword}>
          <CardContent className="p-5 space-y-4">
            {/* Session notice */}
            <div className="p-3 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-scale-xs text-[var(--text-secondary)] flex items-start gap-2">
              <Shield size={15} className="text-[var(--primary)] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[var(--text-primary)]">
                  Local session only.
                </strong>{' '}
                The backend has no user credential endpoints. Password changes
                apply to your active local workspace session.
              </div>
            </div>

            {/* Current password */}
            <Input
              label="Current password"
              type={showCurrentPw ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<KeyRound size={15} />}
              autoComplete="current-password"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowCurrentPw((p) => !p)}
                  aria-label={showCurrentPw ? 'Hide password' : 'Show password'}
                  className="p-1 hover:text-[var(--text-primary)] focus-ring rounded transition-colors duration-150"
                >
                  {showCurrentPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />

            {/* New + confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="New password"
                type={showNewPw ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowNewPw((p) => !p)}
                    aria-label={showNewPw ? 'Hide new password' : 'Show new password'}
                    className="p-1 hover:text-[var(--text-primary)] focus-ring rounded transition-colors duration-150"
                  >
                    {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
              />
              <Input
                label="Confirm new password"
                type={showNewPw ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                autoComplete="new-password"
              />
            </div>

            {/* Error message */}
            {passwordError && (
              <div className="p-2.5 rounded-md bg-[var(--status-rejected-bg)] border border-[var(--status-rejected-border)] text-scale-xs text-[var(--status-rejected-fg)] flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" variant="secondary" size="sm" icon={<Save size={14} />}>
              Update credentials
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
