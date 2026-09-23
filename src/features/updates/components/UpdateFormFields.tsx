import { Controller } from 'react-hook-form';
import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form';
import { Input, RadioGroup, Textarea } from '@/components/ui';
import { PhotoUploader } from '@/components/shared/PhotoUploader';
import { STATUS_CONFIG, TREE_STATUSES } from '@/constants/status-config';
import { ACTIONS_TAKEN, ACTION_TAKEN_LABEL, MEASUREMENT_LIMITS } from '@/constants/activity-types';
import type { MaterialUsageInput, PartTag } from '@/types';
import type { UpdateFormValues } from '../schemas/update.schema';
import { PartTagPicker } from './PartTagPicker';
import { MaterialUsagePicker } from './MaterialUsagePicker';

export interface UpdateFormFieldsProps {
  control: Control<UpdateFormValues>;
  register: UseFormRegister<UpdateFormValues>;
  errors: FieldErrors<UpdateFormValues>;
  disabled: boolean;
}

const STATUS_OPTIONS = TREE_STATUSES.map((status) => {
  const Icon = STATUS_CONFIG[status].icon;
  return { value: status, label: STATUS_CONFIG[status].label, icon: <Icon className="size-5" /> };
});

const ACTION_OPTIONS = ACTIONS_TAKEN.map((action) => ({
  value: action,
  label: ACTION_TAKEN_LABEL[action],
}));

const MEASUREMENT_KEYS = Object.keys(MEASUREMENT_LIMITS) as Array<keyof typeof MEASUREMENT_LIMITS>;

/** Toàn bộ field của form cập nhật — tách khỏi modal shell để mỗi file dưới 200 dòng */
export function UpdateFormFields({ control, register, errors, disabled }: UpdateFormFieldsProps) {
  return (
    <>
      <Controller
        control={control}
        name="status"
        render={({ field }) => (
          <RadioGroup
            label="Tình trạng cây"
            name="status"
            required
            columns={4}
            options={STATUS_OPTIONS}
            value={field.value}
            onChange={field.onChange}
            error={errors.status?.message}
            disabled={disabled}
          />
        )}
      />

      <Controller
        control={control}
        name="conditions"
        render={({ field }) => (
          <PartTagPicker
            value={field.value as PartTag[]}
            onChange={field.onChange}
            disabled={disabled}
          />
        )}
      />

      <Textarea
        label="Mô tả tình trạng"
        placeholder="Ví dụ: Đọt già đều, không phát hiện rầy. Lá tầng dưới hơi vàng."
        error={errors.description?.message}
        disabled={disabled}
        {...register('description')}
      />

      <Controller
        control={control}
        name="images"
        render={({ field }) => (
          <PhotoUploader value={field.value} onChange={field.onChange} disabled={disabled} />
        )}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {MEASUREMENT_KEYS.map((key) => {
          const limit = MEASUREMENT_LIMITS[key];
          return (
            <Input
              key={key}
              label={limit.label + ' (' + limit.unit + ')'}
              type="number"
              inputMode="decimal"
              step="any"
              min={limit.min}
              max={limit.max}
              error={errors[key]?.message}
              disabled={disabled}
              {...register(key)}
            />
          );
        })}
      </div>

      <Controller
        control={control}
        name="actionTaken"
        render={({ field }) => (
          <RadioGroup
            label="Hành động đã làm"
            name="actionTaken"
            columns={3}
            options={ACTION_OPTIONS}
            value={field.value}
            onChange={field.onChange}
            error={errors.actionTaken?.message}
            disabled={disabled}
          />
        )}
      />

      <Controller
        control={control}
        name="materials"
        render={({ field }) => (
          <MaterialUsagePicker
            value={field.value as MaterialUsageInput[]}
            onChange={field.onChange}
            disabled={disabled}
          />
        )}
      />

      <Input
        label="Người thực hiện"
        required
        hint="Mặc định là tài khoản đang đăng nhập; sửa lại nếu bạn ghi hộ người khác."
        error={errors.performer?.message}
        disabled={disabled}
        {...register('performer')}
      />

      <Textarea
        label="Ghi chú thêm"
        rows={3}
        error={errors.notes?.message}
        disabled={disabled}
        {...register('notes')}
      />
    </>
  );
}
