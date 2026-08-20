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
      if (activeTab !== 'all' && session.category !== activeTab) return false;
      if (filters.status && session.status !== filters.status) return false;
      if (filters.subject && session.subject !== filters.subject) return false;
      if (search && !`${session.teacherName} ${session.subject} ${session.sessionType}`.toLowerCase().includes(search)) {
        return false;
      }
      return true;
    });
  }, [sessions, activeTab, filters]);

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

            {sessions.length === 0 ? (
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
                <div className="flex justify-center">
                  <Pagination page={page} totalPages={totalPages} onChange={setPage} />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
