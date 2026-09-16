import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Trees, QrCode } from 'lucide-react';
import { PageContainer, PageHeader } from '@/components/layout/PageContainer';
import { Button, Pagination, Skeleton, Table } from '@/components/ui';
import type { Column } from '@/components/ui';
import { StateBoundary } from '@/components/shared/StateBoundary';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { HealthScore } from '@/components/shared/HealthScore';
import { DateText } from '@/components/shared/DateText';
import { PAGE_SIZE, ROUTES } from '@/constants/routes';
import { useDebounce } from '@/hooks/use-debounce';
import type { Tree } from '@/types';
import { useTreeFilters } from '../hooks/use-tree-filters';
import { useTrees } from '@/hooks/tree-queries';
import { TreeFilterBar } from '../components/TreeFilterBar';

const COLUMNS: Column<Tree>[] = [
  {
    key: 'code',
    header: 'Mã cây',
    primary: true,
    render: (tree) => (
      <span className="flex items-center gap-2">
        <span className="font-mono text-body font-bold text-text-primary">{tree.code}</span>
        <StatusBadge status={tree.status} />
      </span>
    ),
  },
  { key: 'variety', header: 'Giống', render: (tree) => tree.variety },
  {
    key: 'location',
    header: 'Lô / Hàng',
    render: (tree) => 'Lô ' + tree.location.block + ' — hàng ' + tree.location.row,
  },
  {
    key: 'health',
    header: 'Điểm sức khỏe',
    render: (tree) => <HealthScore score={tree.healthScore} />,
  },
  {
    key: 'updated',
    header: 'Cập nhật cuối',
    render: (tree) => <DateText value={tree.lastUpdated} variant="relative" />,
  },
];

export default function TreeListPage() {
  const navigate = useNavigate();
  const { filters, setFilters, clear, hasFilters } = useTreeFilters();
  const debouncedQuery = useDebounce(filters.q ?? '', 300);

  const query = useTrees({
    q: debouncedQuery || undefined,
    status: filters.status,
    block: filters.block,
  });

  const trees = useMemo(() => query.data ?? [], [query.data]);
  const blocks = useMemo(
    () => Array.from(new Set(trees.map((tree) => tree.location.block))).sort(),
    [trees],
  );

  const totalPages = Math.max(1, Math.ceil(trees.length / PAGE_SIZE));
  const page = Math.min(filters.page, totalPages);
  const paged = trees.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <PageContainer>
      <PageHeader
        title="Danh sách cây"
        description={'Toàn vườn có ' + trees.length + ' cây khớp bộ lọc hiện tại.'}
        breadcrumbs={[{ label: 'Tổng quan', to: ROUTES.dashboard }, { label: 'Danh sách cây' }]}
        action={
          <Button onClick={() => navigate(ROUTES.qr)} leftIcon={<QrCode className="size-5" />}>
            Quản lý QR
          </Button>
        }
      />

      <TreeFilterBar
        filters={filters}
        blocks={blocks.length > 0 ? blocks : ['A', 'B', 'C']}
        hasFilters={hasFilters}
        onChange={setFilters}
        onClear={clear}
      />

      <StateBoundary
        isLoading={query.isPending}
        error={query.error}
        isEmpty={trees.length === 0}
        onRetry={() => query.refetch()}
        skeleton={
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        }
        empty={
          hasFilters ? (
            <EmptyState
              icon={Trees}
              title="Không có cây nào khớp bộ lọc"
              description="Thử bỏ bớt điều kiện lọc hoặc kiểm tra lại mã cây đã nhập."
              action={
                <Button variant="secondary" onClick={clear}>
                  Xóa bộ lọc
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={Trees}
              title="Vườn chưa có cây nào"
              description="Tạo cây đầu tiên ở màn hình Quản lý QR — hệ thống sẽ tự sinh mã và thẻ QR."
              action={<Button onClick={() => navigate(ROUTES.qr)}>Tạo cây đầu tiên</Button>}
            />
          )
        }
      >
        <div className="flex flex-col gap-4">
          <Table
            caption="Danh sách cây trong vườn"
            columns={COLUMNS}
            data={paged}
            rowKey={(tree) => tree.code}
            onRowClick={(tree) => navigate(ROUTES.tree(tree.code))}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={trees.length}
            onPageChange={(next) => setFilters({ page: next })}
          />
        </div>
      </StateBoundary>
    </PageContainer>
  );
}
