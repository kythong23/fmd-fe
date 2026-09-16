import { NavLink } from 'react-router';
import { cn } from '@/utils/cn';
import { useAuth } from '@/stores/auth-context';
import { NAV_ITEMS } from './navigation';

/** 5 mục, chỉ hiện dưới md — điều hướng chính trên điện thoại (05_FRONTEND §9) */
export function MobileBottomNav() {
  const { can } = useAuth();
  const items = NAV_ITEMS.filter(
    (item) => item.mobile && (!item.permission || can(item.permission)),
  ).slice(0, 5);

  return (
    <nav
      data-app-nav
      data-print-hide
      aria-label="Điều hướng nhanh"
      style={{ zIndex: 'var(--z-sticky)' }}
      className="fixed inset-x-0 bottom-0 grid grid-flow-col border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            cn(
              'flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-caption font-semibold transition-colors',
              isActive ? 'text-primary' : 'text-text-muted hover:text-text-secondary',
            )
          }
        >
          <item.icon aria-hidden className="size-5" />
          <span className="truncate">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
