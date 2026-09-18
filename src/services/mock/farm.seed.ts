import type { Farm, MapAnchor } from '@/types';

export const FARM_ID = 'farm-0001';

/**
 * 2 điểm mốc neo ảnh nền: biết cả lat/lng lẫn pixel trên bản vẽ 1024×512.
 * utils/geo.ts dùng đúng 2 điểm này để quy đổi (05_FRONTEND §6.7).
 */
export const MAP_ANCHORS: MapAnchor[] = [
  {
    id: 'M1',
    label: 'Mốc góc Tây Bắc',
    latLng: { lat: 10.462, lng: 107.215 },
    xy: { x: 247, y: 92 },
  },
  {
    id: 'M4',
    label: 'Mốc góc Đông Nam',
    latLng: { lat: 10.4588, lng: 107.2185 },
    xy: { x: 812, y: 300 },
  },
];

export const FARM_SEED: Farm = {
  id: FARM_ID,
  name: 'Durian Farm — Nông trại Sầu riêng Thông minh',
  techLead: 'Lê Văn Thái',
  estimatedTreeCount: 120,
  publicViewEnabled: false,
  offlineSyncEnabled: false,
  benchmark: {
    code: 'M0-TT',
    name: 'Mốc trắc địa trung tâm vườn',
    plotNumber: 'Thửa 35, Tờ 24',
    address: 'Phường Hàng Gòn, TP. Long Khánh, tỉnh Đồng Nai',
    lat: 10.8734664,
    lng: 107.2065857,
    elevationMeters: 42.5,
    datum: 'VN-2000 / WGS-84',
    zone: 'Kinh tuyến trục 107°45′',
    source: 'default',
    updatedAt: '2026-09-01T02:00:00.000Z',
  },
  mapLayers: {
    viewBox: { width: 1024, height: 512 },
    boundary: {
      id: 'boundary',
      label: 'Ranh giới thửa đất (Theo ảnh vệ tinh)',
      points: [
        // Cạnh Bắc: một nét thẳng dài chạy xiên lên phía Đông
        { x: 243, y: 93 },
        { x: 812, y: 9 },
        // Cạnh Đông gần như thẳng đứng, hơi nghiêng vào trong
        { x: 806, y: 128 },
        { x: 797, y: 205 },
        { x: 790, y: 248 },
        // Góc Đông Nam vát chéo
        { x: 742, y: 272 },
        { x: 690, y: 282 },
        // Cạnh Nam thẳng, chỉ gãy nhẹ ở giữa
        { x: 470, y: 301 },
        { x: 262, y: 318 },
        // Cạnh Tây gấp bậc
        { x: 247, y: 262 },
        { x: 224, y: 243 },
        { x: 214, y: 205 },
        { x: 224, y: 158 },
      ],
    },
    beds: [],
    canals: [],
    roads: [
      {
        id: 'road-north',
        label: 'Đường nhánh phía Bắc',
        width: 11,
        points: [
          { x: 690, y: -10 },
          { x: 742, y: 6 },
          { x: 788, y: 24 },
          { x: 815, y: 44 },
        ],
      },
      {
        id: 'road-east',
        label: 'Đường trục chính phía Đông',
        width: 12,
        points: [
          { x: 815, y: 44 },
          { x: 824, y: 120 },
          { x: 820, y: 205 },
          { x: 806, y: 262 },
          { x: 792, y: 300 },
        ],
      },
      {
        id: 'road-east-spur',
        label: 'Đường rẽ khu dân cư Đông Bắc',
        width: 9,
        points: [
          { x: 818, y: 62 },
          { x: 880, y: 48 },
          { x: 950, y: 36 },
          { x: 1034, y: 28 },
        ],
      },
      {
        id: 'road-south',
        label: 'Đường liên ấp Đli Thái Thiên',
        width: 12,
        points: [
          { x: 792, y: 300 },
          { x: 700, y: 292 },
          { x: 600, y: 296 },
          { x: 500, y: 304 },
          { x: 400, y: 312 },
          { x: 300, y: 320 },
          { x: 258, y: 330 },
          { x: 195, y: 322 },
          { x: 110, y: 306 },
          { x: -10, y: 288 },
        ],
      },
      {
        id: 'road-west-branch',
        label: 'Nhánh đường phía Tây Nam',
        width: 11,
        points: [
          { x: 222, y: 326 },
          { x: 243, y: 372 },
          { x: 258, y: 420 },
          { x: 266, y: 466 },
        ],
      },
      {
        id: 'road-center-south',
        label: 'Đường nhánh giữa phía Nam',
        width: 12,
        points: [
          { x: 452, y: 308 },
          { x: 456, y: 380 },
          { x: 452, y: 445 },
          { x: 448, y: 522 },
        ],
      },
      {
        id: 'road-southwest-leg',
        label: 'Đường rẽ Tây Nam ngã ba',
        width: 11,
        points: [
          { x: 792, y: 300 },
          { x: 760, y: 352 },
          { x: 732, y: 412 },
          { x: 716, y: 470 },
          { x: 712, y: 522 },
        ],
      },
      {
        id: 'road-southeast-leg',
        label: 'Đường rẽ Đông Nam ngã ba',
        width: 11,
        points: [
          { x: 792, y: 300 },
          { x: 852, y: 342 },
          { x: 920, y: 392 },
          { x: 986, y: 448 },
          { x: 1034, y: 492 },
        ],
      },
    ],
    reservoir: null,
    facilities: [
      {
        id: 'warehouse',
        label: 'Nhà chính / Kho xưởng',
        kind: 'warehouse',
        position: { x: 487, y: 73 },
        width: 148,
        height: 30,
        rotation: -5,
      },
      {
        id: 'residence',
        label: 'Nhà ở gia đình',
        kind: 'office',
        position: { x: 752, y: 112 },
        width: 58,
        height: 28,
        rotation: -4,
      },
      {
        id: 'store',
        label: 'Kho kỹ thuật',
        kind: 'store',
        position: { x: 606, y: 117 },
        width: 30,
        height: 22,
      },
      {
        id: 'gate',
        label: 'Cổng chính',
        kind: 'gate',
        position: { x: 452, y: 306 },
      },
    ],
    anchors: MAP_ANCHORS,
  },
  updatedAt: '2026-09-01T02:00:00.000Z',
};
