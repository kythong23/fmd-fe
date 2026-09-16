import { createContext, use, useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { authService } from '@/services/auth.service';
import { setAuthToken } from '@/services/http';
import { ROLE_PERMISSIONS } from '@/constants/roles';
import type { Permission } from '@/constants/roles';
import type { LoginInput, Session, User } from '@/types';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  can: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Global state DUY NHẤT của app. Dữ liệu server nằm ở TanStack Query (05_FRONTEND §7) */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => {
    const restored = authService.restore();
    setAuthToken(restored?.token ?? null);
    return restored;
  });

  const login = useCallback(async (input: LoginInput) => {
    const next = await authService.login(input);
    authService.persist(next);
    setAuthToken(next.token);
    setSession(next);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    authService.persist(null);
    setAuthToken(null);
    setSession(null);
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
