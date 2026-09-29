// ─────────────────────────────────────────────────────────────
// src/context/AuthContext.tsx
//
// ⚠️  CLIENT-SIDE ONLY AUTH
// The CivicPulse backend has NO authentication endpoints.
// This context provides a purely local login/logout mechanism
// that stores a user object in localStorage.
// No credentials are sent to or validated by the backend.
// If backend auth is added later, replace this entirely.
// ─────────────────────────────────────────────────────────────
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { LocalUser, UserRole } from '../types';

const STORAGE_KEY = 'civicpulse_user';

interface AuthContextValue {
  user:       LocalUser | null;
  isLoading:  boolean;
  login:      (email: string, password: string, role: UserRole) => Promise<void>;
  logout:     () => void;
  updateUser: (updates: Partial<LocalUser>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]           = useState<LocalUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as LocalUser);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, _password: string, role: UserRole) => {
    // ⚠️ No server call — any email/password is accepted.
    // This is intentional: the backend has no auth endpoint.
    const newUser: LocalUser = {
      name:  email.split('@')[0] ?? email,
      email,
      role,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const updateUser = useCallback((updates: Partial<LocalUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, logout, updateUser }),
    [user, isLoading, login, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
