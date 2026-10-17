import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { AddSupportPackageModal } from '@/components/academicSupporter/AddSupportPackageModal';
import { SupporterSupportPackagesTable } from '@/components/academicSupporter/SupporterSupportPackagesTable';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import {
  useMySupportPackages,
  useDisableSupportPackage,
  useEnableSupportPackage,
} from '@/hooks/useSupporterAccount';
import { useT } from '@/hooks/useT';

export function SupporterPackagesPage() {
  const t = useT();
  const { user } = useAuth();
  const { data: supportPackages, isLoading, isError, refetch } = useMySupportPackages();
  const [isModalOpen, setModalOpen] = useState(false);
  const disable = useDisableSupportPackage();
  const enable = useEnableSupportPackage();

  if (!user) return <Navigate to="/login" replace />;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="rounded-xl bg-primary px-5 py-3 text-sm font-medium text-white hover:bg-primary-hover"
          >
            {t('dashboard.teacherSupportPackages.create')}
          </button>
        </div>

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

      {isModalOpen && <AddSupportPackageModal onClose={() => setModalOpen(false)} />}
    </DashboardLayout>
  );
}
