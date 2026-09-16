import { appError } from '@/services/http';

/** Trễ giả lập mạng vườn: 300–800ms (05_FRONTEND §13) */
export function delay(min = 300, max = 800): Promise<void> {
  const ms = min + Math.random() * (max - min);
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

const MOCK_ERRORS = import.meta.env.VITE_MOCK_ERRORS === '1';

/** Bật VITE_MOCK_ERRORS=1 để ném lỗi ngẫu nhiên và test được error state thật */
export function maybeFail(rate = 0.25): void {
  if (MOCK_ERRORS && Math.random() < rate) throw appError('SERVER');
}

export async function mockCall<T>(produce: () => T, failRate?: number): Promise<T> {
  await delay();
  maybeFail(failRate);
  return produce();
}

/** Bản sao sâu — mock không được trả tham chiếu để component sửa nhầm dữ liệu gốc */
export function clone<T>(value: T): T {
  return structuredClone(value);
}
