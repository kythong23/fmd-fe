import type { TreeStatus } from './tree';

export type ActivityType =
  | 'health_check'
  | 'watering'
  | 'fertilizing'
  | 'spraying'
  | 'pruning'
  | 'treatment'
  | 'harvest';

export type PartTag =
  | 'leaf'
  | 'stem'
  | 'branch'
  | 'flower'
  | 'fruit'
  | 'pest'
  | 'soil'
  | 'other';

export type ActionTaken =
  | 'watering'
  | 'fertilizing'
  | 'spraying'
  | 'pruning'
  | 'treatment'
  | 'none';

export interface Measurements {
  height?: number;
  trunkDiameter?: number;
  soilMoisture?: number;
  fruitCount?: number;
}

/** Vật tư gửi lên khi ghi cập nhật — FE chỉ gửi materialId + quantity (04_API §2a) */
export interface MaterialUsageInput {
  materialId: string;
  quantity: number;
}

/** Snapshot vật tư đã dùng trong một bản ghi lịch sử — BE tự điền code/name/unit/unitPrice (09_DECISIONS D8) */
export interface MaterialUsageEntry {
  materialId: string;
  code: string;
  name: string;
  quantity: number;
  unit: string;
  /** Vắng mặt với worker/viewer — BE cắt hẳn, không phải FE ẩn (09_DECISIONS D9) */
  unitPrice?: number;
}

export interface HistoryRecord {
  id: string;
  treeId: string;
  treeCode: string;
  farmId: string;
  /** Một trường ISO 8601 duy nhất — không tách date + time (05_FRONTEND §12) */
  occurredAt: string;
  activity: string;
  type: ActivityType;
  status: TreeStatus | null;
  description: string;
  performer: string;
  dosage: string | null;
  measurements: Measurements | null;
  images: string[];
  conditions: PartTag[];
  actionTaken: ActionTaken | null;
  notes: string | null;
  /** Vật tư đã dùng — mặc định '[]', nguồn duy nhất để tính tiền ở /reports (09_DECISIONS D8) */
  materials: MaterialUsageEntry[];
}

/** Payload của POST /trees/:code/history (04_API §2) */
export interface UpdateInput {
  status: TreeStatus;
  conditions: PartTag[];
  description: string;
  images: string[];
  measurements: Measurements;
  actionTaken: ActionTaken;
  notes?: string;
  performer: string;
  /** Chống ghi trùng khi mất sóng bấm Lưu nhiều lần */
  clientRequestId: string;
  /** Rỗng hợp lệ — kiểm tra sức khoẻ không dùng vật tư gì (04_API §2a) */
  materials: MaterialUsageInput[];
}

export interface ActivityFilters {
  q?: string;
  type?: ActivityType;
}
