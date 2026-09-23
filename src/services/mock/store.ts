import type { Farm } from '@/types';
import { FARM_SEED } from './farm.seed';

/**
 * Kho dữ liệu mock trong bộ nhớ — chỉ còn phần vườn/bản đồ chưa có API
 * (`farmService.updateBenchmark`, `mapLayers`). Cây/lịch sử đã chuyển sang API thật (`trees.service.ts`).
 */
export const store = {
  farm: structuredClone(FARM_SEED) as Farm,
};

// HMR: sửa toạ độ trong farm.seed.ts thì vá thẳng cache React Query, không reload trang.
// Chỉ chạy ở dev — bundle production không có import.meta.hot.
if (import.meta.hot) {
  import.meta.hot.accept(['./farm.seed'], async ([farmMod]) => {
    if (!farmMod) return;
    const { queryClient } = await import('@/app/query-client');
    const { farmKeys } = await import('@/services/query-keys');

    const mapLayers = structuredClone(farmMod.FARM_SEED.mapLayers);
    store.farm = { ...store.farm, mapLayers };
    // Giữ nguyên các field farm lấy từ API, chỉ thay bản vẽ
    queryClient.setQueryData(farmKeys.detail(), (old: Farm | undefined) =>
      old ? { ...old, mapLayers } : old,
    );
  });
}
