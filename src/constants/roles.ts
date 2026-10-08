import type { UserRole } from '@/types';

export type Permission =
  | 'tree:read'
  | 'tree:create'
  | 'tree:update'
  | 'tree:delete'
  | 'tree:move'
  | 'qr:manage'
  | 'farm:settings'
  | 'report:view';

const MANAGER: Permission[] = [
  'tree:read',
  'tree:create',
  'tree:update',
  'tree:delete',
  'tree:move',
  'qr:manage',
  'farm:settings',
  'report:view',
];

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  manager: MANAGER,
  worker: ['tree:read', 'tree:update'],
  viewer: ['tree:read'],
};

export const ROLE_LABEL: Record<UserRole, string> = {
  manager: 'Quản lý vườn',
  worker: 'Nhân công',
  viewer: 'Khách xem',
};
