import type { EnforcementStatus } from '../types';

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function formatDate(iso: string): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${m}/${d}/${y}`;
}

export function isOverdue(dueDate: string): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}

export const STATUS_LABELS: Record<EnforcementStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  enforcement_required: 'Enforcement Required',
  closed: 'Closed',
};

export const STATUS_COLORS: Record<EnforcementStatus, string> = {
  open: '#3b82f6',
  in_progress: '#f59e0b',
  enforcement_required: '#ef4444',
  closed: '#22c55e',
};
