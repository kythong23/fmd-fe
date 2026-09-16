import { useNavigate } from 'react-router';
import { QrCode, SearchX, Trees } from 'lucide-react';
import { Button } from '@/components/ui';
import { EmptyState } from '@/components/shared/EmptyState';
import { PageContainer } from '@/components/layout/PageContainer';
import { ROUTES } from '@/constants/routes';

/** 404 riêng cho cây: nói rõ mã nào không tìm thấy (05_FRONTEND §6.4) */
export function TreeNotFound({ code, onRescan }: { code: string; onRescan: () => void }) {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <EmptyState
        icon={SearchX}
        title={'Không tìm thấy cây mã ' + code}
        description="Mã trên thẻ QR có thể bị mờ hoặc cây đã bị xóa khỏi hệ thống. Thử quét lại hoặc tìm trong danh sách cây."
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={onRescan} leftIcon={<QrCode className="size-5" />}>
              Quét lại mã QR
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate(ROUTES.trees)}
              leftIcon={<Trees className="size-5" />}
            >
              Về danh sách cây
            </Button>
          </div>
        }
      />
    </PageContainer>
  );
}
