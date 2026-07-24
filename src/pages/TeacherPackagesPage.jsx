import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { TeacherPackageStatsGrid } from '@/components/dashboard/TeacherPackageStatsGrid';
import { TeacherPackagesFilterBar } from '@/components/dashboard/TeacherPackagesFilterBar';
import { TeacherPackagesTable } from '@/components/dashboard/TeacherPackagesTable';
import { AddPackageModal } from '@/components/dashboard/AddPackageModal';
import { Pagination } from '@/components/dashboard/Pagination';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useTeacherPackagesList } from '@/hooks/useDashboard';
import { useT } from '@/hooks/useT';

const PAGE_SIZE = 10;
const DEFAULT_FILTERS = { status: '', type: '', search: '' };

export function TeacherPackagesPage() {
  const t = useT();
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useTeacherPackagesList();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [isModalOpen, setModalOpen] = useState(false);

  const filteredPackages = useMemo(() => {
    if (!data?.packages) return [];
    const search = filters.search.trim().toLowerCase();
    return data.packages.filter((pkg) => {
      if (filters.status && filters.status !== 'active') return false;
      if (filters.type && pkg.type !== filters.type) return false;
      if (search && !`${pkg.packageTitle} ${pkg.subject}`.toLowerCase().includes(search)) return false;
      return true;
    });
  }, [data, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredPackages.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagePackages = filteredPackages.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  if (!user) return <Navigate to="/login" replace />;

  if (isModalOpen) {
    return (
      <DashboardLayout>
        <AddPackageModal onClose={() => setModalOpen(false)} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {isError ? (
          <ErrorState onRetry={refetch} />
        ) : isLoading ? (
          <div className="space-y-6" dir="rtl">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl" />
              ))}
            </div>
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        ) : (
          <>
            <TeacherPackageStatsGrid stats={data.stats} />
            <TeacherPackagesFilterBar filters={filters} onChange={handleFilterChange} onCreate={() => setModalOpen(true)} />

            {filteredPackages.length === 0 ? (
              <EmptyState title={t('dashboard.teacherPackages.empty')} />
            ) : (
              <>
                <TeacherPackagesTable packages={pagePackages} />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
                  <span className="text-sm text-ink-soft">
                    {t('dashboard.teacherPackages.showingPrefix')} {(currentPage - 1) * PAGE_SIZE + 1} -{' '}
                    {Math.min(currentPage * PAGE_SIZE, filteredPackages.length)} {t('dashboard.teacherPackages.showingOf')}{' '}
                    {filteredPackages.length} {t('dashboard.teacherPackages.unit')}
                  </span>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
