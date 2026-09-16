import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/stores/auth-context';
import { ROUTES } from '@/constants/routes';
import type { Permission } from '@/constants/roles';

export interface RequireAuthProps {
  /** Thiếu quyền → trang 403 có giải thích, không im lặng (05_FRONTEND §5.2) */
  permission?: Permission;
}

export function RequireAuth({ permission }: RequireAuthProps) {
  const { isAuthenticated, can } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const next = location.pathname + location.search;
    return <Navigate to={ROUTES.login + '?redirect=' + encodeURIComponent(next)} replace />;
  }

  if (permission && !can(permission)) {
    return <Navigate to={ROUTES.forbidden} replace />;
  }

  return <Outlet />;
}
