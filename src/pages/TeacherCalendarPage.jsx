import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { CalendarFilterBar } from '@/components/dashboard/CalendarFilterBar';
import { MonthCalendar } from '@/components/dashboard/MonthCalendar';
import { CalendarSessionsList } from '@/components/dashboard/CalendarSessionsList';
import { ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useTeacherCalendarSessions } from '@/hooks/useDashboard';
import { SESSION_TYPE_STYLES } from '@/mocks/dashboard.mock';
import { useT } from '@/hooks/useT';

const DEFAULT_FILTERS = { subject: '', status: '', language: '' };

// المركز التدريبي: فلاتر حقيقية تُطبَّق على جلساته — لا مادة ولا لغة تدريس للدورات
const CENTER_DEFAULT_FILTERS = { course: '', status: '' };
const CENTER_STATUS_OPTIONS = [
  { value: 'upcoming', label: 'قادمة' },
  { value: 'attended', label: 'مكتملة' },
  { value: 'cancelled', label: 'ملغاة' },
];

function matchesCenterFilters(session, filters) {
  if (filters.course && session.packageTitle !== filters.course) return false;
  if (filters.status && session.status !== filters.status) return false;
  return true;
}

function formatArabicDate(iso) {
  return new Intl.DateTimeFormat('ar', { day: 'numeric', month: 'long' }).format(new Date(iso));
}

const todayIso = () => new Date().toISOString().slice(0, 10);

/** المعلم على تقويمه الخاص — نفس شكل CalendarPage الطالبي، لكن مصدر الجلسات والرابط من جهة المعلم (join_url_teacher) */
export function TeacherCalendarPage() {
  const t = useT();
  const { user } = useAuth();
  const isTrainingCenter = user?.teacherType === 'training_center';
  const defaultFilters = isTrainingCenter ? CENTER_DEFAULT_FILTERS : DEFAULT_FILTERS;
  const { data: sessions, isLoading, isError, refetch } = useTeacherCalendarSessions();
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [filters, setFilters] = useState(defaultFilters);
  // الفلاتر تُطبَّق عند الضغط على "تطبيق الفلاتر" فقط، لا مع كل اختيار
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);

  const centerFilterFields = useMemo(() => {
    if (!isTrainingCenter) return undefined;
    const courseTitles = [...new Set((sessions ?? []).map((s) => s.packageTitle).filter(Boolean))];
    return [
      { key: 'course', label: t('dashboard.courseLabel'), options: courseTitles },
      { key: 'status', label: t('dashboard.statusLabel'), options: CENTER_STATUS_OPTIONS },
    ];
  }, [isTrainingCenter, sessions, t]);

  const visibleSessions = useMemo(
    () => (isTrainingCenter ? (sessions ?? []).filter((s) => matchesCenterFilters(s, appliedFilters)) : sessions ?? []),
    [isTrainingCenter, sessions, appliedFilters]
  );

  const sessionsByDate = useMemo(() => {
    const map = {};
    visibleSessions.forEach((session) => {
      const color = SESSION_TYPE_STYLES[session.type]?.color ?? '#4B6898';
      (map[session.date] ??= []).push({ ...session, color });
    });
    return map;
  }, [visibleSessions]);

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
            fields={centerFilterFields}
            onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
            onApply={() => setAppliedFilters(filters)}
            onReset={() => {
              setFilters(defaultFilters);
              setAppliedFilters(defaultFilters);
            }}
          />
          <MonthCalendar sessionsByDate={sessionsByDate} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          <CalendarSessionsList dateLabel={formatArabicDate(selectedDate)} sessions={daySessions} />
        </div>
      )}
    </DashboardLayout>
  );
}
