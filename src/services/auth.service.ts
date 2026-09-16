import { appError } from './http';
import { mockCall } from './mock/db';
import { FARM_ID } from './mock/farm.seed';
import type { LoginInput, Session, User } from '@/types';

/** Tài khoản demo — thay bằng POST /auth/login khi có BE (04_API §1) */
const ACCOUNTS: Array<{ password: string; user: User }> = [
  {
    password: 'quanly123',
    user: {
      id: 'user-001',
      farmId: FARM_ID,
      fullName: 'Nguyễn Văn An',
      username: 'quanly',
      role: 'manager',
      assignedBlock: null,
    },
  },
  {
    password: 'nhancong123',
    user: {
      id: 'user-002',
      farmId: FARM_ID,
      fullName: 'Trần Thị Bích',
      username: 'nhancong',
      role: 'worker',
      assignedBlock: 'A',
    },
  },
  {
    password: 'khachxem123',
    user: {
      id: 'user-003',
      farmId: FARM_ID,
      fullName: 'Phạm Quốc Dũng',
      username: 'khachxem',
      role: 'viewer',
      assignedBlock: null,
    },
  },
];

const STORAGE_KEY = 'durian_session';

export const authService = {
  login: (input: LoginInput): Promise<Session> =>
    mockCall(() => {
      const account = ACCOUNTS.find(
        (item) =>
          item.user.username === input.username.trim().toLowerCase() &&
          item.password === input.password,
      );
      if (!account) {
        throw appError('UNAUTHORIZED', {
          message: 'Tài khoản hoặc mật khẩu không đúng. Kiểm tra lại giúp bạn.',
          retryable: false,
        });
      }
      return { user: account.user, token: 'mock-token-' + account.user.id };
    }, 0),

  logout: (): Promise<void> => mockCall(() => undefined, 0),

  /** Khôi phục phiên khi F5 — mock thay cho GET /auth/me */
  restore(): Session | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Session) : null;
    } catch {
      return null;
    }
  },

  persist(session: Session | null): void {
    try {
      if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Trình duyệt chặn storage (chế độ riêng tư) — phiên chỉ sống trong tab, không phải lỗi chặn luồng
    }
  },
};
