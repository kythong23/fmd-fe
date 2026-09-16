import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';
import { Button, Input, Modal, Select, useToast } from '@/components/ui';
import { ErrorState } from '@/components/shared/ErrorState';
import { useCreateTree } from '@/hooks/tree-queries';
import { TREE_STATUSES, STATUS_CONFIG, VARIETIES } from '@/constants/status-config';
import type { CreateTreeInput, TreeStatus, TreeVariety } from '@/types';

const schema = z.object({
  variety: z.enum(VARIETIES, { message: 'Chọn giống cây' }),
  plantedDate: z.string().min(1, 'Chọn ngày trồng'),
  block: z.string().trim().min(1, 'Nhập lô'),
  row: z.string().trim().min(1, 'Nhập hàng'),
  position: z.string().trim().min(1, 'Nhập vị trí'),
  status: z.enum(['healthy', 'monitoring', 'problem', 'unknown']),
});

type FormValues = z.infer<typeof schema>;

export function CreateTreeModal({ onClose }: { onClose: () => void }) {
  const toast = useToast();
  const mutation = useCreateTree();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      variety: 'Ri6',
      plantedDate: '',
      block: 'A',
      row: '',
      position: '',
      status: 'healthy',
    },
  });

  async function onSubmit(values: FormValues) {
    const input: CreateTreeInput = {
      ...values,
      variety: values.variety as TreeVariety,
      status: values.status as TreeStatus,
    };
    const tree = await mutation.mutateAsync(input);
    // Mã cây do backend sinh, FE không tự đánh số (04_API §1 — Trees)
    toast.success('Đã tạo cây ' + tree.code);
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Tạo cây mới"
      description="Hệ thống tự sinh mã cây và thẻ QR sau khi lưu."
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            type="submit"
            form="create-tree-form"
            loading={isSubmitting}
            leftIcon={<Plus className="size-5" />}
          >
            Tạo cây
          </Button>
        </>
      }
    >
      {mutation.isError && (
        <div className="mb-4">
          <ErrorState
            error={mutation.error}
            title="Tạo cây thất bại"
            onRetry={() => mutation.reset()}
          />
        </div>
      )}

      <form
        id="create-tree-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <Select
          label="Giống"
          required
          options={VARIETIES.map((variety) => ({ value: variety, label: variety }))}
          error={errors.variety?.message}
          {...register('variety')}
        />
        <Input
          label="Ngày trồng"
          type="date"
          required
          error={errors.plantedDate?.message}
          {...register('plantedDate')}
        />
        <div className="grid grid-cols-3 gap-2">
          <Input label="Lô" required error={errors.block?.message} {...register('block')} />
          <Input label="Hàng" required error={errors.row?.message} {...register('row')} />
          <Input
            label="Vị trí"
            required
            error={errors.position?.message}
            {...register('position')}
          />
        </div>
        <Select
          label="Tình trạng ban đầu"
          required
          options={TREE_STATUSES.map((status) => ({
            value: status,
            label: STATUS_CONFIG[status].label,
          }))}
          error={errors.status?.message}
          {...register('status')}
        />
      </form>
    </Modal>
  );
}
