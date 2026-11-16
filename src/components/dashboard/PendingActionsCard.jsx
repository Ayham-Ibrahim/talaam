import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BellRing, CalendarPlus, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNow } from '@/hooks/useNow';
import { usePendingActions, useRespondRescheduleRequest } from '@/hooks/useReschedule';
import { formatDateTime } from '@/lib/formatters';
import { timeLeft } from '@/lib/pendingActions';
import { MakeupRequestModal } from './MakeupRequestModal';
import { useT } from '@/hooks/useT';

function AwaitingItem({ item, t, tz, now, onDone }) {
  const respond = useRespondRescheduleRequest();
  const [error, setError] = useState(null);
  const isMakeup = item.type === 'makeup';
  const deadline = timeLeft(t, item.counterparty_deadline, now);

  const submit = (accept) => {
    if (!accept && !window.confirm(t('dashboard.pendingActions.declineConfirm'))) return;
    setError(null);
    respond.mutate(
      { requestId: item.id, accept },
      {
        onSuccess: (result) => onDone(result?.message),
        onError: (err) => setError(err?.message ?? t('dashboard.pendingActions.failed')),
      },
    );
  };

  return (
    <li className="rounded-xl border border-[#F5A623]/40 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="text-right">
          <div className="text-sm font-bold text-ink">
            {t(`dashboard.pendingActions.${isMakeup ? 'makeupTitle' : 'rescheduleTitle'}`).replace(
              '{name}',
              item.session?.other_party_name ?? item.requester_name ?? '',
            )}
          </div>
          {item.session?.title && <div className="text-xs text-ink-soft">{item.session.title}</div>}
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-pill px-3 py-1 text-xs font-bold ${
            deadline.urgent ? 'bg-accent-pink/10 text-accent-pink' : 'bg-[#F5A623]/15 text-[#B7791F]'
          }`}
        >
          <Clock size={13} />
          {deadline.text}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-ink-soft">
          {t(`dashboard.pendingActions.${isMakeup ? 'missed' : 'current'}`)}:{' '}
          <span dir="ltr" className={isMakeup ? 'text-ink' : 'text-ink-soft line-through'}>
            {formatDateTime(item.current_scheduled_at, tz)}
          </span>
        </span>
        <ArrowLeft size={16} className="text-primary" />
        <span className="font-bold text-primary">
          {t('dashboard.pendingActions.proposed')}: <span dir="ltr">{formatDateTime(item.proposed_scheduled_at, tz)}</span>
        </span>
      </div>
      {item.reason && <p className="mt-1 text-right text-xs text-ink-soft">{item.reason}</p>}
      {error && <p className="mt-2 text-right text-xs text-accent-pink">{error}</p>}

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={respond.isPending}
          onClick={() => submit(true)}
          className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
        >
          {t('dashboard.pendingActions.accept')}
        </button>
        <button
          type="button"
          disabled={respond.isPending}
          onClick={() => submit(false)}
          className="rounded-xl border border-[#FF383C] bg-[#FDF0F0] px-5 py-2 text-sm font-medium text-[#FF383C] hover:bg-[#FF383C]/10 disabled:opacity-50"
        >
          {t('dashboard.pendingActions.decline')}
        </button>
      </div>
    </li>
  );
}

/**
 * "بانتظار ردك" أعلى اللوحة الرئيسية للطالب والمعلم: طلبات تغيير موعد/موعد تعويضي ينتظر
 * ردهما (قبول/رفض مباشرة من هنا)، وجلسات غاب عنها المعلم يحق اقتراح موعد تعويضي لها.
 * لا يظهر إطلاقاً حين لا شيء ينتظر — بنفس أسلوب بطاقة المدفوعات المعلّقة.
 */
export function PendingActionsCard() {
  const t = useT();
  const { user } = useAuth();
  const now = useNow();
  const { data } = usePendingActions();
  const [makeupSession, setMakeupSession] = useState(null);
  const [message, setMessage] = useState('');

  const awaiting = data?.awaiting_response ?? [];
  const makeups = data?.makeup_eligible ?? [];
  const tz = user?.timezone;

  const showMessage = (msg) => {
    if (!msg) return;
    setMessage(msg);
    setTimeout(() => setMessage(''), 4000);
  };

  if (!awaiting.length && !makeups.length) {
    return message ? (
      <div className="rounded-2xl bg-success-light px-4 py-3 text-sm font-medium text-success">{message}</div>
    ) : null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border-2 border-[#F5A623] bg-[#FFF8EC] p-5 shadow-card"
    >
      <div className="mb-4 flex items-start gap-3">
        <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F5A623] text-white">
          <span className="absolute inset-0 animate-ping rounded-full bg-[#F5A623] opacity-30" />
          <BellRing size={22} />
        </span>
        <div className="text-right">
          <h3 className="flex items-center gap-2 font-bold text-ink">
            {t('dashboard.pendingActions.title')}
            <span className="rounded-full bg-[#F5A623] px-2 py-0.5 text-xs text-white">{awaiting.length + makeups.length}</span>
          </h3>
          <p className="text-sm text-[#B7791F]">{t('dashboard.pendingActions.hint')}</p>
        </div>
      </div>

      {message && <div className="mb-3 rounded-xl bg-success-light px-4 py-2 text-sm font-medium text-success">{message}</div>}

      <ul className="flex flex-col gap-3">
        {awaiting.map((item) => (
          <AwaitingItem key={`r-${item.id}`} item={item} t={t} tz={tz} now={now} onDone={showMessage} />
        ))}

        {makeups.map((session) => (
          <li key={`m-${session.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-white p-4">
            <div className="text-right">
              <div className="text-sm font-bold text-ink">{t('dashboard.pendingActions.makeupEligibleTitle')}</div>
              <div className="text-xs text-ink-soft">
                {[session.title, session.other_party_name].filter(Boolean).join(' — ')}
                {' · '}
                <span dir="ltr">{formatDateTime(session.scheduled_at, tz)}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMakeupSession(session)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-hover"
            >
              <CalendarPlus size={16} />
              {t('dashboard.makeupRequest.button')}
            </button>
          </li>
        ))}
      </ul>

      {makeupSession && (
        <MakeupRequestModal
          sessionId={makeupSession.id}
          missedScheduledAt={makeupSession.scheduled_at}
          onClose={() => setMakeupSession(null)}
          onDone={(msg) => {
            setMakeupSession(null);
            showMessage(msg);
          }}
        />
      )}
    </motion.div>
  );
}
