/** GET /varieties — danh mục giống cây đang dùng trong vườn, kèm giá giống */
export interface Variety {
  id: string;
  name: string;
  unitPrice?: number | null;
  active: boolean;
  notes?: string;
  updatedAt: string;
  createdAt: string;
}

export interface VarietyFilters {
  q?: string;
  /** Mặc định BE chỉ trả giống đang dùng */
  active?: 'true' | 'false' | 'all';
}

export interface VarietyInput {
  name: string;
  unitPrice?: number | null;
  active: boolean;
  notes?: string;
}
