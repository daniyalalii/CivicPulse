// ─────────────────────────────────────────────────────────────
// src/App.tsx
// Route tree with ErrorBoundary, AuthProvider, and ProtectedRoutes.
// ─────────────────────────────────────────────────────────────
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import AppShell from './components/AppShell';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ComplaintsPage from './pages/ComplaintsPage';
import ComplaintDetailPage from './pages/ComplaintDetailPage';
import SubmitComplaintPage from './pages/SubmitComplaintPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public authentication */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected — all post-login pages */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/complaints" element={<ComplaintsPage />} />
                <Route path="/complaints/new" element={<SubmitComplaintPage />} />
                <Route path="/complaints/:id" element={<ComplaintDetailPage />} />
                {/* Settings accessible to all authenticated users */}
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>

            {/* 404 Catch-all */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
