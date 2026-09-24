import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ClipboardPen, History, Info, PencilLine, QrCode } from 'lucide-react';
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
import { TreeProfileModal } from '../components/TreeProfileModal';

/** Màn hình lõi — đích của mọi mã QR (05_FRONTEND §6.4) */
export default function TreePassportPage() {
  const { code = '' } = useParams();
  const navigate = useNavigate();
  const { can } = useAuth();
  const { openUpdate, openScanner } = useUi();
  const query = useTree(code);
  const [profileOpen, setProfileOpen] = useState(false);

  if (query.isError && toAppError(query.error).code === 'NOT_FOUND') {
    return <TreeNotFound code={code} onRescan={openScanner} />;
  }

  const tree = query.data;
  const canWrite = can('tree:update');
  // Cây ảo (đã in QR, chưa ai nhập thông tin) phải nhập hồ sơ trước — chưa được ghi tình trạng
  const activated = tree?.activated ?? false;

  const primaryAction = !tree || !canWrite ? null : activated ? (
    <Button onClick={() => openUpdate(code)} leftIcon={<PencilLine className="size-5" />}>
      Cập nhật tình trạng
    </Button>
  ) : (
    <Button onClick={() => setProfileOpen(true)} leftIcon={<ClipboardPen className="size-5" />}>
      Nhập thông tin cây
    </Button>
  );

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
        action={primaryAction}
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
        {tree && (
          <div className="flex flex-col gap-4">
            {!activated && (
              <div
                role="status"
                className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning-subtle p-4 text-body-sm text-text-primary"
              >
                <Info aria-hidden className="mt-0.5 size-5 shrink-0 text-warning" />
                <p>
                  <span className="font-semibold">Cây chưa được kích hoạt.</span>{' '}
                  {canWrite
                    ? 'Nhập thông tin cây (giống, ngày trồng, vị trí) để kích hoạt, sau đó mới ghi được cập nhật tình trạng.'
                    : 'Cây chưa có thông tin nên chưa thể ghi cập nhật tình trạng.'}
                </p>
              </div>
            )}

            <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
              <div className="flex flex-col gap-3">
                <TreeGallery code={tree.code} image={tree.image} gallery={tree.gallery} />
                <div className="flex flex-col gap-2">
                  {canWrite && activated && (
                    <Button
                      variant="secondary"
                      fullWidth
                      onClick={() => setProfileOpen(true)}
                      leftIcon={<ClipboardPen className="size-5" />}
                    >
                      Sửa hồ sơ cây
                    </Button>
                  )}
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

              <TreePassportCard tree={tree} />
            </div>
          </div>
        )}
      </StateBoundary>

      {/* Primary action dính đáy màn hình trên mobile — một tay, ngoài nắng (05_FRONTEND §9) */}
      {primaryAction && (
        <div
          data-print-hide
          style={{ zIndex: 'var(--z-sticky)' }}
          className="fixed inset-x-0 bottom-14 border-t border-border bg-surface p-3 sm:hidden"
        >
          {activated ? (
            <Button
              fullWidth
              size="lg"
              onClick={() => openUpdate(code)}
              leftIcon={<PencilLine className="size-5" />}
            >
              Cập nhật tình trạng
            </Button>
          ) : (
            <Button
              fullWidth
              size="lg"
              onClick={() => setProfileOpen(true)}
              leftIcon={<ClipboardPen className="size-5" />}
            >
              Nhập thông tin cây
            </Button>
          )}
        </div>
      )}

      {profileOpen && tree && (
        <TreeProfileModal tree={tree} onClose={() => setProfileOpen(false)} />
      )}
    </PageContainer>
  );
}
