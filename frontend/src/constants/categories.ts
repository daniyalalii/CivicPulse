// ─────────────────────────────────────────────────────────────
// src/constants/categories.ts
// Single source of truth for complaint categories across the entire app.
// Matches backend domain enum: water, electricity, sanitation, roads, streetlights, other.
// ─────────────────────────────────────────────────────────────
import {
  Droplets,
  Zap,
  Trash2,
  Construction,
  Lightbulb,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react';
import type { Category } from '../types';

export interface CategoryMeta {
  id: Category;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  color: string;           // Primary hex for charts & accents
  bgClass: string;         // Light tint class
  textClass: string;       // Darker tone text class
  chartFill: string;       // Fill with opacity for Recharts
}

export const CATEGORY_CONFIG: Record<Category, CategoryMeta> = {
  water: {
    id: 'water',
    label: 'Water Supply',
    shortLabel: 'Water',
    icon: Droplets,
    color: '#0284c7', // sky-600
    bgClass: 'bg-sky-50 dark:bg-sky-950/40',
    textClass: 'text-sky-700 dark:text-sky-300',
    chartFill: 'rgba(2, 132, 199, 0.82)',
  },
  electricity: {
    id: 'electricity',
    label: 'Electricity',
    shortLabel: 'Power',
    icon: Zap,
    color: '#eab308', // yellow-500
    bgClass: 'bg-amber-50 dark:bg-amber-950/40',
    textClass: 'text-amber-800 dark:text-amber-300',
    chartFill: 'rgba(234, 179, 8, 0.82)',
  },
  sanitation: {
    id: 'sanitation',
    label: 'Sanitation',
    shortLabel: 'Waste',
    icon: Trash2,
    color: '#10b981', // emerald-500
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/40',
    textClass: 'text-emerald-700 dark:text-emerald-300',
    chartFill: 'rgba(16, 185, 129, 0.82)',
  },
  roads: {
    id: 'roads',
    label: 'Roads & Pavement',
    shortLabel: 'Roads',
    icon: Construction,
    color: '#f97316', // orange-500
    bgClass: 'bg-orange-50 dark:bg-orange-950/40',
    textClass: 'text-orange-700 dark:text-orange-300',
    chartFill: 'rgba(249, 115, 22, 0.82)',
  },
  streetlights: {
    id: 'streetlights',
    label: 'Streetlights',
    shortLabel: 'Lighting',
    icon: Lightbulb,
    color: '#8b5cf6', // violet-500
    bgClass: 'bg-violet-50 dark:bg-violet-950/40',
    textClass: 'text-violet-700 dark:text-violet-300',
    chartFill: 'rgba(139, 92, 246, 0.82)',
  },
  other: {
    id: 'other',
    label: 'Other Services',
    shortLabel: 'Other',
    icon: HelpCircle,
    color: '#64748b', // slate-500
    bgClass: 'bg-slate-100 dark:bg-slate-800',
    textClass: 'text-slate-700 dark:text-slate-300',
    chartFill: 'rgba(100, 116, 139, 0.82)',
  },
};

export function getCategoryMeta(category: string | undefined): CategoryMeta {
  if (category && category in CATEGORY_CONFIG) {
    return CATEGORY_CONFIG[category as Category];
  }
  return CATEGORY_CONFIG.other;
}
