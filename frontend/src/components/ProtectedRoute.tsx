// ─────────────────────────────────────────────────────────────
// src/components/ProtectedRoute.tsx
// Redirects to /login if no local user is set.
// Optionally enforces a minimum role.
// ─────────────────────────────────────────────────────────────
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

interface ProtectedRouteProps {
  /** If provided, only users whose role matches are allowed. */
  requiredRole?: UserRole;
}

export function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location            = useLocation();

  if (isLoading) {
    return (
      <div
        style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          height:         '100vh',
          background:     'var(--color-bg-base)',
        }}
      >
        <div className="spinner" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
