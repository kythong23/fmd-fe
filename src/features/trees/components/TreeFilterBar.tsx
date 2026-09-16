import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button, Drawer, Input, Select } from '@/components/ui';
import { useDisclosure } from '@/hooks/use-disclosure';
import { STATUS_CONFIG, TREE_STATUSES } from '@/constants/status-config';
import type { TreeStatus } from '@/types';
import type { TreeFilterState } from '../hooks/use-tree-filters';

export interface TreeFilterBarProps {
  filters: TreeFilterState;
  blocks: string[];
  hasFilters: boolean;
  onChange: (patch: Partial<TreeFilterState>) => void;
  onClear: () => void;
}

const STATUS_OPTIONS = TREE_STATUSES.map((status) => ({
  value: status,
  label: STATUS_CONFIG[status].label,
}));

export function TreeFilterBar({
  filters,
  blocks,
  hasFilters,
  onChange,
  onClear,
}: TreeFilterBarProps) {
  const drawer = useDisclosure();

  const controls = (
    <>
      <Select
        label="Trạng thái"
        placeholder="Tất cả trạng thái"
        options={STATUS_OPTIONS}
        value={filters.status ?? ''}
        onChange={(event) => onChange({ status: (event.target.value || undefined) as TreeStatus })}
        containerClassName="sm:w-48"
      />
      <Select
        label="Lô"
        placeholder="Tất cả lô"
        options={blocks.map((block) => ({ value: block, label: 'Lô ' + block }))}
        value={filters.block ?? ''}
        onChange={(event) => onChange({ block: event.target.value || undefined })}
        containerClassName="sm:w-40"
      />
    </>
  );

  return (
    <div className="mb-4 flex flex-col gap-3">
      <div className="flex items-end gap-2">
        <Input
          label="Tìm cây"
          placeholder="Mã cây hoặc giống, ví dụ SD-001"
          leftIcon={<Search className="size-5" />}
          value={filters.q ?? ''}
          onChange={(event) => onChange({ q: event.target.value || undefined })}
          containerClassName="flex-1"
        />
        <Button
          variant="secondary"
          size="md"
          className="sm:hidden"
          onClick={drawer.open}
          leftIcon={<SlidersHorizontal className="size-5" />}
        >
          Bộ lọc
        </Button>
      </div>

      <div className="hidden flex-wrap items-end gap-3 sm:flex">
        {controls}
        {hasFilters && (
          <Button variant="ghost" size="md" onClick={onClear} leftIcon={<X className="size-5" />}>
            Xóa lọc
          </Button>
        )}
      </div>

      <Drawer open={drawer.isOpen} onClose={drawer.close} title="Bộ lọc" side="bottom">
        <div className="flex flex-col gap-4">
          {controls}
          <Button variant="secondary" fullWidth onClick={onClear}>
            Xóa lọc
          </Button>
          <Button fullWidth onClick={drawer.close}>
            Xem kết quả
          </Button>
        </div>
      </Drawer>
    </div>
  );
}
