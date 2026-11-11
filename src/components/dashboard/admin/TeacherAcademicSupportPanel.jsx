import { useMutation, useQueryClient } from '@tanstack/react-query';
import { HandCoins } from 'lucide-react';
import { ApiErrorList, ErrorState, Skeleton } from '@/components/ui';
import { SupportPackagesApprovalPanel } from '@/components/dashboard/admin/SupportPackagesApprovalPanel';
import { useAdminAcademicSupporterDetail } from '@/hooks/useAcademicSupporters';
import { academicSupporterService } from '@/services/academicSupporterService';
import { queryKeys } from '@/api/queryKeys';
import { useT } from '@/hooks/useT';

/**
 * باقات الدعم الأكاديمي لمدرس جامعي (تاب بصفحة المدرس بلوحة الأدمن). أول مرة: زر
 * يفعّل له ملف داعم مرتبط (POST teachers/{id}/academic-supporter)، بعدها نفس لوحة
 * باقات الدعم المستخدمة بصفحة الداعم المستقل حرفياً (إضافة/تعديل/تعطيل).
 */
export function TeacherAcademicSupportPanel({ teacherId, supporterId }) {
  const t = useT();
  const queryClient = useQueryClient();
  const enable = useMutation({
    mutationFn: () => academicSupporterService.enableForTeacher(teacherId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.teacherDetail(teacherId) }),
  });
  // نفس شكل المعرّف (نص) الذي تستخدمه SupportPackagesApprovalPanel لإبطال الكاش بعد الإضافة/التعديل
  const supporterKey = supporterId ? String(supporterId) : undefined;
  const { data: supporter, isLoading, isError, refetch } = useAdminAcademicSupporterDetail(supporterKey);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card">
      <h2 className="text-right font-bold text-ink">{t('dashboard.adminTeacherDetail.academicSupport.title')}</h2>
      <p className="mt-1 text-right text-sm text-ink-soft">{t('dashboard.adminTeacherDetail.academicSupport.hint')}</p>

      <div className="mt-4">
        {!supporterId ? (
          <div className="flex flex-col items-start gap-3">
            <button
              type="button"
              disabled={enable.isPending}
              onClick={() => enable.mutate()}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
            >
              <HandCoins size={16} />
              {enable.isPending ? t('dashboard.adminTeacherDetail.academicSupport.enabling') : t('dashboard.adminTeacherDetail.academicSupport.enable')}
            </button>
            {enable.isError && <ApiErrorList error={enable.error} />}
          </div>
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : isLoading ? (
          <Skeleton className="h-40 rounded-2xl" />
        ) : (
          <SupportPackagesApprovalPanel supporterId={supporterKey}supportPackages={supporter?.supportPackages ?? []} />
        )}
      </div>
    </div>
  );
}
