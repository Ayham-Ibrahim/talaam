import { useState } from 'react';
import { Check, Copy, X } from 'lucide-react';
import { formatDateTime } from '@/lib/formatters';
import { useT } from '@/hooks/useT';

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

/** روابط BBB المباشرة للجلسة (معلم/طالب) — للنسخ وإرسالها يدوياً */
export function AdminSessionLinksModal({ session, onClose }) {
  const t = useT();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-3xl rounded-2xl bg-white p-8 shadow-lift" onClick={(e) => e.stopPropagation()}>
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
      </div>
    </div>
  );
}
