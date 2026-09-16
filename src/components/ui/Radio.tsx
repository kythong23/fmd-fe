import { useId } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface RadioOption {
  value: string;
  label: string;
  icon?: ReactNode;
  description?: string;
}

export interface RadioGroupProps {
  label: string;
  name: string;
  options: RadioOption[];
  value: string | null;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  columns?: 2 | 3 | 4;
  disabled?: boolean;
}

const COLUMNS = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
} as const;

/** Radio dạng thẻ — touch target lớn, đủ rõ khi thao tác ngoài nắng */
export function RadioGroup({
  label,
  name,
  options,
  value,
  onChange,
  error,
  required,
  columns = 2,
  disabled,
}: RadioGroupProps) {
  const id = useId();
  const errorId = error ? id + '-error' : undefined;

  return (
    <fieldset className="flex flex-col gap-2" aria-describedby={errorId}>
      <legend className="mb-1 text-label font-semibold text-text-primary">
        {label}
        {required && <span className="text-error"> *</span>}
      </legend>
      <div className={cn('grid gap-2', COLUMNS[columns])}>
        {options.map((option) => {
          const checked = value === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                'flex min-h-11 cursor-pointer items-center gap-2 rounded-md border p-3 text-body-sm font-medium transition-colors',
                'focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus-ring',
                checked
                  ? 'border-primary bg-primary-subtle text-primary-hover'
                  : 'border-border-strong bg-surface text-text-secondary hover:bg-surface-hover',
                disabled && 'cursor-not-allowed opacity-60',
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                disabled={disabled}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {option.icon && <span aria-hidden className="shrink-0">{option.icon}</span>}
              <span className="flex flex-col">
                <span>{option.label}</span>
                {option.description && (
                  <span className="text-caption text-text-muted">{option.description}</span>
                )}
              </span>
            </label>
          );
        })}
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-caption font-medium text-error">
          {error}
        </p>
      )}
    </fieldset>
  );
}
