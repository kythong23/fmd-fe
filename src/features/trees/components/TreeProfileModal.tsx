import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save } from 'lucide-react';
import { Button, Input, Modal, Select, Textarea, useToast } from '@/components/ui';
import { toAppError } from '@/services/http';
import { useUpdateTreeProfile } from '@/hooks/tree-queries';
import { VARIETIES } from '@/constants/status-config';
import type { Tree, TreeVariety, UpdateTreeProfileInput } from '@/types';

const schema = z.object({
  variety: z.enum(VARIETIES, { message: 'Chọn giống cây' }),
  plantedDate: z.string().min(1, 'Chọn ngày trồng'),
  block: z.string().trim().min(1, 'Nhập lô').max(20, 'Tối đa 20 ký tự'),
  row: z.string().trim().min(1, 'Nhập hàng').max(20, 'Tối đa 20 ký tự'),
  position: z.string().trim().min(1, 'Nhập vị trí').max(20, 'Tối đa 20 ký tự'),
  bedName: z.string().trim().max(100, 'Tối đa 100 ký tự'),
  moundNumber: z.string().trim().max(100, 'Tối đa 100 ký tự'),
  notes: z.string().trim().max(2000, 'Tối đa 2000 ký tự'),
});

type FormValues = z.infer<typeof schema>;

export interface TreeProfileModalProps {
  tree: Tree;
  onClose: () => void;
}

/**
 * PATCH /trees/:code. Cây ảo (chưa kích hoạt) dùng form này để nhập thông tin lần đầu —
 * BE tự kích hoạt cây ở lần PATCH đầu tiên; cây đã kích hoạt thì là sửa hồ sơ.
 */
export function TreeProfileModal({ tree, onClose }: TreeProfileModalProps) {
  const toast = useToast();
  const mutation = useUpdateTreeProfile(tree.code);
  const activating = !tree.activated;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      variety: tree.variety ?? 'Ri6',
      // BE có thể trả ISO datetime — input date chỉ nhận YYYY-MM-DD
      plantedDate: tree.plantedDate ? tree.plantedDate.slice(0, 10) : '',
      block: tree.location.block ?? '',
      row: tree.location.row ?? '',
      position: tree.location.position ?? '',
      bedName: tree.location.bedName ?? '',
      moundNumber: tree.location.moundNumber ?? '',
      notes: tree.notes ?? '',
    },
  });

  async function onSubmit(values: FormValues) {
    const input: UpdateTreeProfileInput = {
      variety: values.variety as TreeVariety,
      plantedDate: values.plantedDate,
      block: values.block,
      row: values.row,
      position: values.position,
      // Để trống thì không gửi — BE không nhận null, gửi '' sẽ xoá mất giá trị cũ
      bedName: values.bedName || undefined,
      moundNumber: values.moundNumber || undefined,
      notes: values.notes || undefined,
    };
    try {
      await mutation.mutateAsync(input);
      toast.success(
        activating ? 'Đã kích hoạt cây ' + tree.code : 'Đã lưu hồ sơ cây ' + tree.code,
      );
      onClose();
    } catch (error) {
      toast.error(
        toAppError(error).message,
        activating ? 'Kích hoạt cây thất bại' : 'Sửa hồ sơ thất bại',
      );
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={(activating ? 'Nhập thông tin cây ' : 'Sửa hồ sơ cây ') + tree.code}
      description={
        activating
          ? 'Cây chưa có thông tin. Lưu xong cây sẽ được kích hoạt và có thể ghi cập nhật tình trạng.'
          : 'Thông tin cố định của cây. Tình trạng sức khỏe ghi ở mục "Cập nhật tình trạng".'
      }
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            type="submit"
            form="tree-profile-form"
            loading={isSubmitting}
            leftIcon={<Save className="size-5" />}
          >
            {activating ? 'Lưu & kích hoạt' : 'Lưu hồ sơ'}
          </Button>
        </>
      }
    >
      <form
        id="tree-profile-form"
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
        <div className="grid grid-cols-2 gap-2">
          <Input label="Liếp" error={errors.bedName?.message} {...register('bedName')} />
          <Input label="Mô" error={errors.moundNumber?.message} {...register('moundNumber')} />
        </div>
        <Textarea label="Ghi chú" rows={3} error={errors.notes?.message} {...register('notes')} />
      </form>
    </Modal>
  );
}
