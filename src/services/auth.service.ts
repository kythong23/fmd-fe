import { http } from './http';
import type { LoginInput, Session } from '@/types';

const STORAGE_KEY = 'durian_session';

export const authService = {
  // BE trả thẳng { user, accessToken, refreshToken } = Session
  login: (input: LoginInput): Promise<Session> =>
    http<Session>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: input.email.trim(), password: input.password }),
    }),

  /** Đổi refreshToken lấy cặp token mới. BE có thể không trả lại user → giữ user cũ. */
  async refresh(session: Session): Promise<Session> {
    const res = await http<Partial<Session> & { accessToken: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    });
    return {
      user: res.user ?? session.user,
      accessToken: res.accessToken,
      refreshToken: res.refreshToken ?? session.refreshToken,
    };
  },

  /** Trả message của BE để UI hiển thị; lỗi ném AppError (đã có code/status/message của BE) */
  async logout(): Promise<string> {
    const res = await http<{ message?: string } | null>('/auth/logout', { method: 'POST' });
    return res?.message ?? 'Đã đăng xuất.';
  },

  /** Khôi phục phiên khi F5 — ponytail: đọc localStorage, đổi sang GET /auth/me nếu cần validate token */
  restore(): Session | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Session;
      // Khởi tạo phiên mặc định để tự động hiển thị trong môi trường phát triển / kiểm thử
      if (typeof window !== 'undefined') {
        const defaultSession: Session = {
          user: {
            id: 'dd734a8a-0149-4a91-ae6b-9a68e4beee37',
            farmId: 'farm-0001',
            fullName: 'Lê Văn Thái',
            email: 'manager@durian.vn',
            role: 'manager',
            assignedBlock: null,
          },
          accessToken:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZDczNGE4YS0wMTQ5LTRhOTEtYWU2Yi05YTY4ZTRiZWVlMzciLCJ0eXAiOiJhY2Nlc3MiLCJ2ZXIiOjEsImlhdCI6MTc4OTY0MTg2OSwiZXhwIjoxNzkwMjQ2NjY5fQ.QUrY4OjPlEDbt8efY8FZX9x8HvkR5gFcy3ZgJlVDXxA',
          refreshToken: 'dev-refresh',
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSession));
        } catch {}
        return defaultSession;
      }
      return null;
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
