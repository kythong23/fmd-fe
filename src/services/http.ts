import type { ApiErrorBody } from '@/types';

export interface AppError {
  code: string;
  message: string;
  retryable: boolean;
  status?: number;
}

const TIMEOUT_MS = 15_000;

const MESSAGES: Record<string, string> = {
  NETWORK: 'Không kết nối được máy chủ. Kiểm tra sóng hoặc wifi rồi thử lại.',
  TIMEOUT: 'Máy chủ phản hồi quá lâu (trên 15 giây). Sóng ở vườn có thể yếu — thử lại giúp bạn.',
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Đăng nhập lại để tiếp tục.',
  FORBIDDEN: 'Tài khoản của bạn không có quyền thực hiện thao tác này.',
  NOT_FOUND: 'Không tìm thấy dữ liệu cần xem.',
  VALIDATION: 'Dữ liệu gửi lên chưa hợp lệ. Kiểm tra lại các ô đã nhập.',
  SERVER: 'Máy chủ đang gặp sự cố. Thử lại sau ít phút.',
  UNKNOWN: 'Đã có lỗi ngoài dự tính. Thử lại hoặc báo quản trị viên.',
};

export function appError(code: keyof typeof MESSAGES | string, override?: Partial<AppError>): AppError {
  return {
    code,
    message: MESSAGES[code] ?? MESSAGES.UNKNOWN,
    retryable: code !== 'FORBIDDEN' && code !== 'VALIDATION' && code !== 'NOT_FOUND',
    ...override,
  };
}

function isAppError(value: unknown): value is AppError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'message' in value &&
    'retryable' in value
  );
}

/** Chuẩn hóa mọi lỗi về AppError để UI luôn có thông điệp tiếng Việt tử tế */
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) return error;
  if (error instanceof DOMException && error.name === 'AbortError') return appError('TIMEOUT');
  if (error instanceof TypeError) return appError('NETWORK');
  if (error instanceof Error) return appError('UNKNOWN', { message: error.message });
  return appError('UNKNOWN');
}

function statusToCode(status: number): string {
  if (status === 401) return 'UNAUTHORIZED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status === 400 || status === 422) return 'VALIDATION';
  if (status >= 500) return 'SERVER';
  return 'UNKNOWN';
}

const BASE_URL: string = import.meta.env.VITE_API_URL || '/api/v1';

let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

/** AuthProvider đăng ký hàm đổi refreshToken lấy accessToken mới (null = phiên đã chết) */
let refresher: (() => Promise<string | null>) | null = null;
let refreshing: Promise<string | null> | null = null;

export function setTokenRefresher(fn: (() => Promise<string | null>) | null): void {
  refresher = fn;
}

/** Nhiều request 401 cùng lúc chỉ gọi /auth/refresh một lần */
function refreshOnce(): Promise<string | null> {
  refreshing ??= refresher!().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

/**
 * Fetch wrapper duy nhất chạm mạng. Các *.service.ts hiện dùng mock;
 * khi có BE thật chỉ cần gọi hàm này trong thân service, không sửa component.
 */
export async function http<T>(path: string, init: RequestInit = {}, canRetry = true): Promise<T> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(BASE_URL + path, {
      ...init,
      signal: controller.signal,
      headers: {
        // FormData (upload ảnh): để browser tự đặt multipart kèm boundary
        ...(init.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(authToken ? { Authorization: 'Bearer ' + authToken } : {}),
        ...init.headers,
      },
    });

    // 401 → thử refresh đúng một lần rồi gọi lại. Bỏ qua chính các endpoint /auth/* để không lặp vô hạn.
    if (response.status === 401 && canRetry && refresher && !path.startsWith('/auth/')) {
      window.clearTimeout(timer);
      if (await refreshOnce()) return http<T>(path, init, false);
    }

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
      throw appError(body?.error.code ?? statusToCode(response.status), {
        message: body?.error.message ?? MESSAGES[statusToCode(response.status)],
        status: response.status,
      });
    }

    if (response.status === 204) return undefined as T;
    // Endpoint trả file (vd /reports/summary.csv) → đọc text, không parse JSON
    if (response.headers.get('Content-Type')?.startsWith('text/')) {
      return (await response.text()) as T;
    }
    return (await response.json()) as T;
  } catch (error) {
    throw toAppError(error);
  } finally {
    window.clearTimeout(timer);
  }
}
