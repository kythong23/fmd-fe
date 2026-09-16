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
}

export interface CreateTreeInput {
  variety: TreeVariety;
  plantedDate: string;
  block: string;
  row: string;
  position: string;
  status: TreeStatus;
  notes?: string;
}
