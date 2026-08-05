import { AlertTriangle, BookOpen, CalendarClock, Clock, Users, Video } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useTeacherSessionDetails } from '@/hooks/useDashboard';
import { TEACHER_SESSION_STATUS_STYLES } from '@/mocks/teacherDashboard.mock';
import { formatDateTime } from '@/lib/formatters';
import { useT } from '@/hooks/useT';

export function TeacherSessionDetailsPage() {
  const t = useT();
  const { user } = useAuth();
  const { id } = useParams();
  const { data: session, isLoading, isError, refetch } = useTeacherSessionDetails(id);

  if (!user) return <Navigate to="/login" replace />;

  const statusStyle = session ? TEACHER_SESSION_STATUS_STYLES[session.status] : null;
  const title = session ? (session.booking?.package?.title ?? session.course?.title ?? '—') : '';
  const canJoin = session && (session.status === 'scheduled' || session.status === 'active') && session.join_url_teacher;
  const showReason = session && ['cancelled', 'no_show_teacher', 'no_show_student'].includes(session.status) && session.cancellation_reason;

  const ITEMS = session
    ? [
        { key: 'date', icon: CalendarClock, label: t('dashboard.teacherSessions.date'), value: formatDateTime(session.scheduled_at) },
        { key: 'duration', icon: Clock, label: t('dashboard.teacherSessions.duration'), value: `${session.duration_min} ${t('dashboard.addPackage.review.durationUnit')}` },
        { key: 'subject', icon: BookOpen, label: t('dashboard.teacherSessions.package'), value: title },
        { key: 'attendees', icon: Users, label: t('dashboard.teacherSessions.attendeesCount'), value: session.attendees?.length ?? 0 },
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
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-center">
            <span
              className="rounded-pill px-5 py-2 text-sm font-bold"
              style={{ backgroundColor: statusStyle?.bg, color: statusStyle?.color }}
            >
              {statusStyle?.label}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 rounded-2xl border border-[#F2F2F7] bg-white p-6 shadow-card sm:flex-nowrap sm:divide-x sm:divide-x-reverse sm:divide-line sm:gap-0">
            {ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.key} className="flex flex-1 flex-col items-center gap-2 px-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EDF0F5]">
                    <Icon size={22} className="text-primary" />
                  </div>
                  <span className="text-sm text-ink-soft">{item.label}</span>
                  <span className="font-bold text-[#2D2D2D]">{item.value}</span>
                </div>
              );
            })}
          </div>

          {showReason && (
            <div className="flex items-start gap-3 rounded-2xl bg-accent-pink/10 p-5">
              <AlertTriangle size={20} className="mt-0.5 shrink-0 text-accent-pink" />
              <p className="text-sm text-ink">{session.cancellation_reason}</p>
            </div>
          )}

          {session.attendees?.length > 0 && (
            <div className="rounded-2xl border border-[#F2F2F7] bg-white p-5 shadow-card">
              <h3 className="mb-3 text-right text-sm font-bold text-ink">{t('dashboard.teacherSessions.attendeesTitle')}</h3>
              <ul className="flex flex-col divide-y divide-line">
                {session.attendees.map((attendee) => (
                  <li key={attendee.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-ink-soft">{attendee.attendance}</span>
                    <span className="font-semibold text-ink">{attendee.student?.user?.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {canJoin && (
            <button
              type="button"
              onClick={() => window.open(session.join_url_teacher, '_blank')}
              className="mx-auto flex items-center gap-2 rounded-xl border-2 border-primary bg-primary px-8 py-3 text-sm font-medium text-white hover:bg-primary-hover"
            >
              <Video size={18} />
              {t('dashboard.teacherSessions.join')}
            </button>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
