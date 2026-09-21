import { useMutation, useQueryClient } from '@tanstack/react-query';
import { materialsService } from '@/services/materials.service';
import { materialKeys } from '@/services/query-keys';
import type { MaterialInput } from '@/types';

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: materialKeys.all });
}

export function useCreateMaterial() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: MaterialInput) => materialsService.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdateMaterial() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<MaterialInput> }) =>
      materialsService.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteMaterial() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => materialsService.remove(id),
    onSuccess: invalidate,
  });
}
