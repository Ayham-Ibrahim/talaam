import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Crown,
  GraduationCap,
  LayoutGrid,
  RotateCw,
  User,
} from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Avatar, ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useTeacherStudentDetails } from '@/hooks/useDashboard';
import { STUDENT_SESSION_HISTORY_STATUS_STYLES, TEACHER_SESSION_TYPE_STYLES } from '@/mocks/teacherDashboard.mock';
import { useT } from '@/hooks/useT';

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="flex items-center gap-2 text-sm text-[#626262]">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EDF0F5]">
          <Icon size={13} className="text-primary" />
        </span>
        {label}
      </span>
      <span className="font-bold text-[#2D2D2D]">{value}</span>
    </div>
  );
}

function SessionHistoryRow({ session }) {
  const statusStyle = STUDENT_SESSION_HISTORY_STATUS_STYLES[session.status];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-4">
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="font-semibold text-ink">{session.studentName}</div>
          <div className="text-sm text-ink-soft">{session.subject}</div>
        </div>
        <Avatar name={session.studentName} src={session.studentAvatar} size="md" className="!rounded-full" />
      </div>

      <span className="h-8 w-px bg-line" />

      <span
        className="rounded-pill px-4 py-1.5 text-xs font-medium"
        style={{ backgroundColor: statusStyle?.bg, color: statusStyle?.color }}
      >
        {statusStyle?.label}
      </span>

      <span className="h-8 w-px bg-line" />

      <div className="text-right">
        <div className="font-semibold text-ink">{session.day}</div>
        <div className="text-ink-soft">{session.date}</div>
      </div>

      <span className="h-8 w-px bg-line" />

      <div className="text-right">
        <div className="font-semibold text-ink">{session.time}</div>
        <div className="text-ink-soft">{session.duration} دقيقة</div>
      </div>
    </div>
  );
}

export function TeacherStudentDetailsPage() {
  const t = useT();
  const { user } = useAuth();
  const { id } = useParams();
  const { data: student, isLoading, isError, refetch } = useTeacherStudentDetails(id);

  if (!user) return <Navigate to="/login" replace />;

  const typeStyle = student ? TEACHER_SESSION_TYPE_STYLES[student.type] : null;
  const packageTypeValue = student
    ? student.type === 'training'
      ? typeStyle.label
      : `باقة ${typeStyle.label}`
    : '';

  return (
    <DashboardLayout>
      <div className="mb-4 flex items-center justify-end gap-2 text-sm">
        <span className="font-bold text-ink">{t('dashboard.teacherStudents.detailsTitle')}</span>
        <span className="h-1.5 w-1.5 rounded-full bg-line" />
        <Link to="/dashboard/teacher/students" className="font-bold text-primary hover:underline">
          {t('dashboard.nav.students')}
        </Link>
      </div>

      <div className="mb-4 flex justify-end">
        <Link
          to="/dashboard/teacher/students"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white hover:bg-primary-hover"
        >
          <ArrowRight size={18} />
        </Link>
      </div>

      {isError || (!isLoading && !student) ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-8 rounded-2xl bg-white p-6 shadow-card">
            <div className="flex min-w-[260px] flex-1 flex-col gap-4">
              <InfoRow icon={User} label={t('dashboard.teacherStudents.name')} value={student.studentName} />
              <InfoRow icon={BookOpen} label={t('dashboard.teacherStudents.subject')} value={student.subject} />
              <InfoRow icon={GraduationCap} label={t('dashboard.teacherStudents.level')} value={student.level} />
              <InfoRow icon={CalendarDays} label={t('dashboard.teacherStudents.joinDate')} value={student.joinDate} />
            </div>

            <div className="flex min-w-[260px] flex-1 flex-col gap-4">
              <InfoRow icon={Crown} label={t('dashboard.teacherStudents.package')} value={student.packageTitle} />
              <InfoRow icon={LayoutGrid} label={t('dashboard.teacherStudents.packageTypeLabel')} value={packageTypeValue} />
              <InfoRow
                icon={CheckCircle2}
                label={t('dashboard.teacherStudents.completedSessions')}
                value={String(student.completedSessions).padStart(2, '0')}
              />
              <InfoRow
                icon={RotateCw}
                label={t('dashboard.teacherStudents.remainingSessions')}
                value={String(student.remainingSessions).padStart(2, '0')}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-card">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <h3 className="flex items-center gap-2 font-bold text-ink">
                {t('dashboard.teacherStudents.sessionsTitle')}
                <CalendarDays size={20} className="text-primary" />
              </h3>
            </div>

            <div className="divide-y divide-line">
              {student.sessions.map((session) => (
                <SessionHistoryRow key={session.id} session={session} />
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
