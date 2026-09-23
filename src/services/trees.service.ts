import { http } from './http';
import { FARM_ID } from './mock/farm.seed';
import type {
  ActivityFilters,
  CreateTreeInput,
  HistoryRecord,
  Tree,
  TreeFilters,
  TreeLocation,
  UpdateTreePositionInput,
  UpdateTreeProfileInput,
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

/** GET/POST /trees — item phẳng: bedName/moundNumber/mapPosition nằm ngoài location */
interface TreeApiItem extends Omit<Tree, 'farmId' | 'location' | 'gallery' | 'createdAt'> {
  location: Omit<TreeLocation, 'mapPoint' | 'bedName' | 'moundNumber'>;
  mapPosition?: XY | null;
  bedName?: string | null;
  moundNumber?: string | null;
  /** Chỉ GET /trees/:code (chi tiết) trả — GET /trees (danh sách) không có, để nhẹ payload (04_API §1) */
  gallery?: string[];
}

function toTree({ mapPosition, bedName, moundNumber, gallery, ...item }: TreeApiItem): Tree {
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
    gallery: gallery ?? (item.image ? [item.image] : []),
    createdAt: item.plantedDate,
  };
}

/** BE có thể trả {item} hoặc tree phẳng — nhận cả hai */
async function fetchTree(path: string, init?: RequestInit): Promise<Tree> {
  const response = await http<{ item?: TreeApiItem } & TreeApiItem>(path, init);
  return toTree(response.item ?? response);
}

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

  /** GET /trees/:code — chi tiết cây, kèm gallery (luồng quét QR — 04_API §1) */
  detail: (code: string): Promise<Tree> => fetchTree('/trees/' + code),

  /** GET /trees/:code/history — timeline một cây (04_API §1) */
  history: async (code: string): Promise<HistoryRecord[]> => {
    const { items } = await http<{ items: HistoryRecord[] }>('/trees/' + code + '/history');
    return items;
  },

  /** GET /activity — nhật ký toàn vườn, sort occurredAt DESC (04_API §1, §6.10) */
  activity: async (filters: ActivityFilters = {}): Promise<HistoryRecord[]> => {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.type) params.set('type', filters.type);
    const query = params.toString();
    const { items } = await http<{ items: HistoryRecord[] }>(
      '/activity' + (query ? '?' + query : ''),
    );
    // Sort lại phía client bằng timestamp ISO — phòng khi API chưa sort đúng (05_FRONTEND §6.10)
    return [...items].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  },

  /** POST /trees — BE tự sinh `code`, client không gửi lên (09_DECISIONS D3) */
  create: (input: CreateTreeInput): Promise<Tree> =>
    fetchTree('/trees', { method: 'POST', body: JSON.stringify(input) }),

  /** PATCH /trees/:code — sửa hồ sơ cây (giống/ngày trồng/vị trí lô...), KHÔNG phải ghi cập nhật tình trạng */
  update: (code: string, input: UpdateTreeProfileInput): Promise<Tree> =>
    fetchTree('/trees/' + code, { method: 'PATCH', body: JSON.stringify(input) }),

  /** DELETE /trees/:code — chỉ `manager` (01_REQUIREMENTS §3.3) */
  remove: (code: string): Promise<void> =>
    http<void>('/trees/' + code, { method: 'DELETE' }),

  /** PATCH /trees/:code/position — kéo-thả bản đồ, giai đoạn 2, chỉ `manager` (08_AI_RULES §10) */
  updatePosition: (code: string, input: UpdateTreePositionInput): Promise<Tree> =>
    fetchTree('/trees/' + code + '/position', { method: 'PATCH', body: JSON.stringify(input) }),

  /**
   * POST /trees/:code/history — ghi cập nhật tình trạng (04_API §2, §2a).
   * BE tính healthScore/activity, ghi tree_history, snapshot vật tư, chống ghi trùng bằng clientRequestId.
   * Response trả envelope riêng { record, tree } (khác {item}/tree phẳng của fetchTree) — cây đã
   * cập nhật nằm ở `tree`, không phải `item` (nhầm chỗ này khiến toTree() crash dù BE đã lưu thành công).
   */
  addUpdate: async (code: string, input: UpdateInput): Promise<Tree> => {
    const { tree } = await http<{ record: HistoryRecord; tree: TreeApiItem }>(
      '/trees/' + code + '/history',
      { method: 'POST', body: JSON.stringify(input) },
    );
    return toTree(tree);
  },
};
