// ─────────────────────────────────────────────────────────────
// src/pages/ComplaintsPage.tsx
// Comprehensive complaints registry with URL-synced filters,
// removable chips, sortable columns, sticky header, search, and pagination.
// ─────────────────────────────────────────────────────────────
import { useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  FilePlus2,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useComplaints } from '../hooks/useComplaints';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatRelativeTime, formatFullDateTime } from '../lib/date';
import type { Category, Priority, Status } from '../types';
import {
  PageHeader,
  Button,
  Input,
  Select,
  Card,
  TableCell,
  StatusBadge,
  PriorityBadge,
  CategoryBadge,
  Skeleton,
  EmptyState,
} from '../components/ui';

type SortField = 'created_at' | 'priority' | 'status' | 'category';
type SortOrder = 'asc' | 'desc';

export default function ComplaintsPage() {
  useDocumentTitle('Complaints');
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Read URL params
  const statusParam = (searchParams.get('status') as Status) || undefined;
  const categoryParam = (searchParams.get('category') as Category) || undefined;
  const priorityParam = (searchParams.get('priority') as Priority) || undefined;
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const pageSizeParam = parseInt(searchParams.get('page_size') || '20', 10);
  const searchParam = searchParams.get('q') || '';

  // Local search query input (debounced or synced to URL)
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Backend query hook with URL params
  const { data, isLoading, isError, refetch } = useComplaints({
    status: statusParam,
    category: categoryParam,
    priority: priorityParam,
    page: pageParam,
    page_size: pageSizeParam,
  });

  // URL updater helper
  function updateParams(updates: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === '') {
        next.delete(key);
      } else {
        next.set(key, val);
      }
    });
    // Reset to page 1 if any filter or search changes (unless page itself is changing)
    if (!('page' in updates)) {
      next.set('page', '1');
    }
    setSearchParams(next);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParams({ q: searchQuery.trim() || null });
  }

  function handleClearFilters() {
    setSearchQuery('');
    setSearchParams(new URLSearchParams({ page: '1', page_size: String(pageSizeParam) }));
  }

  // Handle column header sort
  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  }

  // Filter & sort items
  const displayItems = useMemo(() => {
    if (!data?.items) return [];
    let items = [...data.items];

    // Client-side search filtering (since backend doesn't support q= query param yet)
    if (searchParam) {
      const q = searchParam.toLowerCase();
      items = items.filter(
        (c) =>
          c.text.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          (c.ai_summary && c.ai_summary.toLowerCase().includes(q)) ||
          c.id.toLowerCase().includes(q)
      );
    }

    // Client-side sorting
    items.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'created_at') {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        comparison = timeA - timeB;
      } else if (sortField === 'priority') {
        const priorityWeight: Record<Priority, number> = { high: 3, normal: 2, low: 1 };
        comparison = (priorityWeight[a.priority] || 0) - (priorityWeight[b.priority] || 0);
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status);
      } else if (sortField === 'category') {
        comparison = a.category.localeCompare(b.category);
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return items;
  }, [data?.items, searchParam, sortField, sortOrder]);

  const totalRecords = data?.total ?? 0;
  const totalPages = Math.ceil(totalRecords / pageSizeParam) || 1;

  // Active filter count for badges
  const hasActiveFilters = Boolean(statusParam || categoryParam || priorityParam || searchParam);

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────── */}
      <PageHeader
        title="Complaints directory"
        description="Filter, search, and manage all municipal complaints registered by citizens."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<RefreshCw size={14} />}
              onClick={() => refetch()}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<FilePlus2 size={14} />}
              onClick={() => navigate('/complaints/new')}
            >
              Submit complaint
            </Button>
          </div>
        }
      />

      {/* ── Filter Controls Card ──────────────────────────────── */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
            <Input
              placeholder="Search by text, location, or summary..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={15} />}
              className="h-9"
            />
          </form>

          {/* Quick Dropdown Selectors */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Selector */}
            <div className="w-36">
              <Select
                value={statusParam || ''}
                onChange={(e) => updateParams({ status: e.target.value || null })}
              >
                <option value="">All statuses</option>
                <option value="open">New / Open</option>
                <option value="in_progress">In progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </Select>
            </div>

            {/* Category Selector */}
            <div className="w-36">
              <Select
                value={categoryParam || ''}
                onChange={(e) => updateParams({ category: e.target.value || null })}
              >
                <option value="">All categories</option>
                <option value="water">Water</option>
                <option value="electricity">Electricity</option>
                <option value="sanitation">Sanitation</option>
                <option value="roads">Roads</option>
                <option value="streetlights">Streetlights</option>
                <option value="other">Other</option>
              </Select>
            </div>

            {/* Priority Selector */}
            <div className="w-32">
              <Select
                value={priorityParam || ''}
                onChange={(e) => updateParams({ priority: e.target.value || null })}
              >
                <option value="">All priorities</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </Select>
            </div>

            {/* Page Size Selector */}
            <div className="w-28">
              <Select
                value={String(pageSizeParam)}
                onChange={(e) => updateParams({ page_size: e.target.value })}
              >
                <option value="10">10 / page</option>
                <option value="20">20 / page</option>
                <option value="50">50 / page</option>
              </Select>
            </div>
          </div>
        </div>

        {/* ── Active Filter Chips ────────────────────────────── */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-subtle)] flex-wrap text-scale-xs">
            <span className="text-[var(--text-muted)] font-medium flex items-center gap-1">
              <Filter size={12} /> Active filters:
            </span>

            {statusParam && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--primary-subtle)] text-[var(--primary)] border border-[var(--primary-border)] font-medium">
                Status: {statusParam.replace('_', ' ')}
                <button
                  type="button"
                  onClick={() => updateParams({ status: null })}
                  className="hover:opacity-75 focus-ring rounded"
                  aria-label="Remove status filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {categoryParam && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--primary-subtle)] text-[var(--primary)] border border-[var(--primary-border)] font-medium">
                Category: {categoryParam}
                <button
                  type="button"
                  onClick={() => updateParams({ category: null })}
                  className="hover:opacity-75 focus-ring rounded"
                  aria-label="Remove category filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {priorityParam && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--primary-subtle)] text-[var(--primary)] border border-[var(--primary-border)] font-medium">
                Priority: {priorityParam}
                <button
                  type="button"
                  onClick={() => updateParams({ priority: null })}
                  className="hover:opacity-75 focus-ring rounded"
                  aria-label="Remove priority filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {searchParam && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--primary-subtle)] text-[var(--primary)] border border-[var(--primary-border)] font-medium">
                Search: "{searchParam}"
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    updateParams({ q: null });
                  }}
                  className="hover:opacity-75 focus-ring rounded"
                  aria-label="Remove search filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] h-6 px-2 text-scale-xs"
            >
              Clear all
            </Button>
          </div>
        )}
      </Card>

      {/* ── Complaints Data Table ─────────────────────────────── */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-2 border-b border-[var(--border-subtle)]/40">
                <Skeleton width="45%" height={24} />
                <Skeleton width="15%" height={20} />
                <Skeleton width="15%" height={20} />
                <Skeleton width="15%" height={20} />
                <Skeleton width="10%" height={20} />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-scale-sm text-[var(--status-rejected-fg)]">
            Could not retrieve complaints from the server. Check your backend status.
          </div>
        ) : displayItems.length === 0 ? (
          <EmptyState
            title="No complaints match your filters"
            description="Try adjusting your search criteria, removing active filter chips, or browse all records."
            action={
              hasActiveFilters ? (
                <Button variant="secondary" size="sm" onClick={handleClearFilters}>
                  Clear all filters
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  icon={<FilePlus2 size={14} />}
                  onClick={() => navigate('/complaints/new')}
                >
                  Submit first complaint
                </Button>
              )
            }
          />
        ) : (
          <div className="w-full overflow-x-auto max-h-[640px]">
            <table className="w-full text-left border-collapse text-scale-sm">
              <thead className="sticky top-0 bg-[var(--bg-subtle)] border-b border-[var(--border-subtle)] text-scale-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider select-none z-10 shadow-xs">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Complaint summary & description
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 cursor-pointer hover:text-[var(--text-primary)]"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Category</span>
                      <ArrowUpDown size={12} className="text-[var(--text-muted)]" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 cursor-pointer hover:text-[var(--text-primary)]"
                    onClick={() => handleSort('priority')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Priority</span>
                      {sortField === 'priority' ? (
                        sortOrder === 'desc' ? <ArrowDown size={12} /> : <ArrowUp size={12} />
                      ) : (
                        <ArrowUpDown size={12} className="text-[var(--text-muted)]" />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 cursor-pointer hover:text-[var(--text-primary)]"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Status</span>
                      {sortField === 'status' ? (
                        sortOrder === 'desc' ? <ArrowDown size={12} /> : <ArrowUp size={12} />
                      ) : (
                        <ArrowUpDown size={12} className="text-[var(--text-muted)]" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Location
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 cursor-pointer hover:text-[var(--text-primary)]"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Reported</span>
                      {sortField === 'created_at' ? (
                        sortOrder === 'desc' ? <ArrowDown size={12} /> : <ArrowUp size={12} />
                      ) : (
                        <ArrowUpDown size={12} className="text-[var(--text-muted)]" />
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {displayItems.map((complaint) => (
                  <tr
                    key={complaint.id}
                    onClick={() => navigate(`/complaints/${complaint.id}`)}
                    className="hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer group"
                  >
                    <TableCell className="max-w-md py-3.5">
                      <div className="font-medium text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors line-clamp-1">
                        {complaint.ai_summary || complaint.text}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] line-clamp-1 mt-0.5 font-mono">
                        {complaint.id}
                      </div>
                    </TableCell>
                    <TableCell>
                      <CategoryBadge category={complaint.category} />
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={complaint.priority} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={complaint.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-scale-xs text-[var(--text-secondary)]">
                        <MapPin size={12} className="text-[var(--text-muted)] shrink-0" />
                        <span className="truncate max-w-[180px]">{complaint.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        title={formatFullDateTime(complaint.created_at)}
                        className="text-scale-xs text-[var(--text-muted)] cursor-help border-b border-dotted border-[var(--border-strong)]"
                      >
                        {formatRelativeTime(complaint.created_at)}
                      </span>
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Table Footer & Pagination ───────────────────────── */}
        <div className="px-5 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-subtle)] flex flex-col sm:flex-row items-center justify-between gap-3 text-scale-xs text-[var(--text-secondary)]">
          <div>
            Showing <span className="font-semibold text-[var(--text-primary)]">{displayItems.length}</span> of{' '}
            <span className="font-semibold text-[var(--text-primary)]">{totalRecords}</span> records
            {totalPages > 1 && ` (Page ${pageParam} of ${totalPages})`}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={pageParam <= 1}
              icon={<ChevronLeft size={14} />}
              onClick={() => updateParams({ page: String(pageParam - 1) })}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={pageParam >= totalPages}
              onClick={() => updateParams({ page: String(pageParam + 1) })}
            >
              <span>Next</span>
              <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
