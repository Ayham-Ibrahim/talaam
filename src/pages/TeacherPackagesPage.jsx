import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { TeacherPackageStatsGrid } from '@/components/dashboard/TeacherPackageStatsGrid';
import { TeacherPackagesFilterBar } from '@/components/dashboard/TeacherPackagesFilterBar';
import { TeacherPackagesTable } from '@/components/dashboard/TeacherPackagesTable';
import { TeacherCoursesTable } from '@/components/dashboard/TeacherCoursesTable';
import { AddPackageModal } from '@/components/dashboard/AddPackageModal';
import { AddCourseModal } from '@/components/dashboard/AddCourseModal';
import { Pagination } from '@/components/dashboard/Pagination';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import {
  useTeacherPackagesList,
  useSubmitTeacherPackage,
  useTeacherCoursesList,
  useSubmitTeacherCourse,
} from '@/hooks/useDashboard';
import { useT } from '@/hooks/useT';

const PAGE_SIZE = 10;
const DEFAULT_FILTERS = { status: '', type: '', search: '' };

function PackageListView({ user }) {
  const t = useT();
  const { data, isLoading, isError, refetch } = useTeacherPackagesList();
  const submitPackage = useSubmitTeacherPackage();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState(null);
  const [viewingPackageId, setViewingPackageId] = useState(null);

  const filteredPackages = useMemo(() => {
    if (!data?.packages) return [];
    const search = filters.search.trim().toLowerCase();
    return data.packages.filter((pkg) => {
      if (filters.status && pkg.status !== filters.status) return false;
      if (filters.type && pkg.session_format !== filters.type) return false;
      if (search && !pkg.title.toLowerCase().includes(search)) return false;
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

  if (editingPackageId) {
    return (
      <DashboardLayout>
        <AddPackageModal packageId={editingPackageId} onClose={() => setEditingPackageId(null)} />
      </DashboardLayout>
    );
  }

  if (viewingPackageId) {
    return (
      <DashboardLayout>
        <AddPackageModal packageId={viewingPackageId} readOnly onClose={() => setViewingPackageId(null)} />
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
                <TeacherPackagesTable
                  packages={pagePackages}
                  isSubmitting={submitPackage.isPending}
                  onSubmit={(pkg) => submitPackage.mutate(pkg.id)}
                  onEdit={(pkg) => setEditingPackageId(pkg.id)}
                  onView={(pkg) => setViewingPackageId(pkg.id)}
                />
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

function CourseListView({ user }) {
  const t = useT();
  const { data: courses, isLoading, isError, refetch } = useTeacherCoursesList();
  const submitCourse = useSubmitTeacherCourse();
  const [isModalOpen, setModalOpen] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  if (isModalOpen) {
    return (
      <DashboardLayout>
        <AddCourseModal onClose={() => setModalOpen(false)} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="rounded-xl bg-primary px-5 py-3 text-sm font-medium text-white hover:bg-primary-hover"
          >
            {t('dashboard.addCourse.createCourse')}
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
        ) : !courses || courses.length === 0 ? (
          <EmptyState title={t('dashboard.teacherPackages.empty')} />
        ) : (
          <TeacherCoursesTable courses={courses} isSubmitting={submitCourse.isPending} onSubmit={(c) => submitCourse.mutate(c.id)} />
        )}
      </div>
    </DashboardLayout>
  );
}

/** teacher_type = training_center → courses only (its own resource/wizard); school/university → packages only */
export function TeacherPackagesPage() {
  const { user } = useAuth();
  const isCenter = user?.teacherType === 'training_center';

  return isCenter ? <CourseListView user={user} /> : <PackageListView user={user} />;
}
