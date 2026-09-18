import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ToastProvider } from '@/components/ui';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { AuthProvider } from '@/stores/auth-context';
import { UiProvider } from '@/stores/ui-context';
import { queryClient } from './query-client';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary area="ứng dụng">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <UiProvider>
            <ToastProvider>{children}</ToastProvider>
          </UiProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
