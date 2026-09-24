import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { ChevronDown, PanelLeftClose } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuth } from '@/stores/auth-context';
import { useUi } from '@/stores/ui-context';
import { ROUTES } from '@/constants/routes';
import { NAV_ITEMS } from './navigation';
import type { NavItem } from './navigation';

export interface SidebarProps {
  /** Trong Drawer mobile thì bỏ khung cố định và đóng drawer khi chọn mục */
  onNavigate?: () => void;
  embedded?: boolean;
  /** Sidebar desktop đang thu gọn: chỉ hiện icon, bấm icon thì mở rộng lại */
  collapsed?: boolean;
  onExpand?: () => void;
}

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring';

/**
 * Mục có sub-menu: bấm để đóng/mở, không điều hướng riêng.
 * ponytail: mục con so khớp cả query string vì NavLink chỉ xét pathname.
 */
function NavGroup({
  item,
  current,
  onNavigate,
  collapsed = false,
  onExpand,
}: {
  item: NavItem;
  current: string;
  onNavigate?: () => void;
  collapsed?: boolean;
  onExpand?: () => void;
}) {
  const [open, setOpen] = useState(() => current.startsWith(item.to));
  const childrenVisible = open && !collapsed;

  const rowClass = cn(
    'flex min-h-11 w-full items-center gap-3 rounded-md text-body-sm font-semibold whitespace-nowrap transition-colors',
    collapsed ? 'justify-center' : 'px-3',
  );
  const toneClass = (active: boolean) =>
    active
      ? 'bg-primary-subtle text-primary-hover'
      : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary';
  const collapsedLabel = <span className="sr-only">{item.label}</span>;

  if (!item.children) {
    return (
      <NavLink
        to={item.to}
        end={item.to === '/'}
        onClick={() => {
          if (collapsed) onExpand?.();
          onNavigate?.();
        }}
        title={collapsed ? item.label : undefined}
        className={({ isActive }) => cn(rowClass, toneClass(isActive))}
      >
        <item.icon aria-hidden className="size-5 shrink-0" />
        {collapsed ? collapsedLabel : item.label}
      </NavLink>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => {
          if (collapsed) {
            onExpand?.();
            setOpen(true);
          } else {
            setOpen((value) => !value);
          }
        }}
        aria-expanded={childrenVisible}
        title={collapsed ? item.label : undefined}
        className={cn(rowClass, toneClass(current.startsWith(item.to)))}
      >
        <item.icon aria-hidden className="size-5 shrink-0" />
        {collapsed ? (
          collapsedLabel
        ) : (
          <>
            <span className="flex-1 text-left">{item.label}</span>
            <ChevronDown
              aria-hidden
              className={cn('size-4 shrink-0 transition-transform duration-200', open && 'rotate-180')}
            />
          </>
        )}
      </button>

      {/* grid 0fr → 1fr: trượt mở/đóng mà không cần biết chiều cao */}
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none',
          childrenVisible ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-1 pt-1">
            {item.children.map((child) => (
              <NavLink
                key={child.to}
                to={child.to}
                onClick={onNavigate}
                tabIndex={childrenVisible ? undefined : -1}
                className={cn(
                  'ml-8 flex min-h-10 items-center rounded-md px-3 text-body-sm whitespace-nowrap transition-colors',
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

export function SidebarNav({ onNavigate, embedded = false, collapsed = false, onExpand }: SidebarProps) {
  const { can } = useAuth();
  const location = useLocation();
  const current = location.pathname + location.search;
  const items = NAV_ITEMS.filter((item) => !item.permission || can(item.permission));

  return (
    <nav
      aria-label="Điều hướng chính"
      className={cn('flex flex-col gap-1', !embedded && (collapsed ? 'p-3' : 'p-4'))}
    >
      {items.map((item) => (
        <NavGroup
          key={item.to}
          item={item}
          current={current}
          onNavigate={onNavigate}
          collapsed={collapsed}
          onExpand={onExpand}
        />
      ))}
    </nav>
  );
}

/** Sidebar desktop (lg+): chứa logo, thu gọn còn cột icon. Mobile dùng Drawer ở Header. */
export function Sidebar() {
  const { sidebarCollapsed: collapsed, toggleSidebar, expandSidebar } = useUi();

  return (
    <aside
      data-print-hide
      style={{ zIndex: 'var(--z-sticky)' }}
      className={cn(
        'fixed top-0 bottom-0 left-0 hidden flex-col border-r border-border bg-surface transition-[width] duration-200 ease-out motion-reduce:transition-none lg:flex',
        collapsed ? 'w-18' : 'w-64',
      )}
    >
      <div
        className={cn(
          'flex h-16 shrink-0 items-center border-b border-border',
          collapsed ? 'justify-center' : 'gap-2 px-4',
        )}
      >
        {collapsed ? (
          <button
            type="button"
            onClick={expandSidebar}
            aria-label="Mở rộng menu"
            title="Mở rộng menu"
            className={cn('rounded-lg', focusRing)}
          >
            <img src="/logo-icon.png" alt="" className="size-8 rounded-lg object-contain shadow-xs" />
          </button>
        ) : (
          <>
            <Link
              to={ROUTES.dashboard}
              className={cn('flex min-w-0 flex-1 items-center gap-2.5 rounded-md', focusRing)}
            >
              <img
                src="/logo-icon.png"
                alt="Durian QR Logo"
                className="size-8 shrink-0 rounded-lg object-contain shadow-xs"
              />
              <span className="truncate text-h4 font-extrabold tracking-tight text-text-primary">
                Durian QR
              </span>
            </Link>
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Thu gọn menu"
              title="Thu gọn menu"
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary',
                focusRing,
              )}
            >
              <PanelLeftClose aria-hidden className="size-5" />
            </button>
          </>
        )}
      </div>

      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <SidebarNav collapsed={collapsed} onExpand={expandSidebar} />
        {!collapsed && (
          <div className="mt-4 border-t border-border p-4">
            <p className="flex items-center gap-2 text-caption text-text-muted">
              <img src="/logo-icon.png" alt="Durian QR Logo" className="size-4.5 rounded-sm object-contain" />
              Durian QR — Quản lý vườn thông minh
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
