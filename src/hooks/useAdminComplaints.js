import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { adminComplaintsService } from '@/services/adminComplaintsService';

export function useAdminComplaints(filters = {}) {
  return useQuery({
    queryKey: queryKeys.admin.complaints(filters),
    queryFn: () => adminComplaintsService.getComplaints(filters),
    keepPreviousData: true,
  });
}

function useInvalidateComplaints() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.overview() });
    queryClient.invalidateQueries({ queryKey: ['admin', 'complaints'] });
  };
}

export function useResolveComplaint() {
  const invalidate = useInvalidateComplaints();
  return useMutation({
    mutationFn: ({ id, resolutionType, note }) => adminComplaintsService.resolveComplaint(id, resolutionType, note),
    onSuccess: invalidate,
  });
}

export function useEscalateComplaint() {
  const invalidate = useInvalidateComplaints();
  return useMutation({
    mutationFn: ({ id, note }) => adminComplaintsService.escalateComplaint(id, note),
    onSuccess: invalidate,
  });
}

export function useAdminRescheduleRequests(filters = {}) {
  return useQuery({
    queryKey: queryKeys.admin.rescheduleRequests(filters),
    queryFn: () => adminComplaintsService.getRescheduleRequests(filters),
    keepPreviousData: true,
  });
}

function useInvalidateReschedule() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['admin', 'reschedule-requests'] });
}

export function useApproveReschedule() {
  const invalidate = useInvalidateReschedule();
  return useMutation({
    mutationFn: ({ id, alternativeScheduledAt }) => adminComplaintsService.approveReschedule(id, alternativeScheduledAt),
    onSuccess: invalidate,
  });
}

export function useRejectReschedule() {
  const invalidate = useInvalidateReschedule();
  return useMutation({
    mutationFn: ({ id, reason }) => adminComplaintsService.rejectReschedule(id, reason),
    onSuccess: invalidate,
  });
}
