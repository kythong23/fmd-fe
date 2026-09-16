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
}

export interface ActivityFilters {
  q?: string;
  type?: ActivityType;
}
