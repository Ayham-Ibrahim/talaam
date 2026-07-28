import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { TeacherSessionsFilterBar } from '@/components/dashboard/TeacherSessionsFilterBar';
import { TeacherSessionsTable } from '@/components/dashboard/TeacherSessionsTable';
import { Pagination } from '@/components/dashboard/Pagination';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useTeacherSessions } from '@/hooks/useDashboard';
import { TEACHER_SESSION_STATUS_STYLES } from '@/mocks/teacherDashboard.mock';
import { useT } from '@/hooks/useT';

const PAGE_SIZE = 10;
const DEFAULT_FILTERS = { status: '', subject: '', date: '', search: '' };

export function TeacherSessionsPage() {
  const t = useT();
  const { user } = useAuth();
  const { data: sessions, isLoading, isError, refetch } = useTeacherSessions();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);

  const subjects = useMemo(() => [...new Set((sessions ?? []).map((s) => s.subject))], [sessions]);
  const statusOptions = useMemo(
    () => Object.entries(TEACHER_SESSION_STATUS_STYLES).map(([value, style]) => ({ value, label: style.label })),
    [],
  );

  const filteredSessions = useMemo(() => {
    if (!sessions) return [];
    const search = filters.search.trim().toLowerCase();
    return sessions.filter((session) => {
      if (filters.status && session.status !== filters.status) return false;
      if (filters.subject && session.subject !== filters.subject) return false;
      if (search && !`${session.packageTitle} ${session.subject}`.toLowerCase().includes(search)) return false;
      return true;
    });
  }, [sessions, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredSessions.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageSessions = filteredSessions.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  if (!user) return <Navigate to="/login" replace />;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <TeacherSessionsFilterBar
          statuses={statusOptions}
          subjects={subjects}
          filters={filters}
          onChange={handleFilterChange}
        />

        {isError ? (
          <ErrorState onRetry={refetch} />
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-2xl" />
            ))}
          </div>
        ) : filteredSessions.length === 0 ? (
          <EmptyState title={t('dashboard.teacherSessions.empty')} />
        ) : (
          <>
            <TeacherSessionsTable sessions={pageSessions} />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
              <span className="text-sm text-ink-soft">
                {t('dashboard.teacherSessions.showingPrefix')} {(currentPage - 1) * PAGE_SIZE + 1} -{' '}
                {Math.min(currentPage * PAGE_SIZE, filteredSessions.length)} {t('dashboard.teacherSessions.showingOf')}{' '}
                {filteredSessions.length} {t('dashboard.teacherSessions.unit')}
              </span>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
