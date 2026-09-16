import { useNavigate } from 'react-router';
import { Compass, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageContainer } from '@/components/layout/PageContainer';
import { ROUTES } from '@/constants/routes';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <EmptyState
        icon={Compass}
        title="Không tìm thấy trang này"
        description="Đường dẫn có thể đã đổi hoặc bạn gõ nhầm. Quay về trang tổng quan để tiếp tục."
        action={
          <Button
            onClick={() => navigate(ROUTES.dashboard)}
            leftIcon={<LayoutDashboard className="size-5" />}
          >
            Về trang tổng quan
          </Button>
        }
      />
    </PageContainer>
  );
}
