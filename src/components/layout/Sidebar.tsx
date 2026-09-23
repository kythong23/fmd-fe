import { useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuth } from '@/stores/auth-context';
import { NAV_ITEMS } from './navigation';
import type { NavItem } from './navigation';

export interface SidebarProps {
  /** Trong Drawer mobile thì bỏ khung cố định và đóng drawer khi chọn mục */
  onNavigate?: () => void;
  embedded?: boolean;
}

/**
 * Mục có sub-menu: bấm để đóng/mở, không điều hướng riêng.
 * ponytail: mục con so khớp cả query string vì NavLink chỉ xét pathname.
 */
function isGroupActive(item: NavItem, current: string): boolean {
  if (current.startsWith(item.to)) return true;
  return Boolean(item.children?.some((child) => current.startsWith(child.to.split('?')[0])));
}

function NavGroup({ item, current, onNavigate }: { item: NavItem; current: string; onNavigate?: () => void }) {
  const [open, setOpen] = useState(() => isGroupActive(item, current));

  const rowClass =
    'flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-body-sm font-semibold transition-colors';
  const toneClass = (active: boolean) =>
    active
      ? 'bg-primary-subtle text-primary-hover'
      : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary';

  if (!item.children) {
    return (
      <NavLink
        to={item.to}
        end={item.to === '/'}
        onClick={onNavigate}
        className={({ isActive }) => cn(rowClass, toneClass(isActive))}
      >
        <item.icon aria-hidden className="size-5 shrink-0" />
        {item.label}
      </NavLink>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={cn(rowClass, toneClass(isGroupActive(item, current)))}
      >
        <item.icon aria-hidden className="size-5 shrink-0" />
        <span className="flex-1 text-left">{item.label}</span>
        <ChevronDown
          aria-hidden
          className={cn('size-4 shrink-0 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      {/* grid 0fr → 1fr: trượt mở/đóng mà không cần biết chiều cao */}
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-1 pt-1">
            {item.children.map((child) => (
              <NavLink
                key={child.to}
                to={child.to}
                onClick={onNavigate}
                tabIndex={open ? undefined : -1}
                className={cn(
                  'ml-8 flex min-h-10 items-center rounded-md px-3 text-body-sm transition-colors',
                  current === child.to
                    ? 'bg-primary-subtle font-semibold text-primary-hover'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary',
                )}
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SidebarNav({ onNavigate, embedded = false }: SidebarProps) {
  const { can } = useAuth();
  const location = useLocation();
  const current = location.pathname + location.search;
  const items = NAV_ITEMS.filter((item) => !item.permission || can(item.permission));

  return (
    <nav aria-label="Điều hướng chính" className={cn('flex flex-col gap-1', !embedded && 'p-4')}>
      {items.map((item) => (
        <NavGroup key={item.to} item={item} current={current} onNavigate={onNavigate} />
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
          <img src="/logo-icon.png" alt="Durian QR Logo" className="size-4.5 rounded-sm object-contain" />
          Durian QR — Quản lý vườn thông minh
        </p>
      </div>
    </aside>
  );
}
