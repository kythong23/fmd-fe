import { http } from './http';
import { clone, mockCall } from './mock/db';
import { nextTreeCode, store } from './mock/store';
import { FARM_ID } from './mock/farm.seed';
import { computeHealthScore } from '@/utils/health-score';
import { latLngToXY } from '@/utils/geo';
import type {
  ActivityFilters,
  CreateTreeInput,
  HistoryRecord,
  Tree,
  TreeFilters,
  TreeLocation,
  XY,
  UpdateInput,
} from '@/types';

function matchesFilters(tree: Tree, filters: TreeFilters): boolean {
  if (filters.status && tree.status !== filters.status) return false;
  if (filters.block && tree.location.block !== filters.block) return false;
  if (filters.activated !== undefined && tree.activated !== filters.activated) return false;
  if (filters.q) {
    const needle = filters.q.trim().toLowerCase();
    const haystack = (tree.code + ' ' + tree.variety + ' ' + tree.location.block).toLowerCase();
    if (!haystack.includes(needle)) return false;
  }
  return true;
}

/** GET /trees — item phẳng: bedName/moundNumber/mapPosition nằm ngoài location */
interface TreeApiItem extends Omit<Tree, 'farmId' | 'location' | 'gallery' | 'createdAt'> {
  location: Omit<TreeLocation, 'mapPoint' | 'bedName' | 'moundNumber'>;
  mapPosition?: XY | null;
  bedName?: string | null;
  moundNumber?: string | null;
}

function toTree({ mapPosition, bedName, moundNumber, ...item }: TreeApiItem): Tree {
  // Toạ độ lấy 100% từ API — không còn fallback về seed cục bộ
  return {
    ...item,
    farmId: FARM_ID,
    location: {
      ...item.location,
      coordinates: item.location.coordinates ?? null,
      mapPoint: mapPosition ?? null,
      bedName: bedName ?? null,
      moundNumber: moundNumber ?? null,
    },
    gallery: item.image ? [item.image] : [],
    createdAt: item.plantedDate,
  };
}

/** BE có thể trả {item} hoặc tree phẳng — nhận cả hai */
async function fetchTree(path: string, init?: RequestInit): Promise<Tree> {
  const response = await http<{ item?: TreeApiItem } & TreeApiItem>(path, init);
  return toTree(response.item ?? response);
}

function historyOf(code: string): HistoryRecord[] {
  return store.history
    .filter((record) => record.treeCode === code)
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}

/**
 * Component KHÔNG BIẾT dữ liệu đến từ mock hay API.
 * Khi có BE: thay thân hàm bằng http<T>(...), giữ nguyên signature (05_FRONTEND §13).
 */
export const treesService = {
  list: async (filters: TreeFilters = {}): Promise<Tree[]> => {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.status) params.set('status', filters.status);
    if (filters.block) params.set('block', filters.block);
    if (filters.activated !== undefined) params.set('activated', String(filters.activated));
    const query = params.toString();
    const { items } = await http<{ success: boolean; items: TreeApiItem[] }>(
      '/trees' + (query ? '?' + query : ''),
    );
    // Lọc lại phía client: API có thể chưa hỗ trợ đủ tham số lọc
    return items.map(toTree).filter((tree) => matchesFilters(tree, filters));
  },

  detail: (code: string): Promise<Tree> => fetchTree('/trees/' + code),

  history: (code: string): Promise<HistoryRecord[]> => mockCall(() => clone(historyOf(code))),

  activity: (filters: ActivityFilters = {}): Promise<HistoryRecord[]> =>
    mockCall(() => {
      const needle = filters.q?.trim().toLowerCase();
      return clone(
        store.history
          .filter((record) => {
            if (filters.type && record.type !== filters.type) return false;
            if (!needle) return true;
            const haystack = (
              record.treeCode +
              ' ' +
              record.activity +
              ' ' +
              record.description +
              ' ' +
              record.performer
            ).toLowerCase();
            return haystack.includes(needle);
          })
          // Sort bằng timestamp ISO, không bằng id (05_FRONTEND §6.10)
          .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)),
      );
    }),

  create: (input: CreateTreeInput): Promise<Tree> =>
    mockCall(() => {
      const code = nextTreeCode();
      const now = new Date().toISOString();
      const coordinates = store.farm.benchmark
        ? { lat: store.farm.benchmark.lat, lng: store.farm.benchmark.lng }
        : null;
      const tree: Tree = {
        id: 'tree-' + code,
        farmId: FARM_ID,
        code,
        variety: input.variety,
        activated: true,
        plantedDate: input.plantedDate,
        location: {
          block: input.block,
          row: input.row,
          position: input.position,
          coordinates,
          mapPoint: coordinates ? latLngToXY(coordinates, store.farm.mapLayers.anchors) : null,
          bedName: null,
          moundNumber: null,
        },
        canopyRadius: null,
        status: input.status,
        healthScore: computeHealthScore(input.status, 80),
        soilMoisture: null,
        leafCondition: null,
        flowering: false,
        floweringStage: null,
        fruitCondition: null,
        fruitCount: null,
        heightMeters: null,
        trunkDiameterCm: null,
        image: null,
        gallery: [],
        notes: input.notes ?? null,
        lastUpdated: now,
        lastUpdatedBy: null,
        createdAt: now,
      };
      store.trees.push(tree);
      store.history.push({
        id: code + '-h01',
        treeId: tree.id,
        treeCode: code,
        farmId: FARM_ID,
        occurredAt: now,
        activity: 'Gắn thẻ QR & khởi tạo hồ sơ cây',
        type: 'health_check',
        status: input.status,
        description: 'Khởi tạo hồ sơ cây và sinh mã QR.',
        performer: 'Hệ thống',
        dosage: null,
        measurements: null,
        images: [],
        conditions: [],
        actionTaken: 'none',
        notes: null,
      });
      return clone(tree);
    }),

  /**
   * PATCH /trees/:code — lưu cập nhật hồ sơ cây (API thật).
   * healthScore/activity do backend tính; client chỉ gửi dữ liệu nhập.
   */
  addUpdate: (code: string, input: UpdateInput): Promise<Tree> =>
    fetchTree('/trees/' + code, { method: 'PATCH', body: JSON.stringify(input) }),
};
