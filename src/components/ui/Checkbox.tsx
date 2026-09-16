import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  hint?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, hint, className, disabled, ...rest },
  ref,
) {
  const id = useId();
  const hintId = hint ? id + '-hint' : undefined;
  return (
    <div className="flex items-start gap-3">
      <input
        ref={ref}
        id={id}
        type="checkbox"
        disabled={disabled}
        aria-describedby={hintId}
        className={cn(
          'mt-0.5 size-5 shrink-0 cursor-pointer rounded-sm border-border-strong accent-primary',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
          'disabled:cursor-not-allowed',
          className,
        )}
        {...rest}
      />
      <div className="flex flex-col">
        <label
          htmlFor={id}
          className={cn(
            'cursor-pointer text-body-sm font-medium text-text-primary',
            disabled && 'cursor-not-allowed text-disabled-fg',
          )}
        >
          {label}
        </label>
        {hint && (
          <span id={hintId} className="text-caption text-text-muted">
            {hint}
          </span>
        )}
      </div>
    </div>
  );
});
