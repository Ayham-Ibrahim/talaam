import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { bookingService } from '@/services';

export function usePendingBookingRequests() {
  return useQuery({
    queryKey: queryKeys.bookings.list({ status: 'pending_teacher_confirmation' }),
    queryFn: () => bookingService.getPendingRequests(),
  });
}

/** slots: [{ date: 'YYYY-MM-DD', start_time: 'HH:mm' }, ...] — one entry per session of the package */
export function useRequestIndividualBooking(packageId) {
  return useMutation({
    mutationFn: (slots) => bookingService.requestIndividualBooking(packageId, slots),
  });
}

export function useCreateGroupBooking(packageId) {
  return useMutation({
    mutationFn: () => bookingService.createGroupBooking(packageId),
  });
}

export function useApproveBookingRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId) => bookingService.approveBookingRequest(bookingId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  });
}

export function useRejectBookingRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, reason }) => bookingService.rejectBookingRequest(bookingId, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  });
}

export function useCheckoutBooking() {
  return useMutation({
    mutationFn: (bookingId) => bookingService.checkoutBooking(bookingId),
  });
}

export function useDownloadBookingInvoice() {
  return useMutation({
    mutationFn: (bookingId) => bookingService.downloadInvoice(bookingId),
  });
}
