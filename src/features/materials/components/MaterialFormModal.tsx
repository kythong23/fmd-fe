import { useForm } from 'react-hook-form';
import { Button, Checkbox, Input, Modal, Select, Textarea, useToast } from '@/components/ui';
import { ErrorState } from '@/components/shared/ErrorState';
import { MATERIAL_TYPE_CONFIG, MATERIAL_TYPES } from '@/constants/material-types';
import { useCreateMaterial, useUpdateMaterial } from '../hooks/use-materials';
import type { Material, MaterialInput, MaterialType } from '@/types';

const TYPE_OPTIONS = MATERIAL_TYPES.map((type) => ({
  value: type,
  label: MATERIAL_TYPE_CONFIG[type].label,
}));

export interface MaterialFormModalProps {
  open: boolean;
  /** null = thêm mới */
  material: Material | null;
  /** Nhóm đang lọc — điền sẵn khi thêm mới từ sub-menu */
  defaultType?: MaterialType;
  onClose: () => void;
}

export function MaterialFormModal({ open, material, defaultType, onClose }: MaterialFormModalProps) {
  const toast = useToast();
  const createMutation = useCreateMaterial();
  const updateMutation = useUpdateMaterial();
  const mutation = material ? updateMutation : createMutation;

  const { register, handleSubmit, formState } = useForm<MaterialInput>({
    values: {
      code: material?.code ?? '',
      name: material?.name ?? '',
      type: material?.type ?? defaultType ?? 'fertilizer',
      unit: material?.unit ?? '',
      unitPrice: material?.unitPrice ?? null,
      active: material?.active ?? true,
      notes: material?.notes ?? '',
    },
  });

  async function onSubmit(values: MaterialInput) {
    const input: MaterialInput = {
      ...values,
      unitPrice: Number.isFinite(values.unitPrice as number) ? values.unitPrice : null,
      notes: values.notes?.trim() || undefined,
    };
    if (material) await updateMutation.mutateAsync({ id: material.id, input });
    else await createMutation.mutateAsync(input);
    toast.success(material ? 'Đã lưu vật tư' : 'Đã thêm vật tư mới');
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={material ? 'Sửa vật tư' : 'Thêm vật tư'}
      description="Mã và tên hiển thị cho nhân công khi ghi nhận bón phân, phun thuốc."
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Quay lại
          </Button>
          <Button
            type="submit"
            form="material-form"
            loading={mutation.isPending || formState.isSubmitting}
          >
            Lưu
          </Button>
        </>
      }
    >
      {mutation.isError && (
        <div className="mb-4">
          <ErrorState
            error={mutation.error}
            title="Lưu vật tư thất bại"
            onRetry={() => mutation.reset()}
          />
        </div>
      )}

      <form
        id="material-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <Input
          label="Mã vật tư"
          required
          error={formState.errors.code ? 'Nhập mã vật tư' : undefined}
          {...register('code', { required: true })}
        />
        <Input
          label="Tên vật tư"
          required
          error={formState.errors.name ? 'Nhập tên vật tư' : undefined}
          {...register('name', { required: true })}
        />
        <Select label="Nhóm" required options={TYPE_OPTIONS} {...register('type')} />
        <Input
          label="Đơn vị tính"
          required
          placeholder="kg, lít, bao..."
          error={formState.errors.unit ? 'Nhập đơn vị tính' : undefined}
          {...register('unit', { required: true })}
        />
        <Input
          label="Đơn giá (đ)"
          type="number"
          min={0}
          hint="Bỏ trống nếu chưa có giá."
          {...register('unitPrice', { valueAsNumber: true, min: 0 })}
        />
        <Textarea label="Ghi chú" rows={3} {...register('notes')} />
        <Checkbox
          label="Đang dùng"
          hint="Bỏ chọn để ngừng dùng — vật tư ẩn khỏi danh sách nhưng lịch sử vẫn tra được."
          {...register('active')}
        />
      </form>
    </Modal>
  );
}
