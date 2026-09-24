export type TreeStatus = 'healthy' | 'monitoring' | 'problem' | 'unknown';

export type TreeVariety =
  | 'Ri6'
  | 'Monthong (Dona)'
  | 'Musang King'
  | 'Black Thorn'
  | 'Chuồng Bò';

export type LeafCondition = 'good' | 'fair' | 'poor' | 'yellowing';

export type FruitCondition = 'developing' | 'blooming' | 'maturing' | 'harvested' | 'none';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface XY {
  x: number;
  y: number;
}

export interface TreeLocation {
  block: string;
  row: string;
  position: string;
  coordinates: LatLng | null;
  /** Pixel trên bản vẽ SVG — lớp hiển thị, dẫn xuất từ coordinates (09_DECISIONS D5) */
  mapPoint: XY | null;
  bedName: string | null;
  moundNumber: string | null;
}

export interface Tree {
  id: string;
  farmId: string;
  code: string;
  variety: TreeVariety;
  /** false = cây ảo: đã sinh mã QR nhưng chưa có ai nhập thông tin */
  activated: boolean;
  plantedDate: string;
  location: TreeLocation;
  canopyRadius: number | null;
  status: TreeStatus;
  healthScore: number;
  soilMoisture: number | null;
  leafCondition: LeafCondition | null;
  flowering: boolean;
  floweringStage: string | null;
  fruitCondition: FruitCondition | null;
  fruitCount: number | null;
  heightMeters: number | null;
  trunkDiameterCm: number | null;
  image: string | null;
  gallery: string[];
  notes: string | null;
  lastUpdated: string | null;
  lastUpdatedBy: string | null;
  createdAt: string;
}

export interface TreeFilters {
  q?: string;
  status?: TreeStatus;
  block?: string;
  activated?: boolean;
}

export interface CreateTreeInput {
  variety: TreeVariety;
  /** false = cây ảo: đã sinh mã QR nhưng chưa có ai nhập thông tin */
  activated: boolean;
  plantedDate: string;
  block: string;
  row: string;
  position: string;
  status: TreeStatus;
  notes?: string;
}

/**
 * Payload PATCH /trees/:code — sửa hồ sơ cây, không đổi tình trạng/lịch sử (04_API §1).
 * Không có `activated`: BE tự kích hoạt cây ảo ở lần PATCH đầu tiên.
 */
export interface UpdateTreeProfileInput {
  variety?: TreeVariety;
  plantedDate?: string;
  block?: string;
  row?: string;
  position?: string;
  bedName?: string;
  moundNumber?: string;
  notes?: string;
  /** Ảnh đại diện (URL từ POST /uploads) — khác ảnh tình trạng nằm trong từng bản ghi lịch sử */
  image?: string;
}

/** Payload PATCH /trees/:code/position — kéo-thả bản đồ, giai đoạn 2, chỉ `manager` */
export interface UpdateTreePositionInput {
  mapPosition: XY;
}
