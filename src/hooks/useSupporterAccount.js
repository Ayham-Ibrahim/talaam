import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { academicSupporterService } from '@/services/academicSupporterService';
import { useAuth } from '@/hooks/useAuth';

const myProfileKey = (id) => ['academic-supporters', 'my-profile', id];

/** حالة الحساب (status) مخزَّنة في user (localStorage) أيضاً — تُزامَن تلقائياً كل مرة يصل رد فعلي (نفس نمط useMyTeacher). */
export function useMySupporterProfile(id) {
  const { updateUser } = useAuth();
  const query = useQuery({
    queryKey: myProfileKey(id),
    queryFn: () => academicSupporterService.getMyProfile(id),
    enabled: !!id,
    refetchOnWindowFocus: true,
  });
  const status = query.data?.status;
  const name = query.data?.name;

  useEffect(() => {
    if (status) updateUser({ academicSupporter: { status } });
  }, [status, updateUser]);

  useEffect(() => {
    if (name) updateUser({ name });
  }, [name, updateUser]);

  return query;
}

export function useUpdateMySupporterProfile(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => academicSupporterService.updateProfile(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: myProfileKey(id) }),
  });
}

export function useAddSupporterGalleryItem(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, thumbnail }) => academicSupporterService.addGalleryItem(id, file, thumbnail),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: myProfileKey(id) }),
  });
}

export function useRemoveSupporterGalleryItem(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId) => academicSupporterService.removeGalleryItem(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: myProfileKey(id) }),
  });
}

export function useMySupportPackages() {
  return useQuery({
    queryKey: queryKeys.supporter.supportPackagesList(),
    queryFn: () => academicSupporterService.getMySupportPackages(),
  });
}

export function useCreateSupportPackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => academicSupporterService.createSupportPackage(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.supporter.supportPackagesList() }),
  });
}

export function useDisableSupportPackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => academicSupporterService.disableSupportPackage(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.supporter.supportPackagesList() }),
  });
}

export function useEnableSupportPackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => academicSupporterService.enableSupportPackage(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.supporter.supportPackagesList() }),
  });
}

/** الطلاب الذين اشتروا باقات هذا الداعم — تُطلَع عليه من قسم "الطلاب المشتركون" بلوحته */
export function useMySupporterPurchases(filters = {}) {
  return useQuery({
    queryKey: queryKeys.supporter.purchases(filters),
    queryFn: () => academicSupporterService.getMyPurchases(filters),
  });
}
