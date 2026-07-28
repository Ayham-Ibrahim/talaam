import { BookOpen, CalendarClock, Clock, User } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useTeacherSessionDetails } from '@/hooks/useDashboard';
import { TEACHER_SESSION_TYPE_STYLES } from '@/mocks/teacherDashboard.mock';
import { useT } from '@/hooks/useT';

export function TeacherSessionDetailsPage() {
  const t = useT();
  const { user } = useAuth();
  const { id } = useParams();
  const { data: session, isLoading, isError, refetch } = useTeacherSessionDetails(id);

  if (!user) return <Navigate to="/login" replace />;

  const typeStyle = session ? TEACHER_SESSION_TYPE_STYLES[session.type] : null;
  const typeValue = session ? (session.type === 'training' ? typeStyle.label : `باقة ${typeStyle.label}`) : '';

  const ITEMS = session
    ? [
        { key: 'type', icon: User, label: t('dashboard.teacherSessions.type'), value: typeValue },
        { key: 'time', icon: Clock, label: t('dashboard.teacherSessions.time'), value: session.time },
        { key: 'date', icon: CalendarClock, label: t('dashboard.teacherSessions.date'), value: session.date },
        {
          key: 'subject',
          icon: BookOpen,
          label: t('dashboard.teacherSessions.subject'),
          value: session.subject,
          color: typeStyle?.color,
        },
      ]
    : [];

  return (
    <DashboardLayout>
      <div className="mb-4 flex items-center justify-end gap-2 text-sm">
        <span className="font-bold text-ink">{t('dashboard.teacherSessions.detailsTitle')}</span>
        <span className="h-1.5 w-1.5 rounded-full bg-line" />
        <Link to="/dashboard/teacher/sessions" className="font-bold text-primary hover:underline">
          {t('dashboard.nav.sessions')}
        </Link>
      </div>

      {isError || (!isLoading && !session) ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <Skeleton className="h-32 rounded-2xl" />
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-8 rounded-2xl border border-[#F2F2F7] bg-white p-6 shadow-card sm:flex-nowrap sm:divide-x sm:divide-x-reverse sm:divide-line sm:gap-0">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.key} className="flex flex-1 flex-col items-center gap-2 px-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EDF0F5]">
                  <Icon size={22} className="text-primary" />
                </div>
                <span className="text-sm text-ink-soft">{item.label}</span>
                <span className="font-bold" style={{ color: item.color ?? '#2D2D2D' }}>
                  {item.value}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
