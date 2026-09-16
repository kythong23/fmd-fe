import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: 'primary' | 'success' | 'warning' | 'error';
  onClick: () => void;
}

const TONE = {
  primary: 'bg-primary-subtle text-primary-hover',
  success: 'bg-success-subtle text-success',
  warning: 'bg-warning-subtle text-warning',
  error: 'bg-error-subtle text-error',
} as const;

export function StatCard({ label, value, icon: Icon, tone, onClick }: StatCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 text-left shadow-sm transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
    >
      <span
        aria-hidden
        className={cn('flex size-10 shrink-0 items-center justify-center rounded-full', TONE[tone])}
      >
        <Icon className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-display leading-none font-extrabold text-text-primary">
          {value}
        </span>
        <span className="mt-1 block text-body-sm text-text-secondary">{label}</span>
      </span>
    </button>
  );
}
