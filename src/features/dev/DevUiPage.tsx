import { useState } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { PageContainer, PageHeader } from '@/components/layout/PageContainer';
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Input,
  Modal,
  RadioGroup,
  Select,
  Skeleton,
  Tabs,
  Textarea,
  Tooltip,
  useToast,
} from '@/components/ui';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { HealthScore } from '@/components/shared/HealthScore';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { TREE_STATUSES } from '@/constants/status-config';
import { runSelfChecks } from '@/utils/self-check';
import type { ButtonVariant, ControlSize } from '@/components/ui';

const VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'ghost', 'danger', 'link'];
const SIZES: ControlSize[] = ['sm', 'md', 'lg'];

/** Trang liệt kê mọi variant × state — tiêu chí "xong Design System" (05_FRONTEND §17.4) */
export default function DevUiPage() {
  const toast = useToast();
  const [tab, setTab] = useState('buttons');
  const [radio, setRadio] = useState('healthy');
  const [modalOpen, setModalOpen] = useState(false);
  const checks = runSelfChecks();

  return (
    <PageContainer>
      <PageHeader title="Dev — UI kit" description="Chỉ có ở bản dev. Kiểm tra nhanh mọi component." />

      <Tabs
        label="Nhóm component"
        value={tab}
        onChange={setTab}
        items={[
          { value: 'buttons', label: 'Buttons' },
          { value: 'forms', label: 'Forms' },
          { value: 'states', label: 'States' },
          { value: 'checks', label: 'Self-check', count: checks.filter((c) => !c.ok).length },
        ]}
        className="mb-4"
      />

      {tab === 'buttons' && (
        <Card className="flex flex-col gap-4">
          {VARIANTS.map((variant) => (
            <div key={variant} className="flex flex-wrap items-center gap-2">
              {SIZES.map((size) => (
                <Button key={size} variant={variant} size={size}>
                  {variant} / {size}
                </Button>
              ))}
              <Button variant={variant} loading>
                Đang tải
              </Button>
              <Button variant={variant} disabled>
                Disabled
              </Button>
              <Button variant={variant} iconOnly aria-label="Thêm">
                <Plus className="size-5" />
              </Button>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            {TREE_STATUSES.map((status) => (
              <StatusBadge key={status} status={status} size="md" />
            ))}
            <Badge variant="info" icon={<Check className="size-4" />}>
              Info
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <HealthScore score={92} />
            <HealthScore score={76} />
            <HealthScore score={48} />
            <Tooltip content="Tooltip hiện khi hover hoặc focus">
              <Button variant="secondary" size="sm">
                Hover tôi
              </Button>
            </Tooltip>
          </div>
        </Card>
      )}

      {tab === 'forms' && (
        <Card className="flex flex-col gap-4">
          <Input label="Input thường" hint="Helper text" />
          <Input label="Input lỗi" error="Nội dung này chưa hợp lệ" />
          <Input label="Input disabled" disabled value="Không sửa được" readOnly />
          <Select
            label="Select"
            placeholder="Chọn một mục"
            options={[
              { value: 'a', label: 'Lựa chọn A' },
              { value: 'b', label: 'Lựa chọn B' },
            ]}
          />
          <Textarea label="Textarea" hint="Tối đa 1000 ký tự" />
          <Checkbox label="Checkbox" hint="Mô tả phụ" />
          <RadioGroup
            label="Radio group"
            name="dev-radio"
            columns={4}
            options={TREE_STATUSES.map((status) => ({ value: status, label: status }))}
            value={radio}
            onChange={setRadio}
          />
          <div className="flex gap-2">
            <Button onClick={() => setModalOpen(true)}>Mở modal</Button>
            <Button variant="secondary" onClick={() => toast.success('Toast thành công')}>
              Toast success
            </Button>
            <Button variant="danger" onClick={() => toast.error('Toast lỗi')}>
              Toast error
            </Button>
          </div>
        </Card>
      )}

      {tab === 'states' && (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-24 w-full" />
          <EmptyState
            title="Empty state"
            description="Nói rõ vì sao trống và làm gì tiếp theo."
            action={<Button>Hành động</Button>}
          />
          <ErrorState error={new Error('Lỗi giả lập')} onRetry={() => toast.info('Đã thử lại')} />
        </div>
      )}

      {tab === 'checks' && (
        <Card>
          <ul className="flex flex-col gap-2">
            {checks.map((check) => (
              <li key={check.name} className="flex items-center gap-2 text-body-sm">
                {check.ok ? (
                  <Check aria-hidden className="size-5 text-success" />
                ) : (
                  <X aria-hidden className="size-5 text-error" />
                )}
                <span className={check.ok ? 'text-text-secondary' : 'font-semibold text-error'}>
                  {check.name}
                </span>
                {check.detail && <span className="text-caption text-text-muted">{check.detail}</span>}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Modal mẫu"
        description="Có focus trap, Esc để đóng, mobile là full-screen."
        footer={
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            Đóng
          </Button>
        }
      >
        <p className="text-body-sm text-text-secondary">Nội dung modal.</p>
      </Modal>
    </PageContainer>
  );
}
