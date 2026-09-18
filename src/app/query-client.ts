import { QueryClient } from '@tanstack/react-query';
import { toAppError } from '@/services/http';

export const queryClient = new QueryClient({
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
