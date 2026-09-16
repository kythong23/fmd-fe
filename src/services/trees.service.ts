import { appError } from './http';
import { clone, mockCall } from './mock/db';
import { nextTreeCode, store } from './mock/store';
import { activityLabelFor, activityTypeFor } from './mock/trees.seed';
import { FARM_ID } from './mock/farm.seed';
import { computeHealthScore } from '@/utils/health-score';
import { latLngToXY } from '@/utils/geo';
import type {
  ActivityFilters,
  CreateTreeInput,
  HistoryRecord,
  Tree,
  TreeFilters,
  UpdateInput,
} from '@/types';

function matchesFilters(tree: Tree, filters: TreeFilters): boolean {
  if (filters.status && tree.status !== filters.status) return false;
  if (filters.block && tree.location.block !== filters.block) return false;
  if (filters.q) {
    const needle = filters.q.trim().toLowerCase();
    const haystack = (tree.code + ' ' + tree.variety + ' ' + tree.location.block).toLowerCase();
    if (!haystack.includes(needle)) return false;
  }
  return true;
}

function findTree(code: string): Tree {
  const tree = store.trees.find((item) => item.code === code);
  if (!tree) {
    throw appError('NOT_FOUND', { message: 'Không tìm thấy cây mã ' + code });
  }
  return tree;
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
  list: (filters: TreeFilters = {}): Promise<Tree[]> =>
    mockCall(() => clone(store.trees.filter((tree) => matchesFilters(tree, filters)))),

  detail: (code: string): Promise<Tree> => mockCall(() => clone(findTree(code))),

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
   * POST /trees/:code/history — nghiệp vụ lõi (04_API §2).
   * healthScore và activity do "backend" tính; client không gửi điểm lên.
   */
  addUpdate: (code: string, input: UpdateInput): Promise<Tree> =>
    mockCall(() => {
      const existing = store.processedRequests.get(input.clientRequestId);
      if (existing) return clone(findTree(code));

      const tree = findTree(code);
      const now = new Date().toISOString();
      const record: HistoryRecord = {
        id: code + '-h' + (historyOf(code).length + 1),
        treeId: tree.id,
        treeCode: code,
        farmId: tree.farmId,
        occurredAt: now,
        activity: activityLabelFor(input.actionTaken),
        type: activityTypeFor(input.actionTaken),
        status: input.status,
        description: input.description,
        performer: input.performer,
        dosage: null,
        measurements: input.measurements,
        images: input.images,
        conditions: input.conditions,
        actionTaken: input.actionTaken,
        notes: input.notes ?? null,
      };
      store.history.push(record);
      store.processedRequests.set(input.clientRequestId, record);

      tree.status = input.status;
      tree.healthScore = computeHealthScore(input.status, tree.healthScore);
      if (input.measurements.height !== undefined) tree.heightMeters = input.measurements.height;
      if (input.measurements.trunkDiameter !== undefined) {
        tree.trunkDiameterCm = input.measurements.trunkDiameter;
      }
      if (input.measurements.soilMoisture !== undefined) {
        tree.soilMoisture = input.measurements.soilMoisture;
      }
      if (input.measurements.fruitCount !== undefined) {
        tree.fruitCount = input.measurements.fruitCount;
      }
      if (input.images.length > 0) {
        tree.image = input.images[0];
        tree.gallery = [...tree.gallery, ...input.images];
      }
      tree.lastUpdated = now;
      tree.lastUpdatedBy = input.performer;

      return clone(tree);
    }),
};
