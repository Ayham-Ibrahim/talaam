import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { campaignService } from '@/services/campaignService';
import { useAuthStore } from '@/store';
import { trackMetaEvent } from '@/lib/metaPixel';

export function useCampaign(slug) {
  return useQuery({
    queryKey: ['campaigns', slug],
    queryFn: () => campaignService.getCampaign(slug),
    enabled: !!slug,
    retry: false,
  });
}

/** نفس useRegisterStudent — دخول تلقائي فوراً بالتوكن المُعاد */
export function useRegisterCampaign(slug) {
  const login = useAuthStore((s) => s.login);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => campaignService.register(slug, payload),
    onSuccess: (data) => {
      login({ user: data.user, token: data.token }, true);
      // باقات صفحات المعلمين المخزّنة للزائر لا تشمل باقات الحملة
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      trackMetaEvent('CompleteRegistration', { content_name: 'campaign', status: true }, `registration_${data.user.id}`);
    },
  });
}

export function useConvertAccount() {
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    mutationFn: () => campaignService.convertAccount(),
    onSuccess: (user) => updateUser({ account_type: user.account_type, converted_at: user.converted_at }),
  });
}

export function useCampaignPackages({ enabled = true } = {}) {
  return useQuery({
    queryKey: ['campaign-packages'],
    queryFn: () => campaignService.getCampaignPackages(),
    enabled,
  });
}

export function useSendGuestCode(packageId) {
  return useMutation({
    mutationFn: (email) => campaignService.sendGuestCode(packageId, email),
  });
}

export function useBookGuestTrial(packageId) {
  return useMutation({
    mutationFn: (payload) => campaignService.bookGuestTrial(packageId, payload),
  });
}

/* ── الأدمن ── */

export function useAdminCampaigns() {
  return useQuery({
    queryKey: ['admin', 'campaigns'],
    queryFn: () => campaignService.adminListCampaigns(),
  });
}

export function useSaveCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) =>
      id ? campaignService.adminUpdateCampaign(id, payload) : campaignService.adminCreateCampaign(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'campaigns'] }),
  });
}

export function useAdminCampaignPackages(teacherId) {
  return useQuery({
    queryKey: ['admin', 'campaign-packages', String(teacherId)],
    queryFn: () => campaignService.adminListCampaignPackages(teacherId),
    enabled: !!teacherId,
  });
}

export function useCreateCampaignPackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => campaignService.adminCreateCampaignPackage(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'campaign-packages'] }),
  });
}

export function useToggleCampaignPackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, enabled }) => campaignService.adminSetPackageEnabled(id, enabled),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'campaign-packages'] }),
  });
}

export function useTeacherAvailableDays(teacherId) {
  return useQuery({
    queryKey: ['admin', 'teacher-available-days', teacherId],
    queryFn: () => campaignService.adminTeacherAvailableDays(teacherId),
    enabled: !!teacherId,
  });
}
