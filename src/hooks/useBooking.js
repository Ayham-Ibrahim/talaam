import { useMutation } from '@tanstack/react-query';
import { bookingService } from '@/services';

export function useCreateBooking() {
  return useMutation({
    mutationFn: (payload) => bookingService.createBooking(payload),
  });
}
