import { Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { SupporterSupportPackagesTable } from '@/components/academicSupporter/SupporterSupportPackagesTable';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import {
  useMySupportPackages,
  useDisableSupportPackage,
  useEnableSupportPackage,
} from '@/hooks/useSupporterAccount';
import { useT } from '@/hooks/useT';

/** الداعم لم يعد ينشئ باقاته بنفسه — الأدمن حصراً ينشئها ويربطها به (راجع SupportPackagesApprovalPanel بلوحة الأدمن)؛ هنا فقط يستعرض ويفعّل/يعطّل ما رُبط به */
export function SupporterPackagesPage() {
  const t = useT();
  const { user } = useAuth();
  const { data: supportPackages, isLoading, isError, refetch } = useMySupportPackages();
  const disable = useDisableSupportPackage();
  const enable = useEnableSupportPackage();

  if (!user) return <Navigate to="/login" replace />;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {isError ? (
          <ErrorState onRetry={refetch} />
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-2xl" />
            ))}
          </div>
        ) : !supportPackages || supportPackages.length === 0 ? (
          <EmptyState title={t('dashboard.teacherSupportPackages.empty')} />
        ) : (
          <SupporterSupportPackagesTable
            supportPackages={supportPackages}
            isActing={disable.isPending || enable.isPending}
            onDisable={(id) => disable.mutate(id)}
            onEnable={(id) => enable.mutate(id)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
