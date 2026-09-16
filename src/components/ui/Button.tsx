import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';
export type ControlSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: ButtonVariant;
  size?: ControlSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  iconOnly?: boolean;
  fullWidth?: boolean;
  children?: ReactNode;
}

const VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-fg hover:bg-primary-hover active:bg-primary-hover shadow-sm',
  secondary:
    'bg-surface text-text-primary border border-border-strong hover:bg-surface-hover active:bg-surface-sunken',
  ghost: 'bg-transparent text-text-secondary hover:bg-surface-hover active:bg-surface-sunken',
  danger: 'bg-error text-text-inverse hover:opacity-90 active:opacity-100 shadow-sm',
  link: 'bg-transparent text-primary underline underline-offset-4 hover:text-primary-hover',
};

const SIZE: Record<ControlSize, string> = {
  sm: 'h-control-sm text-body-sm px-3 gap-1.5 rounded-md',
  md: 'h-control-md text-button px-4 gap-2 rounded-md',
  lg: 'h-control-lg text-body px-6 gap-2 rounded-lg',
};

/** Icon-only: giữ touch target >= 44px cho thao tác ngoài vườn (05_FRONTEND §9) */
const ICON_ONLY: Record<ControlSize, string> = {
  sm: 'w-control-sm px-0',
  md: 'w-control-md px-0 min-w-11 min-h-11',
  lg: 'w-control-lg px-0',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    leftIcon,
    rightIcon,
    iconOnly = false,
    fullWidth = false,
    disabled,
    className,
    children,
    type = 'button',
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || loading;
  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex shrink-0 items-center justify-center font-semibold transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
        'disabled:cursor-not-allowed disabled:border-border disabled:bg-disabled-bg disabled:text-disabled-fg disabled:shadow-none',
        VARIANT[variant],
        SIZE[size],
        iconOnly && ICON_ONLY[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Loader2 aria-hidden className="size-5 animate-spin" />
      ) : (
        leftIcon && (
          <span aria-hidden className="inline-flex shrink-0">
            {leftIcon}
          </span>
        )
      )}
      {children}
      {!loading && rightIcon && (
        <span aria-hidden className="inline-flex shrink-0">
          {rightIcon}
        </span>
      )}
    </button>
  );
});
