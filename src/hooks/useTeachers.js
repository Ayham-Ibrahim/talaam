import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { teacherService } from '@/services/teacherService';

export function useTeachers(filters = {}) {
  return useQuery({
    queryKey: queryKeys.teachers.list(filters),
    queryFn: () => teacherService.getTeachers(filters),
    keepPreviousData: true,
  });
}

export function useFeaturedTeachers() {
  return useQuery({
    queryKey: queryKeys.teachers.featured(),
    queryFn: () => teacherService.getFeatured(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTeacher(id) {
  return useQuery({
    queryKey: queryKeys.teachers.detail(id),
    queryFn: () => teacherService.getTeacherById(id),
    enabled: !!id,
  });
}
