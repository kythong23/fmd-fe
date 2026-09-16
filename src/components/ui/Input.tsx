import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { Field, controlBase, controlSize, controlTone } from './Field';
import type { ControlSize } from './Button';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  hint?: string;
  error?: string;
  size?: ControlSize;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
  hideLabel?: boolean;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hint,
    error,
    required,
    size = 'md',
    leftIcon,
    rightSlot,
    hideLabel,
    containerClassName,
    className,
    ...rest
  },
  ref,
) {
  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={required}
      hideLabel={hideLabel}
      className={containerClassName}
    >
      {({ id, describedBy, invalid }) => (
        <div className="relative">
          {leftIcon && (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-text-muted"
            >
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            required={required}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            className={cn(
              controlBase,
              controlSize[size],
              controlTone(invalid),
              Boolean(leftIcon) && 'pl-10',
              Boolean(rightSlot) && 'pr-10',
              className,
            )}
            {...rest}
          />
          {rightSlot && (
            <span className="absolute inset-y-0 right-1 flex items-center">{rightSlot}</span>
          )}
        </div>
      )}
    </Field>
  );
});
