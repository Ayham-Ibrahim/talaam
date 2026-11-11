import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { sessionQualityService } from '@/services/sessionQualityService';

export function useSessionQualityForStudent(token) {
  return useQuery({
    queryKey: queryKeys.sessionQuality.byToken(token),
    queryFn: () => sessionQualityService.getForStudent(token),
    enabled: !!token,
    retry: false,
  });
}

export function useSubmitSessionQuality(token) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => sessionQualityService.submit(token, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.sessionQuality.byToken(token) }),
  });
}

export function useAdminSessionQualityRatings(filters) {
  return useQuery({
    queryKey: queryKeys.sessionQuality.adminList(filters),
    queryFn: () => sessionQualityService.adminList(filters),
    keepPreviousData: true,
  });
}
