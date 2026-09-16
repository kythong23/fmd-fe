import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { AlertOctagon, AlertTriangle, CheckCircle2, Map, QrCode, Trees } from 'lucide-react';
import { PageContainer, PageHeader } from '@/components/layout/PageContainer';
import { Button, Card, Skeleton } from '@/components/ui';
import { StateBoundary } from '@/components/shared/StateBoundary';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { HealthScore } from '@/components/shared/HealthScore';
import { DateText } from '@/components/shared/DateText';
import { FarmMapSvg } from '@/components/shared/FarmMapSvg';
import { useFarm, useTrees } from '@/hooks/tree-queries';
import { useUi } from '@/stores/ui-context';
import { ROUTES, STALE_UPDATE_DAYS } from '@/constants/routes';
import { daysSince } from '@/utils/date';
import { StatCard } from '../components/StatCard';

const ALL_LAYERS = {
  boundary: true,
  beds: true,
  canals: false,
  roads: false,
  reservoir: false,
  facilities: false,
  trees: true,
} as const;

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
              <ul className="flex flex-col gap-2">
                {attention.map((tree) => (
                  <li key={tree.code}>
                    <button
                      type="button"
                      onClick={() => navigate(ROUTES.tree(tree.code))}
                      className="flex w-full min-h-11 flex-wrap items-center justify-between gap-2 rounded-md border border-border p-3 text-left transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                    >
                      <span className="flex items-center gap-2">
                        <span className="font-mono font-bold text-text-primary">{tree.code}</span>
                        <StatusBadge status={tree.status} />
                      </span>
                      <span className="flex items-center gap-3 text-caption text-text-muted">
                        <HealthScore score={tree.healthScore} />
                        <DateText value={tree.lastUpdated} variant="relative" />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>Bản đồ vườn</Card.Title>
            </Card.Header>
            {farmQuery.data ? (
              <button
                type="button"
                onClick={() => navigate(ROUTES.map)}
                aria-label="Mở bản đồ vườn đầy đủ"
                className="w-full rounded-md border border-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
              >
                <FarmMapSvg
                  layers={farmQuery.data.mapLayers}
                  trees={trees}
                  visible={ALL_LAYERS}
                  markerSize={7}
                  className="h-56 w-full"
                />
              </button>
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
