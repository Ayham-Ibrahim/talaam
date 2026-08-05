import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { favoriteService } from '@/services';
import { useAuth } from '@/hooks/useAuth';

/** Only fetched for logged-in students — the backend endpoint requires auth */
export function useFavorites() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.favorites.list(),
    queryFn: () => favoriteService.getFavorites(),
    enabled: isAuthenticated,
  });
}

export function useToggleFavoriteTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teacherId) => favoriteService.toggleTeacher(teacherId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.favorites.list() }),
  });
}

export function useToggleFavoriteCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId) => favoriteService.toggleCourse(courseId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.favorites.list() }),
  });
}
