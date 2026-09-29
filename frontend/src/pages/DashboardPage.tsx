// ─────────────────────────────────────────────────────────────
// src/pages/DashboardPage.tsx
// High-polish municipal operations overview.
// - 32px vertical rhythm (space-y-8)
// - 4 stat cards with 40px tinted icon tiles and non-colored semibold numbers
// - 7-day intake trend smooth AreaChart (zero-filled, weekday ticks, hover dots)
// - Category distribution BarChart (sorted descending, maxBarSize 40, rounded corners)
// - Shared category config (constants/categories.ts)
// - "Needs attention" table with unclipped Action column and responsive Location
// ─────────────────────────────────────────────────────────────
import { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Inbox,
  AlertCircle,
  Clock,
  CheckCircle2,
  FilePlus2,
  RefreshCw,
  ArrowRight,
  MapPin,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useStats, useComplaints } from '../hooks/useComplaints';
import { useHealth } from '../hooks/useSystem';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { formatRelativeTime } from '../lib/date';
import { CATEGORY_CONFIG, getCategoryMeta } from '../constants/categories';
import {
  Button,
  StatusBadge,
  PriorityBadge,
  CategoryBadge,
  Skeleton,
} from '../components/ui';

// Custom clean chart tooltip
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
  label?: string;
  suffix?: string;
}

function ChartTooltip({ active, payload, label, suffix = 'complaints' }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-strong)] shadow-md text-[12px]">
        <div className="font-semibold text-[var(--text-primary)]">{label}</div>
        <div className="text-[var(--text-secondary)] mt-0.5">
          <span className="font-medium text-[var(--primary)]">{payload[0].value}</span>{' '}
          {suffix}
        </div>
      </div>
    );
  }
  return null;
}

