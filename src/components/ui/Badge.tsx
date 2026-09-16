import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

const VARIANT: Record<BadgeVariant, string> = {
  success: 'bg-success-subtle text-success border-success/30',
  warning: 'bg-warning-subtle text-warning border-warning/30',
  error: 'bg-error-subtle text-error border-error/30',
  info: 'bg-info-subtle text-info border-info/30',
  neutral: 'bg-neutral-subtle text-neutral border-neutral/30',
  primary: 'bg-primary-subtle text-primary-hover border-primary/30',
};

const SIZE: Record<BadgeSize, string> = {
  sm: 'text-caption px-2 py-0.5 gap-1',
  md: 'text-body-sm px-3 py-1 gap-1.5',
};

/** Badge luôn có icon + chữ — màu không được là tín hiệu duy nhất (07 §5) */
export function Badge({ variant = 'neutral', size = 'sm', icon, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-semibold whitespace-nowrap',
        VARIANT[variant],
        SIZE[size],
        className,
      )}
    >
      {icon && (
        <span aria-hidden className="inline-flex shrink-0">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}
