import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { Button, Modal, useToast } from '@/components/ui';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { ErrorState } from '@/components/shared/ErrorState';
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
  // Đặt sẵn trạng thái hiện tại từ cache của passport; chưa có cache thì mặc định healthy
  const currentStatus = useTree(code).data?.status ?? 'healthy';
  const toast = useToast();
  const mutation = useAddTreeUpdate(code);
  const [confirmClose, setConfirmClose] = useState(false);
  // Sinh 1 lần mỗi lần mở form: bấm Lưu nhiều lúc mất sóng vẫn chỉ ghi 1 bản (04_API §2)
  const [clientRequestId] = useState(() => crypto.randomUUID());

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
    },
  });

  function requestClose() {
    if (isDirty) setConfirmClose(true);
    else onClose();
  }

  async function onSubmit(values: UpdateFormValues) {
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
    };

    try {
      await mutation.mutateAsync(payload);
      toast.success('Đã lưu cập nhật cho cây ' + code);
      onClose();
    } catch {
      // Thất bại: giữ nguyên form, lỗi hiện ở đầu modal kèm nút thử lại (05_FRONTEND §6.6)
    }
  }

  return (
    <>
      <Modal
        open
        onClose={requestClose}
        title={'Cập nhật tình trạng — ' + code}
        description="Ghi nhận tình trạng thực tế tại vườn. Mô tả là bắt buộc để người sau đọc lại còn hiểu."
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
        {mutation.isError && (
          <div className="mb-4">
            <ErrorState
              error={mutation.error}
              title="Lưu cập nhật thất bại"
              onRetry={() => mutation.reset()}
            />
          </div>
        )}

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
