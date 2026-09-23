import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Pencil, Plus, Search, Sprout, Trash2 } from 'lucide-react';
import { PageContainer, PageHeader } from '@/components/layout/PageContainer';
import { Badge, Button, Input, Select, Skeleton, Table, useToast } from '@/components/ui';
import type { Column, SortState } from '@/components/ui';
import { StateBoundary } from '@/components/shared/StateBoundary';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DateText } from '@/components/shared/DateText';
import { varietiesService } from '@/services/varieties.service';
import { varietyKeys } from '@/services/query-keys';
import { useDebounce } from '@/hooks/use-debounce';
import { useAuth } from '@/stores/auth-context';
import { VarietyFormModal } from '../components/VarietyFormModal';
import { useDeleteVariety } from '../hooks/use-varieties';
import { ROUTES } from '@/constants/routes';
import { formatNumber } from '@/utils/format';
import type { Variety, VarietyFilters } from '@/types';

const ACTIVE_OPTIONS = [
  { value: 'true', label: 'Đang dùng' },
  { value: 'false', label: 'Đã ngừng' },
  { value: 'all', label: 'Tất cả' },
];

export default function VarietyListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { can } = useAuth();
  const toast = useToast();
  const canEdit = can('farm:settings');
  const deleteMutation = useDeleteVariety();
  /** null = chưa mở; { variety: null } = thêm mới */
  const [editing, setEditing] = useState<{ variety: Variety | null } | null>(null);
  const [deleting, setDeleting] = useState<Variety | null>(null);
  const [sort, setSort] = useState<SortState>({ key: 'name', direction: 'asc' });

  const q = searchParams.get('q') ?? '';
  const active = (searchParams.get('active') ?? 'true') as NonNullable<VarietyFilters['active']>;
  const debouncedQuery = useDebounce(q, 300);

  const filters: VarietyFilters = {
    q: debouncedQuery || undefined,
    active,
  };
  const query = useQuery({
    queryKey: varietyKeys.list(filters),
    queryFn: () => varietiesService.list(filters),
  });

  const varieties = useMemo(() => query.data ?? [], [query.data]);
  const showPrice = varieties.some((item) => item.unitPrice !== undefined);

  const sortedVarieties = useMemo(() => {
    const factor = sort.direction === 'asc' ? 1 : -1;
    return [...varieties].sort((a, b) => {
      const key = sort.key as keyof Variety;
      const aValue = a[key];
      const bValue = b[key];
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return -1 * factor;
      if (bValue == null) return 1 * factor;
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * factor;
      }
      return String(aValue).localeCompare(String(bValue), 'vi') * factor;
    });
  }, [varieties, sort]);

  function setParam(key: string, value: string) {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );
  }

  const columns: Column<Variety>[] = [
    {
      key: 'name',
      header: 'Tên giống',
      primary: true,
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-semibold text-text-primary">{row.name}</p>
          {row.notes && <p className="text-caption text-text-secondary">{row.notes}</p>}
        </div>
      ),
    },
    ...(showPrice
      ? [
          {
            key: 'unitPrice',
            header: 'Giá giống',
            className: 'text-right tabular-nums',
            sortable: true,
            render: (row: Variety) => formatNumber(row.unitPrice, 'đ'),
          },
        ]
      : []),
    {
      key: 'active',
      header: 'Trạng thái',
      sortable: true,
      render: (row) => (
        <Badge variant={row.active ? 'success' : 'neutral'}>
          {row.active ? 'Đang dùng' : 'Đã ngừng'}
        </Badge>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Cập nhật',
      sortable: true,
      render: (row) => <DateText value={row.updatedAt} variant="date" />,
    },
    ...(canEdit
      ? [
          {
            key: 'actions',
            header: 'Thao tác',
            className: 'text-right',
            render: (row: Variety) => (
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  aria-label={'Sửa ' + row.name}
                  onClick={() => setEditing({ variety: row })}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  aria-label={'Xóa ' + row.name}
                  onClick={() => setDeleting(row)}
                >
                  <Trash2 className="size-4 text-error" />
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ];

  const hasFilters = Boolean(q || active !== 'true');

  return (
    <PageContainer>
      <PageHeader
        title="Cây giống"
        description="Giá và các giống cây đang được dùng trong vườn. Ngừng dùng chỉ ẩn khỏi danh sách chọn, lịch sử vẫn tra được."
        breadcrumbs={[
          { label: 'Tổng quan', to: ROUTES.dashboard },
          { label: 'Danh mục' },
          { label: 'Cây giống' },
        ]}
        action={
          canEdit ? (
            <Button leftIcon={<Plus className="size-5" />} onClick={() => setEditing({ variety: null })}>
              Thêm giống
            </Button>
          ) : undefined
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <Input
          label="Tìm giống cây"
          placeholder="Tên giống"
          leftIcon={<Search className="size-5" />}
          value={q}
          onChange={(event) => setParam('q', event.target.value)}
          containerClassName="flex-1"
        />
        <Select
          label="Trạng thái"
          options={ACTIVE_OPTIONS}
          value={active}
          onChange={(event) => setParam('active', event.target.value)}
          containerClassName="sm:w-40"
        />
      </div>

      <StateBoundary
        isLoading={query.isPending}
        error={query.error}
        isEmpty={varieties.length === 0}
        onRetry={() => query.refetch()}
        skeleton={
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full" />
            ))}
          </div>
        }
        empty={
          <EmptyState
            icon={Sprout}
            title={hasFilters ? 'Không có giống cây nào khớp' : 'Danh mục giống cây còn trống'}
            description={
              hasFilters
                ? 'Thử đổi từ khóa hoặc trạng thái.'
                : 'Quản lý vườn thêm giống cây để tra giá và theo dõi các giống đang trồng.'
            }
          />
        }
      >
        <Table
          caption="Danh mục giống cây của vườn"
          columns={columns}
          data={sortedVarieties}
          rowKey={(row) => row.id}
          sort={sort}
          onSortChange={setSort}
        />
      </StateBoundary>

      {editing && (
        <VarietyFormModal open variety={editing.variety} onClose={() => setEditing(null)} />
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Xóa giống cây?"
        description={
          'Xóa hẳn "' +
          (deleting?.name ?? '') +
          '" khỏi danh mục. Nếu chỉ muốn ẩn khỏi danh sách, hãy sửa và bỏ chọn "Đang dùng".'
        }
        confirmLabel="Xóa"
        danger
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          const name = deleting.name;
          setDeleting(null);
          try {
            await deleteMutation.mutateAsync(deleting.id);
            toast.success('Đã xóa ' + name);
          } catch {
            toast.error('Xóa giống cây thất bại. Thử lại giúp bạn.');
          }
        }}
      />
    </PageContainer>
  );
}
