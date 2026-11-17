import { useEffect, useMemo, useState } from 'react';
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
import { useT } from '@/hooks/useT';

const PAGE_SIZE = 10;
// الافتراضي "قادمة" — والترتيب من السيرفر الأقرب موعداً أولاً، فأقرب جلسة للمعلم أول صف عند الدخول
const DEFAULT_FILTERS = { status: 'upcoming', date: '', search: '' };
// فلاتر متنافية تطابق display_status بالباك اند (ClassSession::DISPLAY_STATUSES) — نفس فلاتر الطالب؛
// تفصيل السبب (غياب الطالب/غيابك/غير مدفوع) في شارة الصف لا في الفلتر
const STATUS_FILTER_LABEL_KEYS = {
  upcoming: 'dashboard.sessionsPage.filterUpcoming',
  reschedule_pending: 'dashboard.sessionsPage.filterReschedulePending',
  attended: 'dashboard.sessionsPage.filterAttended',
  missed: 'dashboard.sessionsPage.filterMissed',
};
// القادمة الأقرب أولاً، والسابقة (منعقدة/لم تُعقد) الأحدث أولاً
const PAST_STATUSES = ['attended', 'missed'];
const SEARCH_DEBOUNCE_MS = 350;

export function TeacherSessionsPage() {
  const t = useT();
  const { user } = useAuth();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  // البحث يُرسَل للسيرفر بعد توقف الكتابة — لا طلب مع كل حرف
  const [search, setSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setSearch(filters.search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [filters.search]);
  const { data: response, isLoading, isError, refetch } = useTeacherSessions({
    page,
    perPage: PAGE_SIZE,
    status: filters.status || undefined,
    sort: PAST_STATUSES.includes(filters.status) ? 'desc' : 'asc',
    date: filters.date || undefined,
    search: search || undefined,
  });
  const sessions = response?.data ?? [];
  const total = response?.meta?.total ?? 0;
  const totalPages = Math.max(1, response?.meta?.last_page ?? 1);
  const createRescheduleRequest = useCreateRescheduleRequest();
  const [postponingSession, setPostponingSession] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleConfirmPostpone = ({ proposedScheduledAt, reason }) => {
    createRescheduleRequest.mutate(
      { sessionId: postponingSession.id, proposedScheduledAt, reason },
      {
        onSuccess: (result) => {
          setPostponingSession(null);
          setSuccessMessage(result?.message || t('dashboard.rescheduleModal.success'));
          setTimeout(() => setSuccessMessage(''), 4000);
        },
      }
    );
  };

  const statusOptions = useMemo(
    // خيار "جميع الحالات" صريح — الفلتر الافتراضي لم يعد فارغاً، فبدونه لا طريق للعودة لعرض الكل
    () => [
      { value: '', label: t('dashboard.teacherSessions.allStatuses') },
      ...Object.entries(STATUS_FILTER_LABEL_KEYS).map(([value, key]) => ({ value, label: t(key) })),
    ],
    [t]
  );

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
        ) : sessions.length === 0 ? (
          <EmptyState title={t('dashboard.teacherSessions.empty')} />
        ) : (
          <>
            <TeacherSessionsTable
              sessions={sessions}
              onPostpone={(session) => {
                createRescheduleRequest.reset();
                setPostponingSession(session);
              }}
              onRespondDone={(message) => {
                setSuccessMessage(message);
                setTimeout(() => setSuccessMessage(''), 4000);
              }}
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              <span className="text-sm text-ink-soft">
                {t('dashboard.teacherSessions.showingPrefix')} {(page - 1) * PAGE_SIZE + 1} -{' '}
                {Math.min(page * PAGE_SIZE, total)} {t('dashboard.teacherSessions.showingOf')}{' '}
                {total} {t('dashboard.teacherSessions.unit')}
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
