import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ToastProvider } from '@/components/ui';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { AuthProvider } from '@/stores/auth-context';
import { UiProvider } from '@/stores/ui-context';
import { toAppError } from '@/services/http';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Mạng vườn yếu là mặc định: thử lại 1 lần, lỗi không retryable thì dừng ngay
      retry: (failureCount, error) => failureCount < 1 && toAppError(error).retryable,
      refetchOnWindowFocus: false,
    },
    mutations: { retry: false },
  },
});

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
