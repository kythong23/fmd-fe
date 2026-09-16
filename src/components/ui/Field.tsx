import { useId } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface FieldRenderProps {
  id: string;
  describedBy: string | undefined;
  invalid: boolean;
}

export interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  /** Ẩn label khỏi màn hình nhưng vẫn giữ cho screen reader */
  hideLabel?: boolean;
  className?: string;
  children: (props: FieldRenderProps) => ReactNode;
}

/** Bọc chung cho Input/Select/Textarea — mọi input đều có label gắn htmlFor (05_FRONTEND §10) */
export function Field({ label, hint, error, required, hideLabel, className, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? id + '-hint' : undefined;
  const errorId = error ? id + '-error' : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={id}
        className={cn('text-label font-semibold text-text-primary', hideLabel && 'sr-only')}
      >
        {label}
        {required && <span className="text-error"> *</span>}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {error ? (
        <p id={errorId} role="alert" className="text-caption font-medium text-error">
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className="text-caption text-text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export const controlBase =
  'w-full rounded-md border bg-surface text-body text-text-primary placeholder:text-text-muted transition-colors ' +
  'focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-focus-ring ' +
  'disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:text-disabled-fg';

export const controlSize = {
  sm: 'h-control-sm px-2 text-body-sm',
  md: 'h-control-md px-3',
  lg: 'h-control-lg px-4',
} as const;

export function controlTone(invalid: boolean): string {
  return invalid ? 'border-error' : 'border-border-strong hover:border-neutral';
}
