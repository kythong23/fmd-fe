import { useNavigate } from 'react-router';
import { ShieldAlert, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui';
import { PageContainer } from '@/components/layout/PageContainer';
import { useAuth } from '@/stores/auth-context';
import { ROLE_LABEL } from '@/constants/roles';
import { ROUTES } from '@/constants/routes';

export default function ForbiddenPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <PageContainer>
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 py-16 text-center">
        <ShieldAlert aria-hidden className="size-6 text-warning" />
        <h1 className="text-h2 text-text-primary">Bạn không có quyền vào trang này</h1>
        <p className="text-body-sm text-text-secondary">
          Tài khoản của bạn đang ở vai trò{' '}
          <strong>{user ? ROLE_LABEL[user.role] : 'không xác định'}</strong>. Trang này chỉ dành cho
          quản lý vườn. Liên hệ quản lý nếu bạn cần được cấp quyền.
        </p>
        <Button onClick={() => navigate(ROUTES.dashboard)} leftIcon={<LayoutDashboard className="size-5" />}>
          Về trang tổng quan
        </Button>
      </div>
    </PageContainer>
  );
}
