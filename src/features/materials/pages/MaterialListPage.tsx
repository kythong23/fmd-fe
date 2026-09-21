import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Package, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { PageContainer, PageHeader } from '@/components/layout/PageContainer';
import { Badge, Button, Input, Select, Skeleton, Table, useToast } from '@/components/ui';
import type { Column } from '@/components/ui';
import { StateBoundary } from '@/components/shared/StateBoundary';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DateText } from '@/components/shared/DateText';
import { materialsService } from '@/services/materials.service';
import { materialKeys } from '@/services/query-keys';
import { useDebounce } from '@/hooks/use-debounce';
import { useAuth } from '@/stores/auth-context';
import { MaterialFormModal } from '../components/MaterialFormModal';
import { useDeleteMaterial } from '../hooks/use-materials';
import { MATERIAL_TYPE_CONFIG, MATERIAL_TYPES } from '@/constants/material-types';
import { ROUTES } from '@/constants/routes';
import { formatNumber, formatText } from '@/utils/format';
import type { Material, MaterialFilters, MaterialType } from '@/types';

const TYPE_OPTIONS = MATERIAL_TYPES.map((type) => ({
  value: type,
  label: MATERIAL_TYPE_CONFIG[type].label,
}));

const ACTIVE_OPTIONS = [
  { value: 'true', label: 'Đang dùng' },
  { value: 'false', label: 'Đã ngừng' },
  { value: 'all', label: 'Tất cả' },
];

export default function MaterialListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { can } = useAuth();
  const toast = useToast();
  const canEdit = can('farm:settings');
  const deleteMutation = useDeleteMaterial();
  /** null = chưa mở; { material: null } = thêm mới */
  const [editing, setEditing] = useState<{ material: Material | null } | null>(null);
  const [deleting, setDeleting] = useState<Material | null>(null);

  const q = searchParams.get('q') ?? '';
  const type = (searchParams.get('type') ?? '') as MaterialType | '';
  const active = (searchParams.get('active') ?? 'true') as NonNullable<MaterialFilters['active']>;
  const debouncedQuery = useDebounce(q, 300);

  const filters: MaterialFilters = {
    q: debouncedQuery || undefined,
    type: type || undefined,
    active,
  };
  const query = useQuery({
    queryKey: materialKeys.list(filters),
    queryFn: () => materialsService.list(filters),
  });

  const materials = useMemo(() => query.data ?? [], [query.data]);
  // BE cắt hẳn unitPrice với worker/viewer (D9) → không có giá thì bỏ luôn cột
  const showPrice = materials.some((item) => item.unitPrice !== undefined);

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

  const columns: Column<Material>[] = [
    {
      key: 'code',
      header: 'Mã',
      primary: true,
      render: (row) => (
        <span className="font-mono font-bold text-text-primary">{row.code}</span>
      ),
    },
    {
      key: 'name',
      header: 'Tên vật tư',
      render: (row) => (
        <div>
          <p className="font-semibold text-text-primary">{row.name}</p>
          {row.notes && <p className="text-caption text-text-secondary">{row.notes}</p>}
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Nhóm',
      render: (row) => (
        <Badge variant={MATERIAL_TYPE_CONFIG[row.type].variant}>
          {MATERIAL_TYPE_CONFIG[row.type].label}
        </Badge>
      ),
    },
    { key: 'unit', header: 'Đơn vị', render: (row) => formatText(row.unit) },
    ...(showPrice
      ? [
          {
            key: 'unitPrice',
            header: 'Đơn giá',
            className: 'text-right tabular-nums',
            render: (row: Material) => formatNumber(row.unitPrice, 'đ'),
          },
        ]
      : []),
    {
      key: 'active',
      header: 'Trạng thái',
      render: (row) => (
        <Badge variant={row.active ? 'success' : 'neutral'}>
          {row.active ? 'Đang dùng' : 'Đã ngừng'}
        </Badge>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Cập nhật',
      render: (row) => <DateText value={row.updatedAt} variant="date" />,
    },
    ...(canEdit
      ? [
          {
            key: 'actions',
            header: 'Thao tác',
            className: 'text-right',
            render: (row: Material) => (
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  aria-label={'Sửa ' + row.name}
                  onClick={() => setEditing({ material: row })}
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

  const hasFilters = Boolean(q || type || active !== 'true');

  return (
    <PageContainer>
      <PageHeader
        title={type ? MATERIAL_TYPE_CONFIG[type].label : 'Danh mục vật tư'}
        description="Phân bón, thuốc và vật tư dùng trong vườn. Ngừng dùng chỉ ẩn khỏi danh sách, lịch sử vẫn tra được."
        breadcrumbs={[
          { label: 'Tổng quan', to: ROUTES.dashboard },
          ...(type
            ? [
                { label: 'Danh mục vật tư', to: ROUTES.materials },
                { label: MATERIAL_TYPE_CONFIG[type].label },
              ]
            : [{ label: 'Danh mục vật tư' }]),
        ]}
        action={
          canEdit ? (
            <Button leftIcon={<Plus className="size-5" />} onClick={() => setEditing({ material: null })}>
              Thêm vật tư
            </Button>
          ) : undefined
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <Input
          label="Tìm vật tư"
          placeholder="Mã hoặc tên vật tư"
          leftIcon={<Search className="size-5" />}
          value={q}
          onChange={(event) => setParam('q', event.target.value)}
          containerClassName="flex-1"
        />
        <Select
          label="Nhóm"
          placeholder="Tất cả nhóm"
          options={TYPE_OPTIONS}
          value={type}
          onChange={(event) => setParam('type', event.target.value)}
          containerClassName="sm:w-48"
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
        isEmpty={materials.length === 0}
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
            icon={Package}
            title={hasFilters ? 'Không có vật tư nào khớp' : 'Danh mục vật tư còn trống'}
            description={
              hasFilters
                ? 'Thử đổi từ khóa, nhóm hoặc trạng thái.'
                : 'Quản lý vườn thêm vật tư để nhân công chọn khi ghi nhận bón phân, phun thuốc.'
            }
          />
        }
      >
        <Table
          caption="Danh mục vật tư của vườn"
          columns={columns}
          data={materials}
          rowKey={(row) => row.id}
        />
      </StateBoundary>

      {editing && (
        <MaterialFormModal
          open
          material={editing.material}
          defaultType={type || undefined}
          onClose={() => setEditing(null)}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Xóa vật tư?"
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
            toast.error('Xóa vật tư thất bại. Thử lại giúp bạn.');
          }
        }}
      />
    </PageContainer>
  );
}
