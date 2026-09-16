import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface TooltipProps {
  content: string;
  children: ReactNode;
  side?: 'top' | 'bottom';
  className?: string;
}

/** CSS-only positioning, hiện khi hover hoặc focus — không cần thư viện popper */
export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);

  return (
    <span
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span aria-describedby={open ? id : undefined} className="inline-flex">
        {children}
      </span>
      {open && (
        <span
          role="tooltip"
          id={id}
          style={{ zIndex: 'var(--z-tooltip)' }}
          className={cn(
            'pointer-events-none absolute left-1/2 w-max max-w-56 -translate-x-1/2 rounded-md bg-text-primary px-2 py-1 text-caption text-text-inverse shadow-md',
            side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
