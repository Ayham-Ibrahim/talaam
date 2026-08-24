import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminDashboardLayout } from '@/components/dashboard/admin/AdminDashboardLayout';
import { AdminStudentsFilterBar } from '@/components/dashboard/admin/AdminStudentsFilterBar';
import { AdminStudentsTable } from '@/components/dashboard/admin/AdminStudentsTable';
import { Pagination } from '@/components/dashboard/Pagination';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useAdminStudentsList } from '@/hooks/useAdminStudents';
import { useT } from '@/hooks/useT';

const PAGE_SIZE = 10;
const DEFAULT_FILTERS = { educationType: '', search: '' };

export function AdminStudentsPage() {
  const t = useT();
  const { user } = useAuth();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useAdminStudentsList(filters);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  if (!user) return <Navigate to="/login" replace />;

  const students = data?.data ?? [];
  const totalPages = Math.max(1, Math.ceil(students.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStudents = students.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <AdminDashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="text-right">
          <h1 className="text-xl font-bold text-ink">{t('dashboard.adminStudents.title')}</h1>
          <p className="mt-1 text-sm text-ink-soft">{t('dashboard.adminStudents.subtitle')}</p>
        </div>

        <AdminStudentsFilterBar filters={filters} onChange={handleFilterChange} />

        {isError ? (
          <ErrorState onRetry={refetch} />
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-2xl" />
            ))}
          </div>
        ) : students.length === 0 ? (
          <EmptyState title={t('dashboard.adminStudents.empty')} />
        ) : (
          <>
            <AdminStudentsTable students={pageStudents} />
            <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
