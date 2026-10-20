import { X } from 'lucide-react';
import { RescheduleStatusBadge } from './RescheduleStatusBadge';
import { Skeleton } from '@/components/ui';
import { useAdminRescheduleRequestDetails } from '@/hooks/useAdminComplaints';
import { TEACHER_SESSION_STATUS_STYLES } from '@/mocks/teacherDashboard.mock';
import { formatDateTime } from '@/lib/formatters';
import { useT } from '@/hooks/useT';

const ROLE_STYLES = {
  teacher: { labelKey: 'dashboard.adminReschedule.requesterTeacher', className: 'bg-primary/10 text-primary' },
  student: { labelKey: 'dashboard.adminReschedule.requesterStudent', className: 'bg-[#FDF8F0] text-[#FF8D28]' },
};

function InfoRow({ label, value, ltr = false }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line/60 pb-2.5 last:border-b-0 last:pb-0">
      <span className="shrink-0 text-sm text-ink-soft">{label}</span>
      <span className="text-left text-sm font-semibold text-ink" dir={ltr ? 'ltr' : undefined}>
        {value}
      </span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="flex flex-col gap-2.5 rounded-xl border border-line p-4">
      <h4 className="text-sm font-bold text-primary">{title}</h4>
      {children}
    </section>
  );
}

function TextBlock({ label, text, tone = 'default' }) {
  if (!text) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm text-ink-soft">{label}</span>
      <p
        className={`whitespace-pre-wrap break-words rounded-xl p-3 text-sm ${
          tone === 'danger' ? 'bg-accent-pink/10 text-accent-pink' : 'bg-canvas text-ink'
        }`}
      >
        {text}
      </p>
    </div>
  );
}

/**
 * كل تفاصيل طلب التأجيل لعمود "الإجراءات" — يُعرض صف الجدول فوراً ثم تُكمَّل
 * بقية الحقول (الجلسة، المراجِع، ملاحظات الأدمن…) من GET /reschedule-requests/{id}.
 * كل التواريخ بتوقيت الطالب، بنفس منطق الجدول نفسه.
 */
export function RescheduleRequestDetailsModal({ request: listRow, onClose }) {
  const t = useT();
  const { data, isLoading } = useAdminRescheduleRequestDetails(listRow?.id);

  if (!listRow) return null;

  const r = { ...listRow, ...(data ?? {}) };
  const tz = r.studentTimezone;
  const dt = (value) => (value ? formatDateTime(value, tz) : null);
  const role = ROLE_STYLES[r.requesterRole];
  const k = (key) => t(`dashboard.adminReschedule.detailsModal.${key}`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line p-5">
          <button
            type="button"
            onClick={onClose}
            aria-label={t('dashboard.adminReschedule.cancel')}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-line/40 hover:text-ink"
          >
            <X size={18} />
          </button>
          <h3 className="flex-1 text-center text-lg font-bold text-ink">
            {k('title')} <span className="text-ink-soft">#{r.id}</span>
          </h3>
          <RescheduleStatusBadge status={r.status} />
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto p-5 text-right">
          <Section title={k('requesterSection')}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-ink">{r.requesterName || '—'}</span>
              {role && <span className={`rounded-pill px-2 py-0.5 text-xs font-bold ${role.className}`}>{t(role.labelKey)}</span>}
            </div>
            <InfoRow label={k('email')} value={r.requesterEmail} ltr />
            <InfoRow label={k('phone')} value={r.requesterPhone} ltr />
            <InfoRow label={k('timezone')} value={r.requesterTimezone} ltr />
            <TextBlock label={t('dashboard.adminReschedule.reason')} text={r.reason || t('dashboard.adminReschedule.noReason')} />
          </Section>

          <Section title={k('sessionSection')}>
            <InfoRow label={t('dashboard.adminComplaints.colTeacher')} value={r.teacherName} />
            <InfoRow label={t('dashboard.adminComplaints.colStudent')} value={r.studentName} />
            <InfoRow label={k('package')} value={r.packageTitle} />
            <InfoRow label={k('sequenceNo')} value={r.sessionSequenceNo} />
            <InfoRow label={k('duration')} value={r.sessionDurationMin ? `${r.sessionDurationMin} ${k('minutes')}` : null} />
            <InfoRow label={k('sessionStatus')} value={TEACHER_SESSION_STATUS_STYLES[r.sessionStatus]?.label ?? r.sessionStatus} />
            <InfoRow label={k('sessionCurrentTime')} value={dt(r.sessionCurrentScheduledAt)} ltr />
            <InfoRow label={k('studentTimezone')} value={tz} ltr />
          </Section>

          <Section title={k('requestSection')}>
            <InfoRow label={t('dashboard.adminReschedule.colOriginal')} value={dt(r.originalScheduledAt)} ltr />
            <InfoRow
              label={t('dashboard.adminReschedule.colProposed')}
              value={r.proposedScheduledAt ? dt(r.proposedScheduledAt) : t('dashboard.adminReschedule.absenceReport')}
              ltr={Boolean(r.proposedScheduledAt)}
            />
            <InfoRow label={t('dashboard.adminReschedule.colCreated')} value={dt(r.createdAt)} ltr />
            <InfoRow
              label={k('hoursBefore')}
              value={r.hoursBeforeSession != null ? `${r.hoursBeforeSession} ${k('hours')}` : null}
            />
            <InfoRow
              label={t('dashboard.adminReschedule.colWindow')}
              value={t(r.withinFreeWindow ? 'dashboard.adminReschedule.withinWindow' : 'dashboard.adminReschedule.outsideWindow')}
            />
            <InfoRow label={k('slaDue')} value={dt(r.slaDueAt)} ltr />
          </Section>

          <Section title={k('reviewSection')}>
            {r.status === 'pending' ? (
              <p className="text-sm text-ink-soft">{k('notReviewed')}</p>
            ) : (
              <>
                <InfoRow label={k('reviewer')} value={r.reviewerName} />
                <InfoRow label={k('reviewedAt')} value={dt(r.reviewedAt)} ltr />
                <InfoRow label={k('alternative')} value={dt(r.alternativeScheduledAt)} ltr />
                <TextBlock label={k('adminNotes')} text={r.adminNotes} />
                <TextBlock label={k('rejectionReason')} text={r.rejectionReason} tone="danger" />
              </>
            )}
          </Section>

          {isLoading && <Skeleton className="h-6 rounded-xl" />}
        </div>
      </div>
    </div>
  );
}
