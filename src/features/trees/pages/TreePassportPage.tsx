import { useNavigate, useParams } from 'react-router';
import { History, PencilLine, QrCode } from 'lucide-react';
import { PageContainer, PageHeader } from '@/components/layout/PageContainer';
import { Button, Skeleton } from '@/components/ui';
import { StateBoundary } from '@/components/shared/StateBoundary';
import { useTree } from '@/hooks/tree-queries';
import { useAuth } from '@/stores/auth-context';
import { useUi } from '@/stores/ui-context';
import { toAppError } from '@/services/http';
import { ROUTES } from '@/constants/routes';
import { TreePassportCard } from '../components/TreePassportCard';
import { TreeGallery } from '../components/TreeGallery';
import { TreeNotFound } from '../components/TreeNotFound';

/** Màn hình lõi — đích của mọi mã QR (05_FRONTEND §6.4) */
export default function TreePassportPage() {
  const { code = '' } = useParams();
  const navigate = useNavigate();
  const { can } = useAuth();
  const { openUpdate, openScanner } = useUi();
  const query = useTree(code);

  if (query.isError && toAppError(query.error).code === 'NOT_FOUND') {
    return <TreeNotFound code={code} onRescan={openScanner} />;
  }

  const canUpdate = can('tree:update');
  const updateButton = canUpdate ? (
    <Button onClick={() => openUpdate(code)} leftIcon={<PencilLine className="size-5" />}>
      Cập nhật tình trạng
    </Button>
  ) : null;

  return (
    <PageContainer className="pb-24 sm:pb-6">
      <PageHeader
        title={'Hồ sơ cây ' + code}
        description="Thông tin hiện tại của cây, quét từ mã QR gắn tại gốc."
        breadcrumbs={[
          { label: 'Tổng quan', to: ROUTES.dashboard },
          { label: 'Danh sách cây', to: ROUTES.trees },
          { label: code },
        ]}
        action={updateButton}
      />

      <StateBoundary
        isLoading={query.isPending}
        error={query.error}
        onRetry={() => query.refetch()}
        skeleton={
          <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
            <Skeleton className="aspect-[4/3] w-full" />
            <div className="flex flex-col gap-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        }
      >
        {query.data && (
          <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
            <div className="flex flex-col gap-3">
              <TreeGallery
                code={query.data.code}
                image={query.data.image}
                gallery={query.data.gallery}
              />
              <div className="flex flex-col gap-2">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => navigate(ROUTES.treeHistory(code))}
                  leftIcon={<History className="size-5" />}
                >
                  Xem lịch sử
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => navigate(ROUTES.qr + '?q=' + code)}
                  leftIcon={<QrCode className="size-5" />}
                >
                  Xem mã QR
                </Button>
              </div>
            </div>

            <TreePassportCard tree={query.data} />
          </div>
        )}
      </StateBoundary>

      {/* Primary action dính đáy màn hình trên mobile — một tay, ngoài nắng (05_FRONTEND §9) */}
      {canUpdate && (
        <div
          data-print-hide
          style={{ zIndex: 'var(--z-sticky)' }}
          className="fixed inset-x-0 bottom-14 border-t border-border bg-surface p-3 sm:hidden"
        >
          <Button
            fullWidth
            size="lg"
            onClick={() => openUpdate(code)}
            leftIcon={<PencilLine className="size-5" />}
          >
            Cập nhật tình trạng
          </Button>
        </div>
      )}
    </PageContainer>
  );
}