export default function DashboardPage() {
  useDocumentTitle('Overview');
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useStats();

  // High priority open complaints for the "Needs attention" table
  const {
    data: attentionData,
    isLoading: attentionLoading,
    refetch: refetchAttention,
  } = useComplaints({ status: 'open', priority: 'high', page_size: 5 });

  // 50 recent items to compute accurate 7-day intake series
  const {
    data: recentData,
    isLoading: recentLoading,
    refetch: refetchRecent,
  } = useComplaints({ page_size: 50 });

  const { data: health, refetch: refetchHealth } = useHealth();
  const isHealthy = health?.status === 'healthy';

  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  function handleRefreshAll() {
    refetchStats();
    refetchAttention();
    refetchRecent();
    refetchHealth();
  }

  // ── 7-Day Intake Trend Aggregation ────────────────────────────
  // Group complaints by day for the last 7 calendar days (7 points, zero-filled)
  const trendData = useMemo(() => {
    const days: Array<{ date: string; weekday: string; count: number }> = [];
    const now = new Date();

    // Generate last 7 days (from 6 days ago up to today)
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const isoDate = d.toISOString().split('T')[0];
      const weekday = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
      days.push({ date: isoDate, weekday, count: 0 });
    }

    if (recentData?.items) {
      recentData.items.forEach((item) => {
        if (!item.created_at) return;
        const itemDate = item.created_at.split('T')[0];
        const match = days.find((day) => day.date === itemDate);
        if (match) {
          match.count += 1;
        }
      });
    }

    return days;
  }, [recentData]);

  // ── Category Distribution (Sorted descending, shared config) ──
  const categoryData = useMemo(() => {
    if (!stats?.by_category) {
      // Fallback empty structure
      return Object.values(CATEGORY_CONFIG).map((c) => ({
        id: c.id,
        name: c.label,
        count: 0,
        color: c.color,
      }));
    }

    return Object.entries(stats.by_category)
      .map(([key, count]) => {
        const meta = getCategoryMeta(key);
        return {
          id: key,
          name: meta.label,
          count: count,
          color: meta.color,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [stats]);

  const total = stats?.total ?? 0;
  const openCount = stats?.by_status?.open ?? 0;
  const inProgressCount = stats?.by_status?.in_progress ?? 0;
  const resolvedCount = stats?.by_status?.resolved ?? 0;

  const openShare = total > 0 ? Math.round((openCount / total) * 100) : 0;
  const inProgressShare = total > 0 ? Math.round((inProgressCount / total) * 100) : 0;
  const resolvedShare = total > 0 ? Math.round((resolvedCount / total) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* ── Page Header: 24px semibold title with tight letter-spacing ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold text-[var(--text-primary)] tracking-tight">
            Municipal Overview
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)] mt-0.5">
            Real-time status of civic complaints, AI triage workloads, and operational dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefreshAll}
            className="flex items-center gap-1.5 text-[13px]"
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={() => navigate('/complaints/new')}
            className="flex items-center gap-1.5 text-[13px]"
          >
            <FilePlus2 size={14} />
            <span>New complaint</span>
          </Button>
        </div>
      </div>

      {/* ── System Offline Banner ──────────────────────────────── */}
      {!isHealthy && (
        <div
          role="alert"
          className="flex items-center justify-between p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 text-[13px]"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle size={16} className="shrink-0" />
            <span>
              Backend API is currently offline. Showing cached municipal records.
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => refetchHealth()}>
            Retry
          </Button>
        </div>
      )}

      {/* ── 1. Stat Cards (4 columns, gap-6, p-6, 1px border, rounded-xl, subtle shadow) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total complaints */}
        <div className="p-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xs flex items-start justify-between">
          <div>
            <div className="text-[13px] font-medium text-[var(--text-muted)]">
              Total complaints
            </div>
            <div className="text-[32px] leading-tight font-semibold text-[var(--text-primary)] mt-1.5">
              {statsLoading ? <Skeleton width={48} height={32} /> : total}
            </div>
            <div className="text-[13px] text-[var(--text-muted)] mt-1.5">
              Recorded in municipal registry
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Inbox size={20} />
          </div>
        </div>

        {/* New / Unresolved */}
        <div className="p-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xs flex items-start justify-between">
          <div>
            <div className="text-[13px] font-medium text-[var(--text-muted)]">
              New / Unresolved
            </div>
            <div className="text-[32px] leading-tight font-semibold text-[var(--text-primary)] mt-1.5">
              {statsLoading ? <Skeleton width={48} height={32} /> : openCount}
            </div>
            <div className="text-[13px] text-[var(--text-muted)] mt-1.5">
              {openShare}% of total caseload
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 flex items-center justify-center shrink-0">
            <AlertCircle size={20} />
          </div>
        </div>

        {/* In progress */}
        <div className="p-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xs flex items-start justify-between">
          <div>
            <div className="text-[13px] font-medium text-[var(--text-muted)]">
              In progress
            </div>
            <div className="text-[32px] leading-tight font-semibold text-[var(--text-primary)] mt-1.5">
              {statsLoading ? <Skeleton width={48} height={32} /> : inProgressCount}
            </div>
            <div className="text-[13px] text-[var(--text-muted)] mt-1.5">
              {inProgressShare}% undergoing dispatch
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock size={20} />
          </div>
        </div>

        {/* Resolved */}
        <div className="p-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xs flex items-start justify-between">
          <div>
            <div className="text-[13px] font-medium text-[var(--text-muted)]">
              Resolved
            </div>
            <div className="text-[32px] leading-tight font-semibold text-[var(--text-primary)] mt-1.5">
              {statsLoading ? <Skeleton width={48} height={32} /> : resolvedCount}
            </div>
            <div className="text-[13px] text-[var(--text-muted)] mt-1.5">
              {resolvedShare}% resolution rate
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* ── 2. Visualizations (2 columns, gap-6, proper card headers) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Intake Trend AreaChart */}
        <div className="p-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xs flex flex-col">
          <div className="pb-4 border-b border-[var(--border-subtle)] mb-5">
            <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">
              Intake Volume (Past 7 Days)
            </h2>
            <p className="text-[13px] text-[var(--text-muted)] mt-0.5">
              Daily citizen complaints reported across municipal sectors
            </p>
          </div>

          <div className="h-64 w-full">
            {recentLoading ? (
              <div className="h-full flex items-center justify-center">
                <Skeleton width="100%" height="100%" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trendData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="intakeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border-subtle)"
                  />
                  <XAxis
                    dataKey="weekday"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={<ChartTooltip suffix="complaints reported" />}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#intakeGradient)"
                    dot={false}
                    activeDot={{
                      r: 4,
                      fill: '#2563eb',
                      stroke: 'var(--bg-surface)',
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category Breakdown BarChart */}
        <div className="p-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xs flex flex-col">
          <div className="pb-4 border-b border-[var(--border-subtle)] mb-5">
            <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">
              Complaints by Category
            </h2>
            <p className="text-[13px] text-[var(--text-muted)] mt-0.5">
              Ranked breakdown of current municipal caseload by department
            </p>
          </div>

          <div className="h-64 w-full">
            {statsLoading ? (
              <div className="h-full flex items-center justify-center">
                <Skeleton width="100%" height="100%" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  onMouseMove={(state) => {
                    if (typeof state.activeTooltipIndex === 'number') {
                      setHoveredBarIndex(state.activeTooltipIndex);
                    }
                  }}
                  onMouseLeave={() => setHoveredBarIndex(null)}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border-subtle)"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                    dy={8}
                    interval={0}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={<ChartTooltip suffix="complaints in category" />}
                    cursor={{ fill: 'var(--bg-subtle)', opacity: 0.6 }}
                  />
                  <Bar
                    dataKey="count"
                    maxBarSize={40}
                    radius={[4, 4, 0, 0]}
                  >
                    {categoryData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill="#2563eb"
                        fillOpacity={hoveredBarIndex === index ? 1 : 0.8}
                        className="transition-opacity duration-150"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. "Needs Attention" Table ──────────────────────────── */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xs overflow-hidden">
        {/* Table Card Header with unclipped "View all" link */}
        <div className="p-6 pb-4 border-b border-[var(--border-subtle)] flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">
                Needs Immediate Attention
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                High Priority Open
              </span>
            </div>
            <p className="text-[13px] text-[var(--text-muted)] mt-0.5">
              Unresolved critical civic reports requiring urgent review or dispatch.
            </p>
          </div>

          <Link
            to="/complaints?status=open&priority=high"
            className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--primary)] hover:underline shrink-0"
          >
            <span>View all</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Table element with explicit widths so Action column is never clipped */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed">
            <colgroup>
              <col className="w-[34%]" />
              <col className="w-[14%]" />
              <col className="w-[11%]" />
              <col className="w-[11%]" />
              <col className="hidden xl:table-column w-[16%]" />
              <col className="w-[14%]" />
              <col className="w-[88px]" />
            </colgroup>
            <thead>
              <tr className="bg-[var(--bg-subtle)] border-b border-[var(--border-subtle)]">
                <th className="px-6 py-3 text-[12px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  Complaint
                </th>
                <th className="px-6 py-3 text-[12px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  Category
                </th>
                <th className="px-6 py-3 text-[12px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  Priority
                </th>
                <th className="px-6 py-3 text-[12px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  Status
                </th>
                <th className="hidden xl:table-cell px-6 py-3 text-[12px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  Location
                </th>
                <th className="px-6 py-3 text-[12px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  Reported
                </th>
                <th className="px-6 py-3 text-[12px] font-medium uppercase tracking-wider text-[var(--text-muted)] text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {attentionLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="h-16">
                    <td className="px-6 py-3.5"><Skeleton width="80%" height={16} /></td>
                    <td className="px-6 py-3.5"><Skeleton width={80} height={22} /></td>
                    <td className="px-6 py-3.5"><Skeleton width={60} height={22} /></td>
                    <td className="px-6 py-3.5"><Skeleton width={60} height={22} /></td>
                    <td className="hidden xl:table-cell px-6 py-3.5"><Skeleton width={100} height={16} /></td>
                    <td className="px-6 py-3.5"><Skeleton width={70} height={16} /></td>
                    <td className="px-6 py-3.5 text-right"><Skeleton width={56} height={26} /></td>
                  </tr>
                ))
              ) : !attentionData?.items || attentionData.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-[13px] text-[var(--text-muted)]">
                    No open high-priority complaints. All urgent reports have been triaged!
                  </td>
                </tr>
              ) : (
                attentionData.items.map((complaint) => (
                  <tr
                    key={complaint.id}
                    onClick={() => navigate(`/complaints/${complaint.id}`)}
                    className="h-16 hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer group"
                  >
                    {/* Complaint text */}
                    <td className="px-6 py-3.5">
                      <div className="font-medium text-[13px] text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors truncate">
                        {complaint.ai_summary || complaint.text}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                        {complaint.text}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-3.5">
                      <CategoryBadge category={complaint.category} />
                    </td>

                    {/* Priority */}
                    <td className="px-6 py-3.5">
                      <PriorityBadge priority={complaint.priority} />
                    </td>

                    {/* Status */}
                    <td className="px-6 py-3.5">
                      <StatusBadge status={complaint.status} />
                    </td>

                    {/* Location (hidden < 1280px) */}
                    <td className="hidden xl:table-cell px-6 py-3.5 text-[13px] text-[var(--text-secondary)]">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin size={13} className="shrink-0 text-[var(--text-muted)]" />
                        <span className="truncate">{complaint.location}</span>
                      </div>
                    </td>

                    {/* Reported */}
                    <td className="px-6 py-3.5 text-[12px] text-[var(--text-muted)] whitespace-nowrap">
                      {formatRelativeTime(complaint.created_at)}
                    </td>

                    {/* Action Button */}
                    <td className="px-6 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => navigate(`/complaints/${complaint.id}`)}
                        className="px-2.5 py-1 text-[12px] font-medium rounded-md border border-[var(--border-strong)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors cursor-pointer focus-ring"
                      >
                        Triage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
