import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Plus, Printer, QrCode, Search } from 'lucide-react';
import { PageContainer, PageHeader } from '@/components/layout/PageContainer';
import { Button, Input, Select, Skeleton } from '@/components/ui';
import { StateBoundary } from '@/components/shared/StateBoundary';
import { EmptyState } from '@/components/shared/EmptyState';
import { useTrees } from '@/hooks/tree-queries';
import { useDebounce } from '@/hooks/use-debounce';
import { useDisclosure } from '@/hooks/use-disclosure';
import { ROUTES } from '@/constants/routes';
import { QrCard } from '../components/QrCard';
import { CreateTreeModal } from '../components/CreateTreeModal';

export default function QrManagementPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const createModal = useDisclosure();
  const [selected, setSelected] = useState<string[]>([]);

  const q = searchParams.get('q') ?? '';
  const block = searchParams.get('block') ?? '';
  const debouncedQuery = useDebounce(q, 300);

  const query = useTrees({ q: debouncedQuery || undefined, block: block || undefined });
  const trees = useMemo(() => query.data ?? [], [query.data]);
  const blocks = useMemo(
    () => Array.from(new Set(trees.map((tree) => tree.location.block))).sort(),
    [trees],
  );

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

  function toggle(code: string) {
    setSelected((current) =>
      current.includes(code) ? current.filter((item) => item !== code) : [...current, code],
    );
  }

  // In: chọn thẻ nào in thẻ đó (không chọn = in tất cả); thẻ ngoài danh sách chỉ ẩn lúc in
  const printCount = selected.length > 0 ? selected.length : trees.length;

  return (
    <PageContainer>
      <div data-print-hide>
        <PageHeader
          title="Quản lý mã QR"
          description="Sinh, tải và in thẻ QR dán tại gốc cây. Mã sửa lỗi mức H để chịu được bụi bẩn ngoài vườn."
          breadcrumbs={[{ label: 'Tổng quan', to: ROUTES.dashboard }, { label: 'Quản lý QR' }]}
          action={
            <Button onClick={createModal.open} leftIcon={<Plus className="size-5" />}>
              Tạo cây mới
            </Button>
          }
        />
      </div>

      {/* Tiêu đề duy nhất hiện khi in */}
      <h2 className="mb-3 hidden text-h3 font-bold text-text-primary print:block">Các mã cần in</h2>

      <div data-print-hide className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <Input
          label="Tìm cây"
          placeholder="Mã cây hoặc giống"
          leftIcon={<Search className="size-5" />}
          value={q}
          onChange={(event) => setParam('q', event.target.value)}
          containerClassName="flex-1"
        />
        <Select
          label="Lô"
          placeholder="Tất cả lô"
          options={blocks.map((item) => ({ value: item, label: 'Lô ' + item }))}
          value={block}
          onChange={(event) => setParam('block', event.target.value)}
          containerClassName="sm:w-40"
        />
        <Button
          variant="secondary"
          onClick={() => window.print()}
          disabled={printCount === 0}
          leftIcon={<Printer className="size-5" />}
        >
          In {selected.length > 0 ? selected.length + ' mã đã chọn' : 'tất cả'}
        </Button>
      </div>

      <StateBoundary
        isLoading={query.isPending}
        error={query.error}
        isEmpty={trees.length === 0}
        onRetry={() => query.refetch()}
        skeleton={
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-72 w-full" />
            ))}
          </div>
        }
        empty={
          <EmptyState
            icon={QrCode}
            title="Chưa có thẻ QR nào"
            description="Tạo cây đầu tiên để hệ thống sinh mã và thẻ QR tương ứng."
            action={<Button onClick={createModal.open}>Tạo cây mới</Button>}
          />
        }
      >
        <div
          data-print-area
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6 print:grid-cols-3"
        >
          {trees.map((tree) => (
            <QrCard
              key={tree.code}
              tree={tree}
              selected={selected.includes(tree.code)}
              onToggle={toggle}
              className={selected.length > 0 && !selected.includes(tree.code) ? 'print:hidden' : ''}
            />
          ))}
        </div>
      </StateBoundary>

      {createModal.isOpen && <CreateTreeModal onClose={createModal.close} />}
    </PageContainer>
  );
}
