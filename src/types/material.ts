export type MaterialType =
  | 'fertilizer'
  | 'pesticide'
  | 'fungicide'
  | 'herbicide'
  | 'stimulant'
  | 'variety'
  | 'other';

/** GET /materials — `unitPrice` bị BE cắt hẳn với worker/viewer (04_API D9) */
export interface Material {
  id: string;
  code: string;
  name: string;
  type: MaterialType;
  unit: string;
  unitPrice?: number | null;
  active: boolean;
  notes?: string;
  updatedAt: string;
  createdAt: string;
}

export interface MaterialFilters {
  q?: string;
  type?: MaterialType;
  /** Mặc định BE chỉ trả vật tư đang dùng */
  active?: 'true' | 'false' | 'all';
}

export interface MaterialInput {
  code: string;
  name: string;
  type: MaterialType;
  unit: string;
  unitPrice?: number | null;
  active: boolean;
  notes?: string;
}
