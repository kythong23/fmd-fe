import { Controller, useForm } from 'react-hook-form';
import { Button, Checkbox, Input, Modal, NumberInput, Textarea, useToast } from '@/components/ui';
import { toAppError } from '@/services/http';
import { useCreateVariety, useUpdateVariety } from '../hooks/use-varieties';
import type { Variety, VarietyInput } from '@/types';

export interface VarietyFormModalProps {
  open: boolean;
  /** null = thêm mới */
  variety: Variety | null;
  onClose: () => void;
}

export function VarietyFormModal({ open, variety, onClose }: VarietyFormModalProps) {
  const toast = useToast();
  const createMutation = useCreateVariety();
  const updateMutation = useUpdateVariety();
  const mutation = variety ? updateMutation : createMutation;

  const { register, control, handleSubmit, formState } = useForm<VarietyInput>({
    values: {
      name: variety?.name ?? '',
      unitPrice: variety?.unitPrice ?? null,
      active: variety?.active ?? true,
      notes: variety?.notes ?? '',
    },
  });

  async function onSubmit(values: VarietyInput) {
    const input: VarietyInput = {
      ...values,
      notes: values.notes?.trim() || undefined,
    };
    try {
      if (variety) await updateMutation.mutateAsync({ id: variety.id, input });
      else await createMutation.mutateAsync(input);
      toast.success(variety ? 'Đã lưu giống cây' : 'Đã thêm giống cây mới');
      onClose();
    } catch (error) {
      toast.error(toAppError(error).message, 'Lưu giống cây thất bại');
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={variety ? 'Sửa giống cây' : 'Thêm giống cây'}
      description="Tên giống và giá giống hiển thị khi quản lý vườn tra giá cây con."
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Quay lại
          </Button>
          <Button
            type="submit"
            form="variety-form"
            loading={mutation.isPending || formState.isSubmitting}
          >
            Lưu
          </Button>
        </>
      }
    >
      <form
        id="variety-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <Input
          label="Tên giống"
          required
          placeholder="Ri6, Monthong (Dona), Musang King..."
          error={formState.errors.name ? 'Nhập tên giống' : undefined}
          {...register('name', { required: true })}
        />
        <Controller
          control={control}
          name="unitPrice"
          render={({ field }) => (
            <NumberInput
              label="Giá giống (đ/cây)"
              min={0}
              hint="Bỏ trống nếu chưa có giá."
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <Textarea label="Ghi chú" rows={3} {...register('notes')} />
        <Checkbox
          label="Đang dùng"
          hint="Bỏ chọn để ngừng dùng — giống ẩn khỏi danh sách chọn khi tạo cây mới."
          {...register('active')}
        />
      </form>
    </Modal>
  );
}
