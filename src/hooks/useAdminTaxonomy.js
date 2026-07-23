import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { adminTaxonomyService } from '@/services/adminTaxonomyService';

export function useTaxonomyItems(type) {
  return useQuery({
    queryKey: queryKeys.admin.taxonomy(type),
    queryFn: () => adminTaxonomyService.getItems(type),
    enabled: !!type,
  });
}

function useInvalidateTaxonomy(type) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.taxonomy(type) });
}

export function useCreateTaxonomyItem(type) {
  const invalidate = useInvalidateTaxonomy(type);
  return useMutation({
    mutationFn: (payload) => adminTaxonomyService.createItem(type, payload),
    onSuccess: invalidate,
  });
}

export function useUpdateTaxonomyItem(type) {
  const invalidate = useInvalidateTaxonomy(type);
  return useMutation({
    mutationFn: ({ id, payload }) => adminTaxonomyService.updateItem(type, id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteTaxonomyItem(type) {
  const invalidate = useInvalidateTaxonomy(type);
  return useMutation({
    mutationFn: (id) => adminTaxonomyService.deleteItem(type, id),
    onSuccess: invalidate,
  });
}
