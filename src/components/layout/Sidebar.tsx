import { NavLink } from 'react-router';
import { Sprout } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuth } from '@/stores/auth-context';
import { NAV_ITEMS } from './navigation';

export interface SidebarProps {
  /** Trong Drawer mobile thì bỏ khung cố định và đóng drawer khi chọn mục */
  onNavigate?: () => void;
  embedded?: boolean;
}

export function SidebarNav({ onNavigate, embedded = false }: SidebarProps) {
  const { can } = useAuth();
  const items = NAV_ITEMS.filter((item) => !item.permission || can(item.permission));

  return (
    <nav aria-label="Điều hướng chính" className={cn('flex flex-col gap-1', !embedded && 'p-4')}>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex min-h-11 items-center gap-3 rounded-md px-3 text-body-sm font-semibold transition-colors',
              isActive
                ? 'bg-primary-subtle text-primary-hover'
                : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary',
            )
          }
        >
          <item.icon aria-hidden className="size-5 shrink-0" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export function Sidebar() {
  return (
    <aside
      data-print-hide
      className="fixed top-16 bottom-0 left-0 hidden w-64 overflow-y-auto border-r border-border bg-surface lg:block"
    >
      <SidebarNav />
      <div className="mt-4 border-t border-border p-4">
        <p className="flex items-center gap-2 text-caption text-text-muted">
          <Sprout aria-hidden className="size-4" />
          Durian QR — MVP
        </p>
      </div>
    </aside>
  );
}
