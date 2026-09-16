import { CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { FruitCondition, LeafCondition, TreeStatus } from '@/types';
import type { BadgeVariant } from '@/components/ui/Badge';

interface StatusConfig {
  label: string;
  icon: LucideIcon;
  badge: BadgeVariant;
  /** CSS variable — dùng cho SVG/canvas nơi utility class không áp dụng */
  colorVar: string;
  /** Hình dạng marker trên map: màu không phải tín hiệu duy nhất (07 §5) */
  shape: 'circle' | 'triangle' | 'square' | 'diamond';
}

export const STATUS_CONFIG: Record<TreeStatus, StatusConfig> = {
  healthy: {
    label: 'Khỏe mạnh',
    icon: CheckCircle2,
    badge: 'success',
    colorVar: 'var(--color-success)',
    shape: 'circle',
  },
  monitoring: {
    label: 'Cần theo dõi',
    icon: AlertTriangle,
    badge: 'warning',
    colorVar: 'var(--color-warning)',
    shape: 'triangle',
  },
  problem: {
    label: 'Có vấn đề',
    icon: AlertOctagon,
    badge: 'error',
    colorVar: 'var(--color-error)',
    shape: 'square',
  },
  unknown: {
    label: 'Chưa rõ',
    icon: HelpCircle,
    badge: 'neutral',
    colorVar: 'var(--color-neutral)',
    shape: 'diamond',
  },
};

export const TREE_STATUSES: TreeStatus[] = ['healthy', 'monitoring', 'problem', 'unknown'];

export const LEAF_CONDITION_LABEL: Record<LeafCondition, string> = {
  good: 'Tốt',
  fair: 'Trung bình',
  poor: 'Kém',
  yellowing: 'Vàng lá',
};

export const FRUIT_CONDITION_LABEL: Record<FruitCondition, string> = {
  developing: 'Đang phát triển',
  blooming: 'Đang ra hoa',
  maturing: 'Sắp thu hoạch',
  harvested: 'Đã thu hoạch',
  none: 'Chưa có trái',
};

export const VARIETIES = [
  'Ri6',
  'Monthong (Dona)',
  'Musang King',
  'Black Thorn',
  'Chuồng Bò',
] as const;

/** Ngưỡng đổi màu điểm sức khỏe (05_FRONTEND §6.4) */
export const HEALTH_THRESHOLD = { good: 85, fair: 70 } as const;
