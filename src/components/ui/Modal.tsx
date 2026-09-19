import { useId } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useFocusTrap } from '@/hooks/use-focus-trap';
import { Button } from './Button';
import type { ReactNode } from 'react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'full';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: ModalSize;
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * Quy tắc chung cho mọi popup: chiều rộng nở dần theo viewport, không cố định một mức.
 * Màn lớn → dialog rộng hơn để item dễ nhìn/thao tác; mobile vẫn là full-screen sheet.
 */
const SIZE: Record<ModalSize, string> = {
  sm: 'md:max-w-md lg:max-w-lg xl:max-w-xl',
  md: 'md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl',
  lg: 'md:max-w-3xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl',
  full: 'md:max-w-5xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem]',
};

/**
 * Mobile: full-screen sheet. md+: dialog căn giữa (05_FRONTEND §9).
 * Một component cho cả hai — không tách Drawer riêng cho form.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  footer,
  children,
}: ModalProps) {
  const titleId = useId();
  const descId = useId();
  const ref = useFocusTrap<HTMLDivElement>(open, onClose);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-stretch justify-center md:items-center md:p-4"
      style={{ zIndex: 'var(--z-modal)' }}
    >
      <button
        type="button"
        aria-label="Đóng hộp thoại"
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
        aria-describedby={description ? descId : undefined}
        className={cn(
          'relative flex w-full animate-slide-up flex-col bg-surface shadow-lg',
          'h-full md:h-auto md:max-h-[90vh] md:rounded-lg 2xl:max-h-[85vh]',
          SIZE[size],
        )}
      >
        <header className="flex items-start justify-between gap-3 border-b border-border p-4 sm:p-6 2xl:p-8">
          <div className="min-w-0">
            <h2 id={titleId} className="text-h3 text-text-primary">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-1 text-body-sm text-text-secondary">
                {description}
              </p>
            )}
          </div>
          <Button variant="ghost" size="md" iconOnly aria-label="Đóng" onClick={onClose}>
            <X aria-hidden className="size-5" />
          </Button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 2xl:p-8">{children}</div>

        {footer && (
          <footer className="flex flex-col-reverse gap-2 border-t border-border p-4 sm:flex-row sm:justify-end sm:p-6 2xl:p-8">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}
