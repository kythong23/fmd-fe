import { useMutation, useQueryClient } from '@tanstack/react-query';
import { treesService } from '@/services/trees.service';
import { activityKeys, treeKeys } from '@/services/query-keys';
import type { UpdateInput } from '@/types';

/** Sau mutation chỉ invalidate theo key — không tự set state thủ công (05_FRONTEND §7) */
export function useAddTreeUpdate(code: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateInput) => treesService.addUpdate(code, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: treeKeys.all });
      queryClient.invalidateQueries({ queryKey: activityKeys.all });
    },
  });
}
