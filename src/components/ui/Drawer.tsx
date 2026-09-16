import { useId } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useFocusTrap } from '@/hooks/use-focus-trap';
import { Button } from './Button';
import type { ReactNode } from 'react';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  side?: 'left' | 'right' | 'bottom';
  children: ReactNode;
}

const SIDE = {
  left: 'inset-y-0 left-0 w-72 max-w-[85vw] border-r',
  right: 'inset-y-0 right-0 w-80 max-w-[85vw] border-l',
  bottom: 'inset-x-0 bottom-0 max-h-[85vh] rounded-t-xl border-t',
} as const;

/** Panel trượt — dùng cho Sidebar mobile, bộ lọc, bottom sheet của map */
export function Drawer({ open, onClose, title, side = 'left', children }: DrawerProps) {
  const titleId = useId();
  const ref = useFocusTrap<HTMLDivElement>(open, onClose);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0" style={{ zIndex: 'var(--z-modal)' }}>
      <button
        type="button"
        aria-label="Đóng bảng"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in cursor-default"
        style={{ backgroundColor: 'var(--overlay-bg)' }}
        tabIndex={-1}
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'absolute flex animate-slide-up flex-col border-border bg-surface shadow-lg',
          SIDE[side],
        )}
      >
        <header className="flex items-center justify-between gap-3 border-b border-border p-4">
          <h2 id={titleId} className="text-h4 text-text-primary">
            {title}
          </h2>
          <Button variant="ghost" size="md" iconOnly aria-label="Đóng" onClick={onClose}>
            <X aria-hidden className="size-5" />
          </Button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
