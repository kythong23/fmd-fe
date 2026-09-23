import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { materialsService } from '@/services/materials.service';
import { materialKeys } from '@/services/query-keys';
import type { MaterialInput } from '@/types';

/** Danh mục vật tư đang dùng — nguồn cho picker ở form cập nhật (05_FRONTEND §6.6) */
export function useActiveMaterials() {
  return useQuery({
    queryKey: materialKeys.list({ active: 'true' }),
    queryFn: () => materialsService.list({ active: 'true' }),
  });
}

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
