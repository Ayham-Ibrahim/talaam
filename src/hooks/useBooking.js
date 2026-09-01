import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { bookingService, packageService } from '@/services';

export function usePendingBookingRequests() {
  return useQuery({
    queryKey: queryKeys.bookings.list({ status: 'pending_teacher_confirmation' }),
    queryFn: () => bookingService.getPendingRequests(),
  });
}

/** أوقات معلم الباقة المشغولة في اليوم المختار — لعرض "غير متاح" قبل الإرسال في BookingWidget */
export function usePackageBusySlots(packageId, dateISO) {
  return useQuery({
    queryKey: ['packages', packageId, 'busy-slots', dateISO],
    queryFn: () => packageService.getBusySlots(packageId, dateISO),
    enabled: !!packageId && !!dateISO,
    staleTime: 30 * 1000,
  });
}

/**
 * Same as usePackageBusySlots, batched over every one of a group package's
 * fixed session dates at once — used to advisory-check the teacher's
 * schedule before letting a student join a group package, since (unlike
 * individual booking) there's no per-date picker step to hang a single
 * check off of; every session date needs checking up front.
 */
export function usePackageBusySlotsForDates(packageId, datesISO) {
  const results = useQueries({
    queries: (datesISO ?? []).map((dateISO) => ({
      queryKey: ['packages', packageId, 'busy-slots', dateISO],
      queryFn: () => packageService.getBusySlots(packageId, dateISO),
      enabled: !!packageId && !!dateISO,
      staleTime: 30 * 1000,
    })),
  });
  return {
    data: results.map((r, i) => ({ dateISO: datesISO[i], busySlots: r.data ?? [] })),
    isLoading: results.some((r) => r.isLoading),
  };
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
