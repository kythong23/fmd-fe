import type { BadgeVariant } from '@/components/ui';
import type { MaterialType } from '@/types';

export const MATERIAL_TYPE_CONFIG: Record<MaterialType, { label: string; variant: BadgeVariant }> = {
  fertilizer: { label: 'Phân bón', variant: 'success' },
  pesticide: { label: 'Thuốc trừ sâu', variant: 'error' },
  fungicide: { label: 'Thuốc trừ nấm', variant: 'warning' },
  herbicide: { label: 'Thuốc trừ cỏ', variant: 'info' },
  stimulant: { label: 'Chất kích thích', variant: 'primary' },
  other: { label: 'Khác', variant: 'neutral' },
};

export const MATERIAL_TYPES = Object.keys(MATERIAL_TYPE_CONFIG) as MaterialType[];
