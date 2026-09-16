import {
  LayoutDashboard,
  Trees,
  Map,
  QrCode,
  ScrollText,
  Settings,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import type { Permission } from '@/constants/roles';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  permission?: Permission;
  /** Hiện ở thanh dưới cùng trên mobile (tối đa 5 mục) */
  mobile?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: ROUTES.dashboard, label: 'Tổng quan', icon: LayoutDashboard, mobile: true },
  { to: ROUTES.trees, label: 'Danh sách cây', icon: Trees, mobile: true },
  { to: ROUTES.map, label: 'Bản đồ vườn', icon: Map, mobile: true },
  { to: ROUTES.activity, label: 'Nhật ký vườn', icon: ScrollText, mobile: true },
  { to: ROUTES.qr, label: 'Quản lý QR', icon: QrCode, permission: 'qr:manage', mobile: true },
  { to: ROUTES.settings, label: 'Cài đặt vườn', icon: Settings, permission: 'farm:settings' },
];
