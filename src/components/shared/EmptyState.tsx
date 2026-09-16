import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

/** Icon + tiêu đề + lý do + hành động tiếp theo (05_FRONTEND §8) */
export function EmptyState({ icon: Icon = Inbox, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border-strong bg-surface px-4 py-12 text-center">
      <Icon aria-hidden className="size-6 text-text-muted" />
      <h3 className="text-h4 text-text-primary">{title}</h3>
      <p className="max-w-md text-body-sm text-text-secondary">{description}</p>
      {action}
    </div>
  );
}
