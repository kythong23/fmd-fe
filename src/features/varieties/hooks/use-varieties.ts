import { useMutation, useQueryClient } from '@tanstack/react-query';
import { varietiesService } from '@/services/varieties.service';
import { varietyKeys } from '@/services/query-keys';
import type { VarietyInput } from '@/types';

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: varietyKeys.all });
}

export function useCreateVariety() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: VarietyInput) => varietiesService.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdateVariety() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<VarietyInput> }) =>
      varietiesService.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteVariety() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => varietiesService.remove(id),
    onSuccess: invalidate,
  });
}
