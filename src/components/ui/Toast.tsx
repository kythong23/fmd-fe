import { createContext, use, useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle2, AlertOctagon, Info, X } from 'lucide-react';
import { cn } from '@/utils/cn';

type ToastTone = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  tone: ToastTone;
  message: string;
  title?: string;
}

type ToastFn = (message: string, title?: string) => void;

interface ToastApi {
  success: ToastFn;
  error: ToastFn;
  info: ToastFn;
}

const ToastContext = createContext<ToastApi | null>(null);

const TONE = {
  success: {
    icon: CheckCircle2,
    title: 'Thành công',
    accent: 'bg-success',
    badge: 'bg-success-subtle text-success',
  },
  error: {
    icon: AlertOctagon,
    title: 'Có lỗi',
    accent: 'bg-error',
    badge: 'bg-error-subtle text-error',
  },
  info: {
    icon: Info,
    title: 'Thông tin',
    accent: 'bg-info',
    badge: 'bg-info-subtle text-info',
  },
} as const;

const AUTO_DISMISS_MS = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const push = useCallback((tone: ToastTone, message: string, title?: string) => {
    setItems((current) => [...current, { id: Date.now() + Math.random(), tone, message, title }]);
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: (message, title) => push('success', message, title),
      error: (message, title) => push('error', message, title),
      info: (message, title) => push('info', message, title),
    }),
    [push],
  );

  return (
    <ToastContext value={api}>
      {children}
      {/* Góc trên bên phải; trên mobile bám mép trên cho khỏi che thanh tác vụ dưới */}
      <div
        aria-live="polite"
        aria-atomic="false"
        style={{ zIndex: 'var(--z-toast)' }}
        className="pointer-events-none fixed inset-x-4 top-4 flex flex-col items-center gap-2 sm:inset-x-auto sm:right-4 sm:items-end"
      >
        {items.map((item) => (
          <ToastRow key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext>
  );
}

function ToastRow({ item, onDismiss }: { item: ToastItem; onDismiss: (id: number) => void }) {
  const { icon: Icon, accent, badge, title } = TONE[item.tone];

  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(item.id), AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [item.id, onDismiss]);

  return (
    <div
      role="status"
      className="pointer-events-auto w-full max-w-sm animate-slide-in-right overflow-hidden rounded-lg border border-border bg-surface shadow-lg"
    >
      <div className="flex items-start gap-3 p-3">
        <span aria-hidden className={cn('w-1 self-stretch rounded-full', accent)} />
        <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-full', badge)}>
          <Icon aria-hidden className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-body-sm font-semibold text-text-primary">{item.title ?? title}</p>
          <p className="mt-0.5 text-body-sm text-text-secondary">{item.message}</p>
        </div>
        <button
          type="button"
          aria-label="Đóng thông báo"
          onClick={() => onDismiss(item.id)}
          className="shrink-0 rounded-sm p-1 text-text-muted hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        >
          <X aria-hidden className="size-4" />
        </button>
      </div>
      {/* Vạch đếm ngược đúng bằng thời gian tự tắt */}
      <span
        aria-hidden
        className={cn('block h-1 animate-toast-timer', accent)}
        style={{ animationDuration: AUTO_DISMISS_MS + 'ms' }}
      />
    </div>
  );
}

export function useToast(): ToastApi {
  const api = use(ToastContext);
  if (!api) throw new Error('useToast phải nằm trong ToastProvider');
  return api;
}
