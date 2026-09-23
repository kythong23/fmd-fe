import {
  LayoutDashboard,
  Trees,
  Map,
  QrCode,
  ScrollText,
  Package,
  Settings,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { MATERIAL_TYPES, MATERIAL_TYPE_CONFIG } from '@/constants/material-types';
import type { Permission } from '@/constants/roles';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  permission?: Permission;
  /** Hiện ở thanh dưới cùng trên mobile (tối đa 5 mục) */
  mobile?: boolean;
  /** Mục con hiện trong sidebar (chỉ một cấp) */
  children?: { to: string; label: string }[];
}

export const NAV_ITEMS: NavItem[] = [
  { to: ROUTES.dashboard, label: 'Tổng quan', icon: LayoutDashboard, mobile: true },
  { to: ROUTES.trees, label: 'Danh sách cây', icon: Trees, mobile: true },
  { to: ROUTES.map, label: 'Bản đồ vườn', icon: Map, mobile: true },
  { to: ROUTES.activity, label: 'Nhật ký vườn', icon: ScrollText, mobile: true },
  { to: ROUTES.qr, label: 'Quản lý QR', icon: QrCode, permission: 'qr:manage', mobile: true },
  {
    to: ROUTES.materials,
    label: 'Danh mục',
    icon: Package,
    children: [
      ...MATERIAL_TYPES.map((type) => ({
        to: ROUTES.materials + '?type=' + type,
        label: MATERIAL_TYPE_CONFIG[type].label,
      })),
      { to: ROUTES.varieties, label: 'Cây giống' },
    ],
  },
  { to: ROUTES.settings, label: 'Cài đặt vườn', icon: Settings, permission: 'farm:settings' },
];
