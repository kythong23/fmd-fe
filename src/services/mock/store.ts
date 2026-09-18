import type { Farm, HistoryRecord, Tree } from '@/types';
import { FARM_SEED } from './farm.seed';
import { HISTORY_SEED, TREES_SEED } from './trees.seed';

/**
 * Kho dữ liệu mock trong bộ nhớ — thay cho DB khi chưa có BE.
 * Chỉ services/ được chạm vào; component không biết nó tồn tại.
 */
export const store = {
  farm: structuredClone(FARM_SEED) as Farm,
  trees: structuredClone(TREES_SEED) as Tree[],
  history: structuredClone(HISTORY_SEED) as HistoryRecord[],
  /** clientRequestId đã ghi — chống tạo trùng khi bấm Lưu nhiều lần (04_API §2) */
  processedRequests: new Map<string, HistoryRecord>(),
};

export function nextTreeCode(): string {
  // Mô phỏng BE sinh mã: lấy số lớn nhất + 1, không dùng trees.length (xoá cây là trùng mã)
  const maxNumber = store.trees.reduce((max, tree) => {
    const value = Number.parseInt(tree.code.replace(/\D/g, ''), 10);
    return Number.isNaN(value) ? max : Math.max(max, value);
  }, 0);
  return 'SD-' + String(maxNumber + 1).padStart(3, '0');
}

// HMR: sửa toạ độ trong *.seed.ts thì vá thẳng cache React Query, không reload trang.
// Chỉ chạy ở dev — bundle production không có import.meta.hot.
if (import.meta.hot) {
  import.meta.hot.accept(['./farm.seed', './trees.seed'], async ([farmMod, treesMod]) => {
    const { queryClient } = await import('@/app/query-client');
    const { farmKeys, treeKeys } = await import('@/services/query-keys');

    if (farmMod) {
      const mapLayers = structuredClone(farmMod.FARM_SEED.mapLayers);
      store.farm = { ...store.farm, mapLayers };
      // Giữ nguyên các field farm lấy từ API, chỉ thay bản vẽ
      queryClient.setQueryData(farmKeys.detail(), (old: Farm | undefined) =>
        old ? { ...old, mapLayers } : old,
      );
    }
    if (treesMod) {
      store.trees = structuredClone(treesMod.TREES_SEED);
      store.history = structuredClone(treesMod.HISTORY_SEED);
      await queryClient.invalidateQueries({ queryKey: treeKeys.all });
    }
  });
}
