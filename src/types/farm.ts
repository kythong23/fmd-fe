import type { LatLng, XY } from './tree';

export type BenchmarkSource = 'google' | 'manual' | 'gps_device' | 'default';

export interface CadastralBenchmark {
  code: string;
  name: string;
  lat: number;
  lng: number;
  elevationMeters: number | null;
  datum: string;
  zone: string;
  source: BenchmarkSource;
}

/** Điểm mốc biết cả lat/lng lẫn pixel trên ảnh nền — đầu vào của utils/geo.ts */
export interface MapAnchor {
  id: string;
  label: string;
  latLng: LatLng;
  xy: XY;
}

export interface MapPolygon {
  id: string;
  label: string;
  points: XY[];
}

export interface MapPath {
  id: string;
  label: string;
  points: XY[];
  width: number;
}

export interface MapFacility {
  id: string;
  label: string;
  position: XY;
  kind: string;
}

export interface MapLayers {
  viewBox: { width: number; height: number };
  boundary: MapPolygon;
  beds: MapPolygon[];
  canals: MapPath[];
  roads: MapPath[];
  reservoir: MapPolygon | null;
  facilities: MapFacility[];
  anchors: MapAnchor[];
}

export interface Farm {
  id: string;
  name: string;
  techLead: string;
  offlineSyncEnabled: boolean;
  plotNumber: string;
  address: string;
  benchmark: CadastralBenchmark;
  mapLayers: MapLayers;
  updatedAt: string;
}

export interface FarmSettingsInput {
  name: string;
  techLead: string;
  offlineSyncEnabled: boolean;
}

export type BenchmarkInput = Pick<
  CadastralBenchmark,
  'lat' | 'lng' | 'code' | 'name' | 'source'
>;
