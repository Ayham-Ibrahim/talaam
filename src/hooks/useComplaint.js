import { useMutation } from '@tanstack/react-query';
import { complaintService } from '@/services';

export function useCreateComplaint() {
  return useMutation({
    mutationFn: ({ category, description }) => complaintService.create({ category, description }),
  });
}
