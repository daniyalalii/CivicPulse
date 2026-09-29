// ─────────────────────────────────────────────────────────────
// src/components/AppShell.tsx
// Responsive municipal layout rebuilt with CSS Grid.
// - Fixed 256px sidebar, p-4, section headers (Workspace, Account)
// - Top bar: 64px tall, px-8, border-b, search input with visible border,
//   theme toggle and user menu on the right. Nothing clipped.
// - Main content: px-8 py-8, max-w-7xl, mx-auto, no horizontal scroll.
// ─────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Inbox,
  FilePlus2,
  Settings,
  LogOut,
  Landmark,
  Sun,
  Moon,
  Activity,
  Menu,
  X,
  Search,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useHealth } from '../hooks/useSystem';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
}

const WORKSPACE_NAV: NavItem[] = [
  {
    to: '/dashboard',
    label: 'Overview',
    icon: <LayoutDashboard size={18} />,
    end: true,
  },
  {
    to: '/complaints',
    label: 'Complaints',
    icon: <Inbox size={18} />,
    end: false,
  },
  {
    to: '/complaints/new',
    label: 'Submit complaint',
    icon: <FilePlus2 size={18} />,
    end: true,
  },
];

const ACCOUNT_NAV: NavItem[] = [
  {
    to: '/settings',
    label: 'Settings',
    icon: <Settings size={18} />,
    end: true,
  },
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { data: health } = useHealth();
  const isHealthy = health?.status === 'healthy';
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  // Global '/' keyboard shortcut to search
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tag = target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
      if (e.key === '/') {
        e.preventDefault();
        navigate('/complaints');
        setTimeout(() => {
          const searchInput = document.querySelector(
            'input[placeholder*="Search"]'
          ) as HTMLInputElement | null;
          searchInput?.focus();
        }, 60);
      }
      if (e.key === 'Escape') {
        setMobileDrawerOpen(false);
      }
    },
    [navigate]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors select-none focus-ring ${
      isActive
        ? 'bg-[var(--primary-subtle)] text-[var(--primary)] font-semibold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-r before:bg-[var(--primary)]'
        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
    }`;

  return (
    <div className="lg:grid lg:grid-cols-[256px_1fr] lg:grid-rows-[64px_1fr] h-screen w-screen overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)]">
      {/* Mobile backdrop */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar (Fixed 256px, p-4) ────────────────────────── */}
      <aside
        id="sidebar"
        className={`fixed inset-y-0 left-0 z-50 lg:static lg:row-span-2 lg:col-start-1 w-[256px] shrink-0 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] flex flex-col justify-between p-4 transition-transform duration-200 ease-in-out ${
          mobileDrawerOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full lg:translate-x-0'
        }`}
        aria-label="Main navigation"
      >
        <div className="flex flex-col">
          {/* Logo block: px-3 py-2 */}
          <div className="flex items-center justify-between px-3 py-2 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Landmark size={18} />
              </div>
              <div className="min-w-0">
                <div className="text-[15px] font-bold tracking-tight text-[var(--text-primary)] leading-tight">
                  CivicPulse
                </div>
                <div className="text-[11px] text-[var(--text-muted)] truncate">
                  Municipal Portal
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] focus-ring"
              aria-label="Close navigation"
            >
              <X size={16} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col" aria-label="Primary navigation">
            {/* Section: WORKSPACE */}
            <div className="px-3 pt-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Workspace
            </div>
            <div className="flex flex-col gap-1">
              {WORKSPACE_NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={navLinkClass}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>

            {/* Section: ACCOUNT */}
            <div className="px-3 pt-5 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Account
            </div>
            <div className="flex flex-col gap-1">
              {ACCOUNT_NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={navLinkClass}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </nav>
        </div>

        {/* Sidebar Footer with divider and pinned user card */}
        <div className="flex flex-col gap-3 pt-3 border-t border-[var(--border-subtle)]">
          {/* Health indicator */}
          <div
            className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)]"
            title={isHealthy ? 'Backend API online' : 'Backend API offline'}
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isHealthy ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
                aria-hidden="true"
              />
              <span className="font-medium">
                {isHealthy ? 'System operational' : 'System offline'}
              </span>
            </div>
            <Activity size={13} className="text-[var(--text-muted)]" />
          </div>

          {/* User card pinned to bottom */}
          <div className="flex items-center justify-between p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)] flex items-center justify-center font-bold text-[13px] shrink-0 select-none"
                aria-hidden="true"
              >
                {user?.name?.charAt(0).toUpperCase() ?? 'U'}
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-[var(--text-primary)] truncate">
                  {user?.name ?? 'Staff User'}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] capitalize truncate">
                  {user?.role ?? 'Municipal Staff'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              title="Sign out"
              aria-label="Sign out"
              className="p-1.5 text-[var(--text-muted)] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors focus-ring cursor-pointer"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Top Bar (64px tall, px-8, border-b) ───────────────── */}
      <header className="lg:col-start-2 lg:row-start-1 h-[64px] px-6 sm:px-8 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            aria-label="Open navigation drawer"
            aria-controls="sidebar"
            aria-expanded={mobileDrawerOpen}
            className="lg:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] border border-[var(--border-subtle)] focus-ring"
          >
            <Menu size={18} />
          </button>

          {/* Search input with visible border on the left */}
          <div className="relative w-64 sm:w-80">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search complaints... (Press /)"
              onClick={() => navigate('/complaints')}
              readOnly
              className="w-full pl-9 pr-8 py-1.5 text-[13px] bg-[var(--bg-base)] border border-[var(--border-strong)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] hover:border-[var(--primary)] focus:border-[var(--primary)] transition-colors cursor-pointer focus-ring"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded shadow-2xs">
              /
            </kbd>
          </div>
        </div>

        {/* Top bar right side: Theme toggle and user info */}
        <div className="flex items-center gap-3">
          {/* Quick link to new complaint */}
          <button
            type="button"
            onClick={() => navigate('/complaints/new')}
            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--primary)] text-white text-[13px] font-medium hover:bg-[var(--primary-hover)] transition-colors focus-ring shadow-2xs cursor-pointer"
          >
            <FilePlus2 size={15} />
            <span>Submit complaint</span>
          </button>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-[13px] font-medium transition-colors focus-ring cursor-pointer"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            <span className="capitalize">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>

          {/* User menu pill */}
          <div
            onClick={() => navigate('/settings')}
            className="hidden sm:flex items-center gap-2 pl-3 border-l border-[var(--border-subtle)] cursor-pointer text-[13px] hover:opacity-80 transition-opacity"
            title="Go to settings"
          >
            <div className="w-7 h-7 rounded-full bg-[var(--primary-subtle)] text-[var(--primary)] border border-[var(--primary-border)] flex items-center justify-center font-bold text-[12px]">
              {user?.name?.charAt(0).toUpperCase() ?? 'U'}
            </div>
            <span className="font-medium text-[var(--text-primary)] max-w-[120px] truncate">
              {user?.name?.split(' ')[0] ?? 'Account'}
            </span>
          </div>
        </div>
      </header>

      {/* ── Main Content (px-8 py-8, max-w-7xl, mx-auto) ──────── */}
      <main className="lg:col-start-2 lg:row-start-2 overflow-y-auto px-6 sm:px-8 py-8 w-full bg-[var(--bg-base)]">
        <div className="max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
