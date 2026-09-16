import { cn } from '@/utils/cn';
import type { ReactNode } from 'react';

export interface TabItem {
  value: string;
  label: string;
  icon?: ReactNode;
  count?: number;
}

export interface TabsProps {
  label: string;
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Tabs({ label, items, value, onChange, className }: TabsProps) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn('flex gap-1 overflow-x-auto border-b border-border', className)}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              'inline-flex min-h-11 shrink-0 items-center gap-2 border-b-2 px-4 text-body-sm font-semibold transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
              active
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:border-border-strong hover:text-text-primary',
            )}
          >
            {item.icon && <span aria-hidden>{item.icon}</span>}
            {item.label}
            {item.count !== undefined && (
              <span className="rounded-full bg-surface-sunken px-2 text-caption text-text-secondary">
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
