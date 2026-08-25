import { useMemo, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { CalendarX2 } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { SessionsFilterTabs } from '@/components/dashboard/SessionsFilterTabs';
import { SessionsFilterBar } from '@/components/dashboard/SessionsFilterBar';
import { SessionsList } from '@/components/dashboard/SessionsList';
import { Pagination } from '@/components/dashboard/Pagination';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useSessions } from '@/hooks/useDashboard';
import { SESSION_STATUS_LABEL_KEYS } from '@/mocks/dashboard.mock';
import { useT } from '@/hooks/useT';

const DEFAULT_FILTERS = { status: '', subject: '', search: '' };
const PER_PAGE = 10;

export function SessionsPage() {
  const t = useT();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const { data: sessionsResponse, isLoading, isError, refetch } = useSessions({
    page,
    per_page: PER_PAGE,
    status: filters.status || undefined,
    // مُصفّاة على السيرفر (وليس على الفرونت إند بعد ترقيم الصفحات) — وإلا فصفحة
    // بعينها قد لا تحوي أي جلسة من الفئة المختارة رغم وجود جلسات منها في صفحات
    // أخرى، فيظهر "لا توجد جلسات" مع عدّاد/ترقيم لإجمالي كل الفئات مجتمعة.
    category: activeTab !== 'all' ? activeTab : undefined,
  });

  const sessions = sessionsResponse?.data ?? [];
  const totalPages = Math.max(1, sessionsResponse?.meta?.last_page ?? 1);

  const subjects = useMemo(() => [...new Set((sessions ?? []).map((s) => s.subject))], [sessions]);

  const statusOptions = useMemo(
    () => Object.keys(SESSION_STATUS_LABEL_KEYS).map((value) => ({ value, label: t(SESSION_STATUS_LABEL_KEYS[value]) })),
    [t],
  );

  const filteredSessions = useMemo(() => {
    if (!sessions) return [];
    const search = filters.search.trim().toLowerCase();
    return sessions.filter((session) => {
      // الحالة والفئة (التبويب) تُصفَّيان من السيرفر فعلياً (params.status
      // وparams.category في useSessions أعلاه) — لا نعيد تصفيتهما هنا. كانت
      // الحالة تُعاد تصفيتها بمقارنة session.status الخام بقيمة "reschedule_pending"
      // حين يُختار ذلك الفلتر تحديداً فلا تتطابقان أبداً؛ وكانت الفئة تُصفَّى
      // بالكامل على الفرونت إند بعد ترقيم صفحة من السيرفر بالفعل، فتظهر صفحة
      // فارغة من الفئة المختارة مع عدّاد/ترقيم لإجمالي كل الفئات (كلا العطلين مُصلَحان الآن).
      if (filters.subject && session.subject !== filters.subject) return false;
      if (search && !`${session.teacherName} ${session.subject} ${session.sessionType}`.toLowerCase().includes(search)) {
        return false;
      }
      return true;
    });
  }, [sessions, filters.subject, filters.search]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    setPage(1);
  };

  if (!user) return <Navigate to="/login" replace />;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <SessionsFilterTabs active={activeTab} onChange={handleTabChange} />

        {isError ? (
          <ErrorState onRetry={refetch} />
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            <SessionsFilterBar
              statuses={statusOptions}
              subjects={subjects}
              filters={filters}
              onChange={handleFilterChange}
            />

            {filteredSessions.length === 0 ? (
              <EmptyState
                icon={CalendarX2}
                image="/fallback_images/no_sessions.webp"
                imageClassName="mb-2 h-[300px] w-auto object-contain"
                title={t('dashboard.sessionsPage.emptyTitle')}
                titleClassName="font-cairo text-[32px] font-medium leading-[60px] text-ink"
                hint={t('dashboard.sessionsPage.emptyHint')}
                hintClassName="mt-1 max-w-2xl text-center font-cairo text-xl font-medium leading-[37px] text-[#626262]"
                action={
                  <Link
                    to="/search"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-normal text-white transition-colors hover:bg-primary-hover"
                  >
                    {t('dashboard.myPackages.exploreTeachers')}
                  </Link>
                }
              />
            ) : (
              <>
                <SessionsList sessions={filteredSessions} />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Pagination page={page} totalPages={totalPages} onChange={setPage} />
                  {sessionsResponse?.meta && (
                    <span className="text-sm text-ink-soft">
                      {t('dashboard.sessionsPage.showingPrefix')} {(page - 1) * PER_PAGE + 1} -{' '}
                      {Math.min(page * PER_PAGE, sessionsResponse.meta.total)} {t('dashboard.sessionsPage.showingOf')}{' '}
                      {sessionsResponse.meta.total} {t('dashboard.sessionsPage.unit')}
                    </span>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
