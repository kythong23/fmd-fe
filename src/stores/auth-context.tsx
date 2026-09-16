import { createContext, use, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { authService } from '@/services/auth.service';
import { setAuthToken, setTokenRefresher } from '@/services/http';
import { ROLE_PERMISSIONS } from '@/constants/roles';
import type { Permission } from '@/constants/roles';
import type { LoginInput, Session, User } from '@/types';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<string>;
  can: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Global state DUY NHẤT của app. Dữ liệu server nằm ở TanStack Query (05_FRONTEND §7) */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => {
    const restored = authService.restore();
    setAuthToken(restored?.accessToken ?? null);
    return restored;
  });

  // http() chạy ngoài React nên cần ref để luôn thấy refreshToken mới nhất
  const sessionRef = useRef(session);
  sessionRef.current = session;

  useEffect(() => {
    setTokenRefresher(async () => {
      const current = sessionRef.current;
      if (!current) return null;
      try {
        const next = await authService.refresh(current);
        authService.persist(next);
        setAuthToken(next.accessToken);
        setSession(next);
        return next.accessToken;
      } catch {
        // Refresh hỏng = phiên chết → xoá sạch, RequireAuth tự đá về /login
        authService.persist(null);
        setAuthToken(null);
        setSession(null);
        return null;
      }
    });
    return () => setTokenRefresher(null);
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const next = await authService.login(input);
    authService.persist(next);
    setAuthToken(next.accessToken);
    setSession(next);
  }, []);

  const logout = useCallback(async () => {
    // Phiên phía client luôn bị xoá, kể cả khi BE lỗi hay mất sóng — nhưng lỗi vẫn ném lên để UI báo
    try {
      return await authService.logout();
    } finally {
      authService.persist(null);
      setAuthToken(null);
      setSession(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const role = session?.user.role;
    return {
      user: session?.user ?? null,
      isAuthenticated: Boolean(session),
      login,
      logout,
      // Permission UI chỉ là UX; backend mới là nơi enforce quyền (08_AI_RULES §9)
      can: (permission) => (role ? ROLE_PERMISSIONS[role].includes(permission) : false),
    };
  }, [session, login, logout]);

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const value = use(AuthContext);
  if (!value) throw new Error('useAuth phải nằm trong AuthProvider');
  return value;
}

/** Một nơi duy nhất quyết định quyền — không viết user.role === 'manager' rải rác */
export function useCan(permission: Permission): boolean {
  return useAuth().can(permission);
}

// ponytail: file export cả provider lẫn hook nên hot-update tạo context mới → useAuth thấy null.
// Ép full reload thay vì tách file chỉ để chiều HMR.
if (import.meta.hot) import.meta.hot.invalidate();
