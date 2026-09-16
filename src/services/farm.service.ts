import { clone, mockCall } from './mock/db';
import { store } from './mock/store';
import type { BenchmarkInput, Farm, FarmSettingsInput } from '@/types';

export const farmService = {
  detail: (): Promise<Farm> => mockCall(() => clone(store.farm)),

  updateSettings: (input: FarmSettingsInput): Promise<Farm> =>
    mockCall(() => {
      store.farm = {
        ...store.farm,
        ...input,
        updatedAt: new Date().toISOString(),
      };
      return clone(store.farm);
    }),

  /** Mốc trắc địa lưu ở server — không phải localStorage riêng từng máy (03_DATABASE §4) */
  updateBenchmark: (input: BenchmarkInput): Promise<Farm> =>
    mockCall(() => {
      store.farm = {
        ...store.farm,
        benchmark: { ...store.farm.benchmark, ...input },
        updatedAt: new Date().toISOString(),
      };
      return clone(store.farm);
    }),
};
