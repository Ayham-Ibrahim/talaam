import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { SessionsFilterTabs } from '@/components/dashboard/SessionsFilterTabs';
import { SessionsFilterBar } from '@/components/dashboard/SessionsFilterBar';
import { SessionsList } from '@/components/dashboard/SessionsList';
import { ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useSessions } from '@/hooks/useDashboard';
import { SESSION_STATUS_LABEL_KEYS } from '@/mocks/dashboard.mock';
import { useT } from '@/hooks/useT';

const DEFAULT_FILTERS = { status: '', subject: '', search: '' };

export function SessionsPage() {
  const t = useT();
  const { user } = useAuth();
  const { data: sessions, isLoading, isError, refetch } = useSessions();
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

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

  if (!user) return <Navigate to="/login" replace />;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <SessionsFilterTabs active={activeTab} onChange={setActiveTab} />

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
              onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
            />
            <SessionsList sessions={filteredSessions} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
