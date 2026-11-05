import { useState } from 'react';
import { Check, Copy, X } from 'lucide-react';
import { formatDateTime } from '@/lib/formatters';
import { ATTENDANCE_STYLES } from '@/lib/sessionAttendance';
import { useAdminMarkAttendance } from '@/hooks/useAdminSessions';
import { useNow } from '@/hooks/useNow';
import { useT } from '@/hooks/useT';

/** يطابق SessionService::EARLY_JOIN_MINUTES — نافذة تسجيل الحضور هي نافذة الانضمام نفسها */
const EARLY_JOIN_MINUTES = 5;

/** نفس شرط SessionJoinLogService::recordByAdmin: جلسة قادمة، من قبل موعدها بخمس دقائق حتى نهايتها */
function isDuringSession(session, nowMs) {
  const startsAt = new Date(session.scheduledAt).getTime();
  if (session.status !== 'scheduled' || !Number.isFinite(startsAt)) return false;
  return nowMs >= startsAt - EARLY_JOIN_MINUTES * 60_000 && nowMs <= startsAt + (session.durationMin ?? 0) * 60_000;
}

function AttendanceSection({ session }) {
  const t = useT();
  const markAttendance = useAdminMarkAttendance();
  const canMark = isDuringSession(session, useNow());

  const rows = [
    {
      key: 'teacher',
      role: 'teacher',
      label: `${t('dashboard.adminSessions.attendance.teacher')} — ${session.teacherName ?? '—'}`,
      name: session.teacherName ?? t('dashboard.adminSessions.attendance.teacher'),
      log: session.joinLogs.find((log) => log.role === 'teacher'),
    },
    ...session.students.map((s) => ({
      key: `student-${s.studentId}`,
      role: 'student',
      studentId: s.studentId,
      label: s.name ?? '—',
      name: s.name ?? '—',
      log: session.joinLogs.find((log) => log.role === 'student' && String(log.studentId) === String(s.studentId)),
    })),
  ];

  const mark = async (row) => {
    if (!window.confirm(t('dashboard.adminSessions.attendance.markConfirm').replace('{name}', row.name))) return;
    try {
      await markAttendance.mutateAsync({ sessionId: session.id, role: row.role, studentId: row.studentId });
    } catch (err) {
      window.alert(err?.message ?? t('dashboard.adminSessions.attendance.markFailed'));
    }
  };

  return (
    <div className="mt-6 border-t border-line pt-5 text-right">
      <h4 className="mb-3 text-sm font-bold text-ink">{t('dashboard.adminSessions.attendance.title')}</h4>
      <div className="flex flex-col divide-y divide-line">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center justify-between gap-3 py-2.5">
            <span className="text-sm text-ink">{row.label}</span>
            {row.log ? (
              <div className="flex items-center gap-2">
                {row.log.manual && (
                  <span className="text-xs font-medium text-primary" title={t('dashboard.adminSessions.attendance.manualHint')}>
                    {t('dashboard.adminSessions.attendance.manual')}
                  </span>
                )}
                <span
                  className="rounded-pill px-3 py-1 text-xs font-medium"
                  style={{ backgroundColor: ATTENDANCE_STYLES.joined.bg, color: ATTENDANCE_STYLES.joined.color }}
                >
                  {t('dashboard.adminSessions.attendance.joined')}
                </span>
              </div>
            ) : canMark ? (
              <button
                type="button"
                disabled={markAttendance.isPending}
                onClick={() => mark(row)}
                className="rounded-xl border border-primary bg-[#EDF0F5] px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 disabled:opacity-50"
              >
                {t('dashboard.adminSessions.attendance.mark')}
              </button>
            ) : (
              <span className="text-xs text-ink-soft">—</span>
            )}
          </div>
        ))}
      </div>
      {!canMark && <p className="mt-3 text-xs text-ink-soft">{t('dashboard.adminSessions.attendance.onlyDuringSession')}</p>}
    </div>
  );
}

function LinkRow({ label, url }) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // الحافظة غير متاحة — الرابط ظاهر في الحقل للنسخ يدوياً
    }
  };

  return (
    <div className="flex flex-col gap-1.5 text-right">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-primary bg-[#EDF0F5] px-3 py-2 text-xs font-medium text-primary hover:bg-primary/10"
        >
          {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
          {t(copied ? 'dashboard.adminSessions.linkCopied' : 'dashboard.adminSessions.copyLink')}
        </button>
        <input
          type="text"
          readOnly
          dir="ltr"
          value={url}
          onFocus={(e) => e.target.select()}
          className="w-full min-w-0 rounded-btn border border-line bg-surface p-3 text-sm text-ink focus:border-primary focus:outline-none"
        />
      </div>
    </div>
  );
}

/** روابط BBB المباشرة للجلسة (معلم/طالب) — للنسخ وإرسالها يدوياً، وتسجيل حضورهما يدوياً أثناء الجلسة */
export function AdminSessionLinksModal({ session, onClose }) {
  const t = useT();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-8 shadow-lift" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            aria-label={t('dashboard.adminSessions.cancel')}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-line/40 hover:text-ink"
          >
            <X size={18} />
          </button>
          <h3 className="flex-1 text-center text-lg font-bold text-ink">{t('dashboard.adminSessions.linksTitle')}</h3>
          <span className="w-8" />
        </div>

        <div className="mb-4 rounded-xl bg-surface p-3 text-right text-sm">
          <div className="font-semibold text-ink">{session.title ?? '—'}</div>
          <div className="mt-1 text-ink-soft">
            <span dir="ltr">{formatDateTime(session.scheduledAt)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {session.joinUrlTeacher && (
            <LinkRow label={`${t('dashboard.adminSessions.teacherLink')} — ${session.teacherName ?? '—'}`} url={session.joinUrlTeacher} />
          )}
          {session.joinUrlStudent && (
            <LinkRow
              label={`${t('dashboard.adminSessions.studentLink')} — ${session.studentNames.join('، ') || '—'}`}
              url={session.joinUrlStudent}
            />
          )}
        </div>

        <AttendanceSection session={session} />
      </div>
    </div>
  );
}
