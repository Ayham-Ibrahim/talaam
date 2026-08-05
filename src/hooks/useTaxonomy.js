import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { taxonomyService } from '@/services/taxonomyService';

/** Read-only taxonomy list for pickers (subjects, curricula, course fields...) */
export function useTaxonomyList(type) {
  return useQuery({
    queryKey: queryKeys.taxonomy(type),
    queryFn: () => taxonomyService.getItems(type),
    enabled: !!type,
    staleTime: 5 * 60 * 1000,
  });
}
