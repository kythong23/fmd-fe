import { useNavigate } from 'react-router';
import { Link } from 'react-router';
import { Menu, LogOut, QrCode, Sprout } from 'lucide-react';
import { Avatar, Button, Drawer, Dropdown } from '@/components/ui';
import { useDisclosure } from '@/hooks/use-disclosure';
import { useAuth } from '@/stores/auth-context';
import { useUi } from '@/stores/ui-context';
import { ROLE_LABEL } from '@/constants/roles';
import { ROUTES } from '@/constants/routes';
import { SidebarNav } from './Sidebar';

export function Header() {
  const { user, logout } = useAuth();
  const { openScanner } = useUi();
  const navigate = useNavigate();
  const drawer = useDisclosure();

  async function handleLogout() {
    await logout();
    navigate(ROUTES.login, { replace: true });
  }

  return (
    <>
      <header
        data-app-header
        data-print-hide
        style={{ zIndex: 'var(--z-sticky)' }}
        className="sticky top-0 flex h-16 items-center gap-3 border-b border-border bg-surface px-4 sm:px-6"
      >
        <Button
          variant="ghost"
          size="md"
          iconOnly
          aria-label="Mở điều hướng"
          className="lg:hidden"
          onClick={drawer.open}
        >
          <Menu aria-hidden className="size-5" />
        </Button>

        <Link
          to={ROUTES.dashboard}
          className="flex items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        >
          <Sprout aria-hidden className="size-6 text-primary" />
          <span className="text-h4 font-extrabold text-text-primary">Durian QR</span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="secondary"
            size="md"
            onClick={openScanner}
            leftIcon={<QrCode className="size-5" />}
          >
            <span className="hidden sm:inline">Quét QR</span>
          </Button>

          {user && (
            <Dropdown
              label="Tài khoản"
              trigger={
                <>
                  <Avatar name={user.fullName} size="sm" />
                  <span className="hidden text-left sm:block">
                    <span className="block text-body-sm font-semibold text-text-primary">
                      {user.fullName}
                    </span>
                    <span className="block text-caption text-text-muted">
                      {ROLE_LABEL[user.role]}
                    </span>
                  </span>
                </>
              }
              items={[
                {
                  key: 'logout',
                  label: 'Đăng xuất',
                  icon: <LogOut className="size-4" />,
                  onSelect: handleLogout,
                },
              ]}
            />
          )}
        </div>
      </header>

      <Drawer open={drawer.isOpen} onClose={drawer.close} title="Điều hướng">
        <SidebarNav embedded onNavigate={drawer.close} />
      </Drawer>
    </>
  );
}
