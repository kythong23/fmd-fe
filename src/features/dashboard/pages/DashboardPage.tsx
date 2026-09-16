import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { AlertOctagon, AlertTriangle, CheckCircle2, Map, QrCode, Trees } from 'lucide-react';
import { PageContainer, PageHeader } from '@/components/layout/PageContainer';
import { Button, Card, Skeleton } from '@/components/ui';
import { StateBoundary } from '@/components/shared/StateBoundary';
import { EmptyState } from '@/components/shared/EmptyState';
import { TreeCard } from '@/features/trees/components/TreeCard';
import { useFarm, useTrees } from '@/hooks/tree-queries';
import { useUi } from '@/stores/ui-context';
import { ROUTES, STALE_UPDATE_DAYS } from '@/constants/routes';
import { daysSince } from '@/utils/date';
import { StatCard } from '../components/StatCard';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { openScanner } = useUi();
  const treesQuery = useTrees();
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

  // Thông tin quan trọng nhất của page: cây có vấn đề hoặc lâu chưa cập nhật (05_FRONTEND §6.2)
  const attention = useMemo(
    () =>
      trees
        .filter((tree) => {
          const days = daysSince(tree.lastUpdated);
          return tree.status === 'problem' || days === null || days > STALE_UPDATE_DAYS;
        })
        .sort((a, b) => a.healthScore - b.healthScore)
        .slice(0, 6),
    [trees],
  );

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

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_23rem]">
          <Card>
            <Card.Header>
              <Card.Title>Cây cần chú ý</Card.Title>
              <span className="text-caption text-text-muted">
                Có vấn đề hoặc quá {STALE_UPDATE_DAYS} ngày chưa cập nhật
              </span>
            </Card.Header>

            {attention.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="Không có cây nào cần chú ý"
                description="Toàn bộ cây đều khỏe và được cập nhật gần đây. Tiếp tục duy trì lịch kiểm tra."
              />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                {attention.map((tree) => (
                  <TreeCard key={tree.code} tree={tree} />
                ))}
              </div>
            )}
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>Bản đồ vườn</Card.Title>
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
                  '&z=18&t=k&hl=vi&output=embed'
                }
                className="h-56 w-full rounded-md border border-border"
              />
            ) : (
              <Skeleton className="h-56 w-full" />
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
        </div>
      </StateBoundary>
    </PageContainer>
  );
}
