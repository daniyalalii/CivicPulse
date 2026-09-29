# CivicPulse — Frontend

React + TypeScript + Vite frontend for the CivicPulse municipal complaint management system.

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Type-check
npx tsc --noEmit

# Lint
npm run lint

# Production build
npm run build
```

> **Backend required.** Set `VITE_API_BASE_URL` in `.env` to point at the FastAPI server (default: `http://localhost:8000`).

---

## Architecture

```
src/
├── api/              # One typed function per backend endpoint
│   ├── complaints.ts # POST /api/complaints, GET /api/complaints, PATCH /:id/status, GET /api/stats
│   └── system.ts     # GET /health, /ready, /api/meta/providers
├── components/
│   ├── AppShell.tsx      # Sidebar layout with mobile drawer, breadcrumb, search shortcut
│   ├── ErrorBoundary.tsx # Class error boundary — friendly message + dev-only stack trace
│   ├── ProtectedRoute.tsx
│   └── ui/               # Design-system component library (see below)
├── context/
│   ├── AuthContext.tsx   # Client-side session only (backend has no auth)
│   └── ThemeContext.tsx  # light / dark / system preference → .dark class on <html>
├── hooks/
│   ├── useComplaints.ts  # TanStack Query wrappers + optimistic status updates
│   ├── useDocumentTitle.ts
│   └── useSystem.ts      # Health + provider meta queries
├── lib/
│   ├── axios.ts          # Axios instance with base URL + error interceptors
│   ├── date.ts           # formatRelativeTime, formatFullDateTime helpers
│   └── queryClient.ts    # TanStack Query configuration
├── pages/
│   ├── DashboardPage.tsx         # Stats cards, Recharts bar/line charts, attention table
│   ├── ComplaintsPage.tsx        # Filterable/sortable table, URL-synced params, pagination
│   ├── ComplaintDetailPage.tsx   # Two-column detail view, optimistic status transitions
│   ├── SubmitComplaintPage.tsx   # 4-section form, zod validation, drag-drop, success screen
│   ├── SettingsPage.tsx          # Profile, theme (light/dark/system), password change
│   ├── LoginPage.tsx             # Split-panel, show/hide password, role selector, remember-me
│   └── NotFoundPage.tsx          # 404 with Go Back + Return to Overview
├── types/index.ts    # TypeScript types mirroring backend schemas exactly
├── App.tsx           # BrowserRouter route tree
├── index.css         # CSS design system (variables, typography, status/priority tokens)
└── main.tsx          # Entry point — QueryClientProvider, ThemeProvider, Toaster
```

---

## UI Component Library (`src/components/ui/`)

| Component | Description |
|---|---|
| `Button` | primary / secondary / ghost / danger variants, size sm/md/lg, loading spinner |
| `Input` | label, error, helper, left/right icon slots, focus ring |
| `Textarea` | label, error, helper, auto-accessible IDs |
| `Select` | styled native select with label/error |
| `Card` / `CardHeader` / `CardContent` / `CardFooter` | section containers |
| `Badge` / `StatusBadge` / `PriorityBadge` / `CategoryBadge` | semantic coloured chips |
| `Table` / `TableHeader` / `TableHead` / `TableBody` / `TableRow` / `TableCell` | data table |
| `Tabs` | tab navigation |
| `Modal` | accessible dialog with focus trap |
| `Dropdown` | contextual menu |
| `Skeleton` | loading placeholder |
| `EmptyState` | empty/error state with action slot |
| `PageHeader` | page title, description, optional badge and action bar |
| `Toast` / `Toaster` | react-hot-toast configured with civic styling |

---

## Design System

**Palette:** Civic navy (`--primary: #1e40af`) for light mode, adjusted blue (`#3b82f6`) for dark.  
**Typography:** Inter (Google Fonts), 14px base, `text-scale-{xs|sm|base|lg|xl|2xl}` utility classes.  
**Spacing:** Tailwind CSS v4 utilities.  
**Themes:** CSS custom properties on `:root` and `.dark` — toggled by ThemeContext adding `.dark` to `<html>`.  
**Transitions:** 150ms on hover/focus (`--transition-fast`), 200ms for theme changes (`--transition-base`).

---

## Authentication

Authentication is client-side only — the CivicPulse backend has no auth endpoints. `AuthContext` stores a `LocalUser` object in `localStorage`. Any email + password is accepted. Role (`staff` | `citizen`) governs UI visibility only.

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `/` | Focus the complaint search input (navigates to `/complaints` if not there) |
| `Escape` | Close the mobile navigation drawer |

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000` | FastAPI backend base URL |

---

## Status Workflow

```
open → in_progress → resolved
open → rejected
in_progress → rejected
```

Terminal states (`resolved`, `rejected`) have no further transitions. The frontend enforces this client-side and the backend enforces it server-side (409 on invalid transition).

---

## Recommended Next Steps (UX Improvements)

1. **Real authentication** — JWT tokens with refresh logic; currently any credentials work.
2. **Complaint search** — full-text search endpoint on the backend; currently filtering is enum-only.
3. **Pagination UX** — infinite scroll or better load-more for large datasets.
4. **Notification system** — email/SMS hooks when status changes (backend WebSocket or polling).
5. **Map integration** — Leaflet map pinning complaint location from the `location` field.
6. **File upload** — backend multipart endpoint so evidence photos persist with the complaint.
7. **Citizen tracking** — public complaint status tracker by ID, no login required.
8. **Accessibility audit** — screen reader testing, color contrast verification, reduced-motion support.
