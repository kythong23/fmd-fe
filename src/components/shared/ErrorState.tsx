import { AlertOctagon, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui';
import { toAppError } from '@/services/http';

export interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  title?: string;
}

/** Nói chuyện gì xảy ra + làm gì tiếp + nút Thử lại. Cấm chữ "Error" trần (05_FRONTEND §8) */
export function ErrorState({ error, onRetry, title = 'Không tải được dữ liệu' }: ErrorStateProps) {
  const appError = toAppError(error);

  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-lg border border-error/30 bg-error-subtle px-4 py-12 text-center"
    >
      <AlertOctagon aria-hidden className="size-6 text-error" />
      <h3 className="text-h4 text-text-primary">{title}</h3>
      <p className="max-w-md text-body-sm text-text-secondary">{appError.message}</p>
      {onRetry && appError.retryable && (
        <Button variant="secondary" onClick={onRetry} leftIcon={<RotateCcw className="size-5" />}>
          Thử lại
        </Button>
      )}
    </div>
  );
}
