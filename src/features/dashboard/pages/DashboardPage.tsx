import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { AlertOctagon, AlertTriangle, CheckCircle2, Map, QrCode, Trees } from 'lucide-react';
import { PageContainer, PageHeader } from '@/components/layout/PageContainer';
import { Button, Card, Pagination, Skeleton } from '@/components/ui';
import { StateBoundary } from '@/components/shared/StateBoundary';
import { EmptyState } from '@/components/shared/EmptyState';
import { TreeCard } from '@/features/trees/components/TreeCard';
import { useFarm, useTrees } from '@/hooks/tree-queries';
import { useIsDesktop } from '@/hooks/use-media-query';
import { useUi } from '@/stores/ui-context';
import { ROUTES } from '@/constants/routes';
import { StatCard } from '../components/StatCard';

const TREES_PER_PAGE = 16;

export default function DashboardPage() {
  const navigate = useNavigate();
  const { openScanner } = useUi();
  const treesQuery = useTrees();
  const isDesktop = useIsDesktop();
  const farmQuery = useFarm();

  const trees = useMemo(() => treesQuery.data ?? [], [treesQuery.data]);

  const stats = useMemo(
    () => ({
      total: trees.length,
      healthy: trees.filter((tree) => tree.status === 'healthy').length,
      monitoring: trees.filter((tree) => tree.status === 'monitoring').length,
      problem: trees.filter((tree) => tree.status === 'problem').length,
    }),
    [trees],
  );

  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(trees.length / TREES_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pagedTrees = trees.slice((currentPage - 1) * TREES_PER_PAGE, currentPage * TREES_PER_PAGE);
  const treeListRef = useRef<HTMLDivElement>(null);

  function handlePageChange(nextPage: number) {
    setPage(nextPage);
    treeListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <PageContainer>
      <PageHeader
        title="Tổng quan vườn"
        description={farmQuery.data?.name ?? 'Đang tải thông tin vườn…'}
        action={
          <Button onClick={openScanner} leftIcon={<QrCode className="size-5" />}>
            Quét QR
          </Button>
        }
      />

      <StateBoundary
        isLoading={treesQuery.isPending}
        error={treesQuery.error}
        onRetry={() => treesQuery.refetch()}
        skeleton={
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full" />
            ))}
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Tổng số cây"
            value={stats.total}
            icon={Trees}
            tone="primary"
            onClick={() => navigate(ROUTES.trees)}
          />
          <StatCard
            label="Cây khỏe mạnh"
            value={stats.healthy}
            icon={CheckCircle2}
            tone="success"
            onClick={() => navigate(ROUTES.trees + '?status=healthy')}
          />
          <StatCard
            label="Cần theo dõi"
            value={stats.monitoring}
            icon={AlertTriangle}
            tone="warning"
            onClick={() => navigate(ROUTES.trees + '?status=monitoring')}
          />
          <StatCard
            label="Có vấn đề"
            value={stats.problem}
            icon={AlertOctagon}
            tone="error"
            onClick={() => navigate(ROUTES.trees + '?status=problem')}
          />
        </div>

        <Card className="mt-6">
          <Card.Header>
            <Card.Title>Bản đồ vườn</Card.Title>
            <button
              type="button"
              className="text-caption text-primary hover:underline"
              onClick={() => navigate(ROUTES.map)}
            >
              Mở bản đồ toàn màn hình →
            </button>
          </Card.Header>
          {farmQuery.data ? (
            <iframe
              title="Bản đồ vườn trên Google Maps"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              // ponytail: embed keyless của Google Maps — đổi sang Maps Embed API + VITE_GOOGLE_MAPS_KEY nếu cần tắt logo/tùy biến marker
              src={
                'https://maps.google.com/maps?q=' +
                farmQuery.data.benchmark.lat +
                ',' +
                farmQuery.data.benchmark.lng +
                // Màn laptop rộng hơn -> zoom thêm 1 bậc (z chỉ nhận số nguyên)
                (isDesktop ? '&z=18' : '&z=17') +
                '&t=k&hl=vi&output=embed'
              }
              className="h-56 w-full rounded-md border border-border md:h-72 lg:h-96"
            />
          ) : (
            <Skeleton className="h-56 w-full md:h-72 lg:h-96" />
          )}
          <Button
            variant="secondary"
            fullWidth
            className="mt-3"
            onClick={() => navigate(ROUTES.map)}
            leftIcon={<Map className="size-5" />}
          >
            Xem bản đồ đầy đủ
          </Button>
        </Card>

        <div ref={treeListRef} className="mt-6 scroll-mt-4">
          <Card>
            <Card.Header>
              <Card.Title>Danh sách cây</Card.Title>
              <span className="text-caption text-text-muted">{trees.length} cây trong vườn</span>
            </Card.Header>

            {trees.length === 0 ? (
              <EmptyState
                icon={Trees}
                title="Chưa có cây nào"
                description="Vườn chưa có dữ liệu cây. Thêm cây để bắt đầu theo dõi."
              />
            ) : (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {pagedTrees.map((tree) => (
                    <TreeCard key={tree.code} tree={tree} />
                  ))}
                </div>
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  totalItems={trees.length}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </Card>
        </div>
      </StateBoundary>
    </PageContainer>
  );
}
