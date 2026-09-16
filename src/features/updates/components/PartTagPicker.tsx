import { cn } from '@/utils/cn';
import { PART_TAGS, PART_TAG_LABEL } from '@/constants/activity-types';
import type { PartTag } from '@/types';

export interface PartTagPickerProps {
  value: PartTag[];
  onChange: (value: PartTag[]) => void;
  disabled?: boolean;
}

export function PartTagPicker({ value, onChange, disabled }: PartTagPickerProps) {
  function toggle(tag: PartTag) {
    onChange(value.includes(tag) ? value.filter((item) => item !== tag) : [...value, tag]);
  }

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-label font-semibold text-text-primary">
        Bộ phận ghi nhận
        <span className="ml-1 font-normal text-text-muted">(chọn nhiều)</span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {PART_TAGS.map((tag) => {
          const checked = value.includes(tag);
          return (
            <label
              key={tag}
              className={cn(
                'flex min-h-11 cursor-pointer items-center rounded-full border px-4 text-body-sm font-semibold transition-colors',
                'focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus-ring',
                checked
                  ? 'border-primary bg-primary-subtle text-primary-hover'
                  : 'border-border-strong bg-surface text-text-secondary hover:bg-surface-hover',
                disabled && 'cursor-not-allowed opacity-60',
              )}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                disabled={disabled}
                onChange={() => toggle(tag)}
              />
              {PART_TAG_LABEL[tag]}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
