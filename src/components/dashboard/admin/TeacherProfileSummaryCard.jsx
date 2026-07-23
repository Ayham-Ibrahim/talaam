import { Mail, Phone, CalendarDays, GraduationCap, AlertTriangle } from 'lucide-react';
import { Avatar } from '@/components/ui';
import { TeacherStatusBadge } from './TeacherStatusBadge';
import { TEACHER_TYPE_LABELS } from '@/mocks/admin.mock';
import { formatDate } from '@/lib/formatters';
import { useT } from '@/hooks/useT';

function InfoRow({ icon: Icon, label, value, dir }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line/60 pb-3">
      <span className="flex items-center gap-1.5 text-sm text-ink-soft">
        {label}
        <Icon size={14} />
      </span>
      <span className="text-sm font-semibold text-ink" dir={dir}>
        {value}
      </span>
    </div>
  );
}

export function TeacherProfileSummaryCard({ teacher, actions, isActing }) {
  const t = useT();

  return (
    <div className="rounded-2xl border border-[#F2F2F7] bg-white p-5 shadow-card sm:p-6">
      <div className="flex flex-col items-center gap-3 border-b border-line/60 pb-5 text-center sm:flex-row sm:justify-between sm:text-right">
        <div className="flex flex-col items-center gap-3 sm:flex-row-reverse">
          <Avatar name={teacher.name} src={teacher.avatar} size="lg" />
          <div>
            <h2 className="text-lg font-bold text-ink">{teacher.name}</h2>
            <div className="mt-1">
              <TeacherStatusBadge status={teacher.status} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <InfoRow icon={Mail} label={t('dashboard.adminTeacherDetail.email')} value={teacher.email} dir="ltr" />
        <InfoRow icon={Phone} label={t('dashboard.adminTeacherDetail.phone')} value={teacher.phone} dir="ltr" />
        <InfoRow icon={GraduationCap} label={t('dashboard.adminTeacherDetail.type')} value={TEACHER_TYPE_LABELS[teacher.type]} />
        <InfoRow icon={CalendarDays} label={t('dashboard.adminTeacherDetail.submittedAt')} value={formatDate(teacher.submittedAt)} />
        {teacher.verifiedAt && (
          <InfoRow icon={CalendarDays} label={t('dashboard.adminTeacherDetail.verifiedAt')} value={formatDate(teacher.verifiedAt)} />
        )}
      </div>

      {teacher.bio && <p className="mt-4 text-right text-sm leading-relaxed text-ink-soft">{teacher.bio}</p>}

      {teacher.rejectionReason && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-accent-pink/10 p-3 text-right">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-accent-pink" />
          <div>
            <div className="text-xs font-bold text-accent-pink">{t('dashboard.adminTeacherDetail.rejectionReason')}</div>
            <div className="text-sm text-ink">{teacher.rejectionReason}</div>
          </div>
        </div>
      )}

      {teacher.suspensionReason && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#F2F2F7] p-3 text-right">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-ink-soft" />
          <div>
            <div className="text-xs font-bold text-ink-soft">{t('dashboard.adminTeacherDetail.suspensionReason')}</div>
            <div className="text-sm text-ink">{teacher.suspensionReason}</div>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        {teacher.status === 'pending' && (
          <>
            <button
              type="button"
              disabled={isActing}
              onClick={actions.onApprove}
              className="flex-1 rounded-xl bg-success py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {t('dashboard.adminTeacherDetail.approveTeacher')}
            </button>
            <button
              type="button"
              disabled={isActing}
              onClick={actions.onReject}
              className="flex-1 rounded-xl border border-accent-pink py-3 text-sm font-medium text-accent-pink transition-colors hover:bg-accent-pink/5 disabled:opacity-50"
            >
              {t('dashboard.adminTeacherDetail.rejectTeacher')}
            </button>
          </>
        )}

        {teacher.status === 'verified' && (
          <button
            type="button"
            disabled={isActing}
            onClick={actions.onSuspend}
            className="flex-1 rounded-xl border border-accent-pink py-3 text-sm font-medium text-accent-pink transition-colors hover:bg-accent-pink/5 disabled:opacity-50"
          >
            {t('dashboard.adminTeacherDetail.suspendTeacher')}
          </button>
        )}

        {teacher.status === 'rejected' && (
          <button
            type="button"
            disabled={isActing}
            onClick={actions.onApprove}
            className="flex-1 rounded-xl bg-success py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {t('dashboard.adminTeacherDetail.approveTeacher')}
          </button>
        )}

        {teacher.status === 'suspended' && (
          <button
            type="button"
            disabled={isActing}
            onClick={actions.onReactivate}
            className="flex-1 rounded-xl bg-success py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {t('dashboard.adminTeacherDetail.reactivateTeacher')}
          </button>
        )}
      </div>
    </div>
  );
}
