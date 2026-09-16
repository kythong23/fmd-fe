import { useId } from 'react';
import { createPortal } from 'react-dom';
import { Check, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useFocusTrap } from '@/hooks/use-focus-trap';
import { Button } from './Button';
import type { ReactNode } from 'react';

export type StatusTone = 'success' | 'error';

export interface StatusModalProps {
  open: boolean;
  tone: StatusTone;
  title: string;
  description?: ReactNode;
  /** Nút chính; bỏ trống thì chỉ hiện nút Đóng */
  actionLabel?: string;
  onAction?: () => void;
  closeLabel?: string;
  onClose: () => void;
}

const TONE = {
  success: {
    icon: Check,
    badge: 'bg-success text-text-inverse',
    halo: 'bg-success/25',
    action: 'primary',
  },
  error: {
    icon: X,
    badge: 'bg-error text-text-inverse',
    halo: 'bg-error/25',
    action: 'danger',
  },
} as const;

/**
 * Popup báo kết quả: huy hiệu tròn có quầng sáng, nội dung căn giữa.
 * Khác Modal (form nhiều nội dung) — cái này chỉ để chốt một kết quả.
 */
export function StatusModal({
  open,
  tone,
  title,
  description,
  actionLabel,
  onAction,
  closeLabel = 'Đóng',
  onClose,
}: StatusModalProps) {
  const titleId = useId();
  const descId = useId();
  const ref = useFocusTrap<HTMLDivElement>(open, onClose);
  const { icon: Icon, badge, halo, action } = TONE[tone];

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
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
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className="relative w-full max-w-sm animate-slide-up rounded-xl bg-surface p-6 pt-12 text-center shadow-lg"
      >
        {/* Huy hiệu tròn nhô nửa ra ngoài mép trên, có quầng sáng như ảnh mẫu */}
        <div className="absolute inset-x-0 -top-9 flex justify-center">
          <span className={cn('absolute size-24 rounded-full blur-xl', halo)} aria-hidden />
          <span
            className={cn(
              'relative flex size-18 items-center justify-center rounded-full ring-8 ring-surface',
              badge,
            )}
          >
            <Icon aria-hidden className="size-9" strokeWidth={3} />
          </span>
        </div>

        <h2 id={titleId} className="text-h3 text-text-primary">
          {title}
        </h2>
        {description && (
          <p id={descId} className="mt-2 text-body-sm text-text-secondary">
            {description}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-2">
          {actionLabel && (
            <Button variant={action} size="lg" fullWidth onClick={onAction ?? onClose}>
              {actionLabel}
            </Button>
          )}
          <Button variant={actionLabel ? 'ghost' : action} size="lg" fullWidth onClick={onClose}>
            {closeLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
