import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { treesService } from '@/services/trees.service';
import { farmService } from '@/services/farm.service';
import { activityKeys, farmKeys, treeKeys } from '@/services/query-keys';
import type {
  ActivityFilters,
  BenchmarkInput,
  CreateTreeInput,
  FarmSettingsInput,
  TreeFilters,
  UpdateTreeProfileInput,
} from '@/types';

/**
 * Query hook dùng chung cho nhiều feature (dashboard, trees, map, qr, activity).
 * Đặt ở hooks/ để feature không phải import chéo feature (05_FRONTEND §2).
 */
export function useTrees(filters: TreeFilters = {}) {
  return useQuery({
    queryKey: treeKeys.list(filters),
    queryFn: () => treesService.list(filters),
  });
}

export function useTree(code: string) {
  return useQuery({
    queryKey: treeKeys.detail(code),
    queryFn: () => treesService.detail(code),
    enabled: Boolean(code),
    retry: false,
  });
}

export function useTreeHistory(code: string) {
  return useQuery({
    queryKey: treeKeys.history(code),
    queryFn: () => treesService.history(code),
    enabled: Boolean(code),
  });
}

export function useActivityFeed(filters: ActivityFilters = {}) {
  return useQuery({
    queryKey: activityKeys.list(filters),
    queryFn: () => treesService.activity(filters),
  });
}

export function useFarm() {
  return useQuery({ queryKey: farmKeys.detail(), queryFn: () => farmService.detail() });
}

export function useCreateTree() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTreeInput) => treesService.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: treeKeys.all }),
  });
}

/** PATCH /trees/:code — sửa hồ sơ; lần đầu PATCH cây ảo thì BE kích hoạt luôn */
export function useUpdateTreeProfile(code: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateTreeProfileInput) => treesService.update(code, input),
    onSuccess: (tree) => {
      queryClient.setQueryData(treeKeys.detail(code), tree);
      return queryClient.invalidateQueries({ queryKey: treeKeys.all });
    },
  });
}

export function useUpdateFarmSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: FarmSettingsInput) => farmService.updateSettings(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: farmKeys.all }),
  });
}

/** Sinh/xoá mã QR theo số cây khai — đổi cả farm (estimatedTreeCount) lẫn danh sách cây */
export function useProvisionTrees() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (estimatedTreeCount: number) => farmService.provisionTrees(estimatedTreeCount),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: farmKeys.all }),
        queryClient.invalidateQueries({ queryKey: treeKeys.all }),
      ]),
  });
}

export function useUpdateBenchmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BenchmarkInput) => farmService.updateBenchmark(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: farmKeys.all }),
  });
}
