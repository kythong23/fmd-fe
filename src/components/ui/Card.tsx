import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  padding?: 'none' | 'sm' | 'md';
  interactive?: boolean;
  as?: ElementType;
  children: ReactNode;
}

const PADDING = {
  none: '',
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-6',
} as const;

export function Card({
  padding = 'md',
  interactive = false,
  as,
  className,
  children,
  ...rest
}: CardProps) {
  const Component = as ?? 'div';
  return (
    <Component
      className={cn(
        'rounded-lg border border-border bg-surface shadow-sm',
        PADDING[padding],
        interactive &&
          'cursor-pointer text-left transition-colors hover:border-border-strong hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
        className,
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-4 flex items-start justify-between gap-3', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn('text-h4 font-bold text-text-primary', className)} {...rest}>
      {children}
    </h2>
  );
}

Card.Header = CardHeader;
Card.Title = CardTitle;
