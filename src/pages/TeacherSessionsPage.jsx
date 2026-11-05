import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { TeacherSessionsFilterBar } from '@/components/dashboard/TeacherSessionsFilterBar';
import { TeacherSessionsTable } from '@/components/dashboard/TeacherSessionsTable';
import { Pagination } from '@/components/dashboard/Pagination';
import { RescheduleRequestModal } from '@/components/dashboard/RescheduleRequestModal';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { PolicyNotice } from '@/components/common/PolicyNotice';
import { useAuth } from '@/hooks/useAuth';
import { useTeacherSessions } from '@/hooks/useDashboard';
import { useCreateRescheduleRequest } from '@/hooks/useReschedule';
import { TEACHER_SESSION_STATUS_STYLES } from '@/mocks/teacherDashboard.mock';
import { teacherSessionDisplayStatus } from '@/services';
import { useT } from '@/hooks/useT';

const PAGE_SIZE = 10;
// الافتراضي "قادمة" مرتبة من الأقدم للأحدث — فأقرب جلسة للمعلم أول صف عند الدخول
const DEFAULT_FILTERS = { status: 'scheduled', date: '', search: '' };

function sortOldestFirst(sessions) {
  return [...sessions].sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at) || a.id - b.id);
}

export function TeacherSessionsPage() {
  const t = useT();
  const { user } = useAuth();
  const { data: sessions, isLoading, isError, refetch } = useTeacherSessions();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const createRescheduleRequest = useCreateRescheduleRequest();
  const [postponingSession, setPostponingSession] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleConfirmPostpone = ({ proposedScheduledAt, reason }) => {
    createRescheduleRequest.mutate(
      { sessionId: postponingSession.id, proposedScheduledAt, reason },
      {
        onSuccess: () => {
          setPostponingSession(null);
          setSuccessMessage(t('dashboard.rescheduleModal.success'));
          setTimeout(() => setSuccessMessage(''), 4000);
        },
      }
    );
  };

  const statusOptions = useMemo(
    // خيار "جميع الحالات" صريح — الفلتر الافتراضي لم يعد فارغاً، فبدونه لا طريق للعودة لعرض الكل
    () => [
      { value: '', label: t('dashboard.teacherSessions.allStatuses') },
      ...Object.entries(TEACHER_SESSION_STATUS_STYLES).map(([value, style]) => ({ value, label: style.label })),
    ],
    [t]
  );

  const sortedSessions = useMemo(() => (sessions ? sortOldestFirst(sessions) : []), [sessions]);

  const filteredSessions = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return sortedSessions.filter((session) => {
      const title = session.booking?.package?.title ?? session.course?.title ?? '';
      if (filters.status && teacherSessionDisplayStatus(session) !== filters.status) return false;
      if (filters.date && !session.scheduled_at.startsWith(filters.date)) return false;
      if (search && !title.toLowerCase().includes(search)) return false;
      return true;
    });
  }, [sortedSessions, filters]);

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
        <TeacherSessionsFilterBar statuses={statusOptions} filters={filters} onChange={handleFilterChange} />

        {/* حضور المعلم ومستحقه يُحسمان تلقائياً من دخوله — لا صفحة مستحقات للمعلم، فالقاعدة هنا */}
        <PolicyNotice policySlug="teacher-policy">{t('policyNotice.sessionTeacher')}</PolicyNotice>

        {successMessage && (
          <div className="rounded-2xl bg-success-light px-4 py-3 text-sm font-medium text-success">{successMessage}</div>
        )}

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
            <TeacherSessionsTable
              sessions={pageSessions}
              onPostpone={(session) => {
                createRescheduleRequest.reset();
                setPostponingSession(session);
              }}
            />
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

      {postponingSession && (
        <RescheduleRequestModal
          isPending={createRescheduleRequest.isPending}
          error={createRescheduleRequest.error}
          currentScheduledAt={postponingSession.scheduled_at}
          onConfirm={handleConfirmPostpone}
          onClose={() => setPostponingSession(null)}
        />
      )}
    </DashboardLayout>
  );
}
