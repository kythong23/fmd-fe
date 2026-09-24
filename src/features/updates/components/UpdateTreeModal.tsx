import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { Button, Modal, useToast } from '@/components/ui';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { toAppError } from '@/services/http';
import { uuid } from '@/utils/uuid';
import { useAuth } from '@/stores/auth-context';
import { useTree } from '@/hooks/tree-queries';
import { useAddTreeUpdate } from '../hooks/use-add-update';
import type { Measurements, PartTag, TreeStatus, UpdateInput } from '@/types';
import { updateSchema } from '../schemas/update.schema';
import type { UpdateFormValues } from '../schemas/update.schema';
import { UpdateFormFields } from './UpdateFormFields';

export interface UpdateTreeModalProps {
  code: string;
  onClose: () => void;
}

function toNumber(value: string | number | undefined): number | undefined {
  if (value === '' || value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function UpdateTreeModal({ code, onClose }: UpdateTreeModalProps) {
  const { user } = useAuth();
  const tree = useTree(code).data;
  // Đặt sẵn trạng thái hiện tại từ cache của passport; chưa có cache thì mặc định healthy
  const currentStatus = tree?.status ?? 'healthy';
  const toast = useToast();
  const mutation = useAddTreeUpdate(code);
  const [confirmClose, setConfirmClose] = useState(false);
  // Sinh 1 lần mỗi lần mở form: bấm Lưu nhiều lúc mất sóng vẫn chỉ ghi 1 bản (04_API §2)
  const [clientRequestId] = useState(uuid);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateFormValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      status: currentStatus,
      conditions: [],
      description: '',
      images: [],
      height: '',
      trunkDiameter: '',
      soilMoisture: '',
      fruitCount: '',
      actionTaken: 'none',
      notes: '',
      performer: user?.fullName ?? '',
      materials: [],
    },
  });

  function requestClose() {
    if (isDirty) setConfirmClose(true);
    else onClose();
  }

  async function onSubmit(values: UpdateFormValues) {
    // Chốt chặn cuối: nút mở form đã ẩn với cây chưa kích hoạt, BE hiện chưa chặn việc này
    if (tree && !tree.activated) {
      toast.error('Nhập thông tin cây ở trang hồ sơ cây trước.', 'Cây chưa được kích hoạt');
      return;
    }
    const measurements: Measurements = {
      height: toNumber(values.height),
      trunkDiameter: toNumber(values.trunkDiameter),
      soilMoisture: toNumber(values.soilMoisture),
      fruitCount: toNumber(values.fruitCount),
    };

    const payload: UpdateInput = {
      status: values.status as TreeStatus,
      conditions: values.conditions as PartTag[],
      description: values.description,
      images: values.images,
      measurements,
      actionTaken: values.actionTaken,
      notes: values.notes,
      performer: values.performer,
      clientRequestId,
      // Chỉ gửi materialId + quantity — BE tự tra code/name/unit/unitPrice (04_API §2a)
      materials: values.materials
        .filter((row) => row.materialId)
        .map((row) => ({ materialId: row.materialId, quantity: row.quantity })),
    };

    try {
      await mutation.mutateAsync(payload);
      toast.success('Đã lưu cập nhật cho cây ' + code);
      onClose();
    } catch (error) {
      // Thất bại: giữ nguyên form, báo lỗi qua toast (không chèn banner lỗi trong modal)
      toast.error(toAppError(error).message, 'Lưu cập nhật thất bại');
    }
  }

  return (
    <>
      <Modal
        open
        onClose={requestClose}
        title={'Cập nhật tình trạng — ' + code}
        description="Ghi nhận tình trạng thực tế tại vườn."
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={requestClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button
              type="submit"
              form="update-tree-form"
              loading={isSubmitting}
              leftIcon={<Save className="size-5" />}
            >
              Lưu cập nhật
            </Button>
          </>
        }
      >
        <form
          id="update-tree-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
          noValidate
        >
          <UpdateFormFields
            control={control}
            register={register}
            errors={errors}
            disabled={isSubmitting}
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmClose}
        title="Đóng form và bỏ dữ liệu đã nhập?"
        description="Nội dung bạn vừa nhập chưa được lưu. Đóng bây giờ sẽ mất toàn bộ."
        confirmLabel="Bỏ và đóng"
        cancelLabel="Tiếp tục nhập"
        danger
        onConfirm={() => {
          setConfirmClose(false);
          onClose();
        }}
        onCancel={() => setConfirmClose(false)}
      />
    </>
  );
}
