import type { ReactNode } from 'react';
import { ErrorState } from './ErrorState';

export interface StateBoundaryProps {
  isLoading: boolean;
  error: unknown;
  isEmpty?: boolean;
  skeleton: ReactNode;
  empty?: ReactNode;
  onRetry?: () => void;
  children: ReactNode;
}

/** Bọc mọi vùng dữ liệu async — loading / error / empty / content (05_FRONTEND §8) */
export function StateBoundary({
  isLoading,
  error,
  isEmpty = false,
  skeleton,
  empty,
  onRetry,
  children,
}: StateBoundaryProps) {
  if (isLoading) {
    return (
      <div aria-busy="true" aria-live="polite">
        {skeleton}
      </div>
    );
  }
  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  if (isEmpty && empty) return <>{empty}</>;
  return <>{children}</>;
}
