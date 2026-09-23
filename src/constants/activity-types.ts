import {
  Stethoscope,
  Droplets,
  Sprout,
  SprayCan,
  Scissors,
  Syringe,
  Package,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ActionTaken, ActivityType, PartTag } from '@/types';

export const ACTIVITY_CONFIG: Record<ActivityType, { label: string; icon: LucideIcon }> = {
  health_check: { label: 'Kiểm tra sức khỏe', icon: Stethoscope },
  watering: { label: 'Tưới nước', icon: Droplets },
  fertilizing: { label: 'Bón phân', icon: Sprout },
  spraying: { label: 'Phun thuốc', icon: SprayCan },
  pruning: { label: 'Cắt tỉa', icon: Scissors },
  treatment: { label: 'Điều trị bệnh', icon: Syringe },
  harvest: { label: 'Thu hoạch', icon: Package },
};

export const ACTIVITY_TYPES = Object.keys(ACTIVITY_CONFIG) as ActivityType[];

/** Màu riêng theo loại hoạt động — giúp phân biệt nhanh trên timeline (dùng token màu sẵn có) */
export const ACTIVITY_STYLE: Record<ActivityType, { icon: string; dot: string }> = {
  health_check: { icon: 'bg-error-subtle text-error', dot: 'bg-error' },
  watering: { icon: 'bg-info-subtle text-info', dot: 'bg-info' },
  fertilizing: { icon: 'bg-success-subtle text-success', dot: 'bg-success' },
  spraying: { icon: 'bg-warning-subtle text-warning', dot: 'bg-warning' },
  pruning: { icon: 'bg-secondary-subtle text-secondary-hover', dot: 'bg-secondary-hover' },
  treatment: { icon: 'bg-neutral-subtle text-neutral', dot: 'bg-neutral' },
  harvest: { icon: 'bg-primary-subtle text-primary-hover', dot: 'bg-primary' },
};

export const ACTION_TAKEN_LABEL: Record<ActionTaken, string> = {
  watering: 'Tưới nước',
  fertilizing: 'Bón phân',
  spraying: 'Phun thuốc',
  pruning: 'Cắt tỉa',
  treatment: 'Điều trị bệnh',
  none: 'Chỉ kiểm tra',
};

export const ACTIONS_TAKEN = Object.keys(ACTION_TAKEN_LABEL) as ActionTaken[];

export const PART_TAG_LABEL: Record<PartTag, string> = {
  leaf: 'Lá',
  stem: 'Thân',
  branch: 'Cành',
  flower: 'Hoa',
  fruit: 'Trái',
  pest: 'Sâu bệnh',
  soil: 'Đất',
  other: 'Khác',
};

export const PART_TAGS = Object.keys(PART_TAG_LABEL) as PartTag[];

export const MEASUREMENT_LIMITS = {
  height: { min: 0, max: 30, unit: 'm', label: 'Chiều cao' },
  trunkDiameter: { min: 0, max: 200, unit: 'cm', label: 'Đường kính thân' },
  soilMoisture: { min: 0, max: 100, unit: '%', label: 'Độ ẩm đất' },
  fruitCount: { min: 0, max: 500, unit: 'trái', label: 'Số trái' },
} as const;
