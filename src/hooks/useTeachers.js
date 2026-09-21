import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { teacherService } from '@/services/teacherService';

const RESULTS_PER_PAGE = 12;

export function useTeachers(filters = {}) {
  return useQuery({
    queryKey: queryKeys.teachers.list(filters),
    queryFn: () => teacherService.getTeachers(filters),
    keepPreviousData: true,
  });
}

/**
 * Infinite-scroll variant for the sidebar-filter pages (SearchPage,
 * TeachingTypePage) — `filters` must NOT include `page`/`perPage`, those are
 * owned by react-query's pageParam here. Backend pagination already exists
 * (TeacherSearchController's paginate()); this just drives it page by page
 * as the user scrolls instead of fetching everything at once.
 */
export function useInfiniteTeachers(filters = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.teachers.infiniteList(filters),
    queryFn: ({ pageParam }) => teacherService.getTeachers({ ...filters, page: pageParam, perPage: RESULTS_PER_PAGE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.currentPage < lastPage.lastPage ? lastPage.currentPage + 1 : undefined),
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
