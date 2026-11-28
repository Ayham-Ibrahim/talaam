import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { availabilityService } from '@/services';

export function useAvailabilityDays(teacherId) {
  return useQuery({
    queryKey: queryKeys.teachers.availabilitySlots(teacherId),
    queryFn: () => availabilityService.getByTeacher(teacherId),
    enabled: !!teacherId,
  });
}

export function useAddAvailabilityDay(teacherId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dayOfWeek) => availabilityService.addDay(teacherId, dayOfWeek),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.teachers.availabilitySlots(teacherId) }),
  });
}

export function useRemoveAvailabilityDay(teacherId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slotId) => availabilityService.removeDay(teacherId, slotId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.teachers.availabilitySlots(teacherId) }),
  });
}

export function useAvailabilityTimes(teacherId) {
  return useQuery({
    queryKey: queryKeys.teachers.availabilityTimes(teacherId),
    queryFn: () => availabilityService.getTimesByTeacher(teacherId),
    enabled: !!teacherId,
  });
}

export function useAddAvailabilityTime(teacherId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => availabilityService.addTime(teacherId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.teachers.availabilityTimes(teacherId) }),
  });
}

export function useRemoveAvailabilityTime(teacherId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (timeId) => availabilityService.removeTime(teacherId, timeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.teachers.availabilityTimes(teacherId) }),
  });
}
