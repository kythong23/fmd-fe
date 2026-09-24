import { Plus, Trash2 } from 'lucide-react';
import { Button, Input, Select } from '@/components/ui';
import { useActiveMaterials } from '@/features/materials/hooks/use-materials';
import { formatNumber } from '@/utils/format';
import type { MaterialUsageInput } from '@/types';

export interface MaterialUsagePickerProps {
  value: MaterialUsageInput[];
  onChange: (value: MaterialUsageInput[]) => void;
  disabled?: boolean;
}

/**
 * Khối "Vật tư đã dùng" trong form cập nhật (05_FRONTEND §6.6).
 * FE chỉ giữ/gửi materialId + quantity — tên/đơn vị/giá chỉ dùng để hiển thị,
 * BE tự tra và snapshot lại khi lưu (04_API §2a).
 */
export function MaterialUsagePicker({ value, onChange, disabled }: MaterialUsagePickerProps) {
  const { data: allMaterials = [], isLoading } = useActiveMaterials();
  // Cây giống nằm chung danh mục vật tư nhưng không phải thứ "đã dùng" khi chăm sóc cây
  const materials = allMaterials.filter((item) => item.type !== 'variety');
  // BE cắt hẳn unitPrice với worker/viewer — cùng cách kiểm tra như /materials (D9)
  const showPrice = materials.some((item) => item.unitPrice !== undefined);

  const options = materials.map((item) => ({ value: item.id, label: item.code + ' — ' + item.name }));

  function addRow() {
    const used = new Set(value.map((row) => row.materialId));
    const next = materials.find((item) => !used.has(item.id));
    onChange([...value, { materialId: next?.id ?? '', quantity: 1 }]);
  }

  function updateRow(index: number, patch: Partial<MaterialUsageInput>) {
    onChange(value.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function removeRow(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  const total = value.reduce((sum, row) => {
    const material = materials.find((item) => item.id === row.materialId);
    return sum + (material?.unitPrice ? material.unitPrice * row.quantity : 0);
  }, 0);

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-label font-semibold text-text-primary">
        Vật tư đã dùng
        <span className="ml-1 font-normal text-text-muted">(tùy chọn)</span>
      </legend>

      <div className="flex flex-col gap-2">
        {value.map((row, index) => {
          const material = materials.find((item) => item.id === row.materialId);
          const alreadyUsed = new Set(value.map((r) => r.materialId).filter((_, i) => i !== index));
          const rowOptions = options.filter(
            (option) => option.value === row.materialId || !alreadyUsed.has(option.value),
          );
          return (
            <div key={index} className="flex items-end gap-2">
              <Select
                label="Vật tư"
                hideLabel
                placeholder="Chọn vật tư"
                options={rowOptions}
                value={row.materialId}
                disabled={disabled || isLoading}
                onChange={(event) => updateRow(index, { materialId: event.target.value })}
                containerClassName="flex-1"
              />
              <Input
                label="Số lượng"
                hideLabel
                type="number"
                inputMode="decimal"
                step="any"
                min={0}
                value={row.quantity}
                disabled={disabled}
                onChange={(event) => updateRow(index, { quantity: Number(event.target.value) })}
                containerClassName="w-28"
              />
              <span className="mb-2.5 min-w-10 text-caption text-text-muted">{material?.unit ?? ''}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                iconOnly
                aria-label="Xóa dòng vật tư"
                disabled={disabled}
                onClick={() => removeRow(index)}
              >
                <Trash2 className="size-4 text-error" />
              </Button>
            </div>
          );
        })}
      </div>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        leftIcon={<Plus className="size-4" />}
        disabled={disabled || isLoading || value.length >= materials.length}
        onClick={addRow}
        className="self-start"
      >
        Thêm vật tư
      </Button>

      {showPrice && total > 0 && (
        <p className="text-body-sm text-text-secondary">
          Thành tiền tạm tính: <span className="font-semibold">{formatNumber(total, 'đ')}</span>
        </p>
      )}
    </fieldset>
  );
}
