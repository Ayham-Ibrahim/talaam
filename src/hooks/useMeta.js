import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { packageService, reviewService, bookingService, metaService } from '@/services';

export function usePackages(teacherId) {
  return useQuery({
    queryKey: queryKeys.teachers.packages(teacherId),
    queryFn: () => packageService.getByTeacher(teacherId),
    enabled: !!teacherId,
  });
}

export function useReviews(teacherId) {
  return useQuery({
    queryKey: queryKeys.teachers.reviews(teacherId),
    queryFn: () => reviewService.getByTeacher(teacherId),
    enabled: !!teacherId,
  });
}

export function useRatingSummary(teacherId) {
  return useQuery({
    queryKey: queryKeys.teachers.ratingSummary(teacherId),
    queryFn: () => reviewService.getRatingSummary(teacherId),
    enabled: !!teacherId,
  });
}

export function useAvailability(teacherId, date) {
  return useQuery({
    queryKey: queryKeys.teachers.availability(teacherId, date),
    queryFn: () => bookingService.getAvailability(teacherId, date),
    enabled: !!teacherId && !!date,
  });
}

export function useFilters() {
  return useQuery({
    queryKey: queryKeys.meta.filters(),
    queryFn: () => metaService.getFilters(),
    staleTime: 30 * 60 * 1000,
  });
}

export function useStats() {
  return useQuery({
    queryKey: queryKeys.meta.stats(),
    queryFn: () => metaService.getStats(),
    staleTime: 10 * 60 * 1000,
  });
}
