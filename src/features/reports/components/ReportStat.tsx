import type { LucideIcon } from 'lucide-react';

export interface ReportStatProps {
  label: string;
  value: string;
  icon: LucideIcon;
}

export function ReportStat({ label, value, icon: Icon }: ReportStatProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm">
      <span
        aria-hidden
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary-hover"
      >
        <Icon className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-h3 leading-tight font-extrabold text-text-primary tabular-nums">
          {value}
        </span>
        <span className="mt-1 block text-body-sm text-text-secondary">{label}</span>
      </span>
    </div>
  );
}
