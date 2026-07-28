import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { TeacherStudentStatsGrid } from '@/components/dashboard/TeacherStudentStatsGrid';
import { TeacherStudentsFilterBar } from '@/components/dashboard/TeacherStudentsFilterBar';
import { TeacherStudentsTable } from '@/components/dashboard/TeacherStudentsTable';
import { Pagination } from '@/components/dashboard/Pagination';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useTeacherStudents } from '@/hooks/useDashboard';
import { useT } from '@/hooks/useT';

const PAGE_SIZE = 10;
const DEFAULT_FILTERS = { type: '', subject: '', search: '' };

export function TeacherStudentsPage() {
  const t = useT();
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useTeacherStudents();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);

  const subjects = useMemo(() => [...new Set((data?.students ?? []).map((s) => s.subject))], [data]);

  const filteredStudents = useMemo(() => {
    if (!data?.students) return [];
    const search = filters.search.trim().toLowerCase();
    return data.students.filter((student) => {
      if (filters.type && student.type !== filters.type) return false;
      if (filters.subject && student.subject !== filters.subject) return false;
      if (search && !`${student.studentName} ${student.subject}`.toLowerCase().includes(search)) return false;
      return true;
    });
  }, [data, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStudents = filteredStudents.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  if (!user) return <Navigate to="/login" replace />;

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
            <TeacherStudentStatsGrid stats={data.stats} />
            <TeacherStudentsFilterBar subjects={subjects} filters={filters} onChange={handleFilterChange} />

            {filteredStudents.length === 0 ? (
              <EmptyState title={t('dashboard.teacherStudents.empty')} />
            ) : (
              <>
                <TeacherStudentsTable students={pageStudents} />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
                  <span className="text-sm text-ink-soft">
                    {t('dashboard.teacherStudents.showingPrefix')} {(currentPage - 1) * PAGE_SIZE + 1} -{' '}
                    {Math.min(currentPage * PAGE_SIZE, filteredStudents.length)} {t('dashboard.teacherStudents.showingOf')}{' '}
                    {filteredStudents.length} {t('dashboard.teacherStudents.unit')}
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
