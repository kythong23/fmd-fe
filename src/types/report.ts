import type { ActivityType } from './history';
import type { MaterialType } from './material';

/** Query của GET /reports/summary — `to` là **exclusive** (04_API §2c) */
export interface ReportFilters {
  from: string;
  to: string;
  block?: string;
  type?: MaterialType;
}

export interface ReportMaterialRow {
  materialId: string;
  code: string;
  name: string;
  /** null khi vật tư đã bị xóa khỏi danh mục — snapshot trong lịch sử vẫn còn (D8) */
  type: MaterialType | null;
  unit: string;
  quantity: number;
  cost: number;
  /** Có lần dùng chưa có đơn giá → cost thiếu, không phải 0 đ thật */
  missingPrice?: boolean;
}

/** GET /reports/summary — chỉ `manager` (D9) */
export interface ReportSummary {
  range: { from: string; to: string };
  totalCost: number;
  byMaterial: ReportMaterialRow[];
  byType: { type: MaterialType; cost: number }[];
  byBlock: { block: string; cost: number; activityCount: number }[];
  byActivity: { type: ActivityType; count: number }[];
  coverage: { historyCount: number; withMaterialsCount: number };
}
