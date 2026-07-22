import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { CalendarFilterBar } from '@/components/dashboard/CalendarFilterBar';
import { MonthCalendar } from '@/components/dashboard/MonthCalendar';
import { CalendarSessionsList } from '@/components/dashboard/CalendarSessionsList';
import { ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useCalendarSessions } from '@/hooks/useDashboard';
import { SESSION_TYPE_STYLES } from '@/mocks/dashboard.mock';

const DEFAULT_FILTERS = { subject: '', status: '', language: '' };

function formatArabicDate(iso) {
  return new Intl.DateTimeFormat('ar', { day: 'numeric', month: 'long' }).format(new Date(iso));
}

export function CalendarPage() {
  const { user } = useAuth();
  const { data: sessions, isLoading, isError, refetch } = useCalendarSessions();
  const [selectedDate, setSelectedDate] = useState('2026-05-01');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const sessionsByDate = useMemo(() => {
    const map = {};
    (sessions ?? []).forEach((session) => {
      const color = SESSION_TYPE_STYLES[session.type]?.color ?? '#4B6898';
      (map[session.date] ??= []).push({ ...session, color });
    });
    return map;
  }, [sessions]);

  const daySessions = sessionsByDate[selectedDate] ?? [];

  if (!user) return <Navigate to="/login" replace />;

  return (
    <DashboardLayout>
      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-[500px] rounded-2xl" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <CalendarFilterBar
            filters={filters}
            onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
            onApply={() => {}}
            onReset={() => setFilters(DEFAULT_FILTERS)}
          />
          <MonthCalendar sessionsByDate={sessionsByDate} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          <CalendarSessionsList dateLabel={formatArabicDate(selectedDate)} sessions={daySessions} />
        </div>
      )}
    </DashboardLayout>
  );
}
