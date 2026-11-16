import { useState } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { ApiErrorList } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useRespondRescheduleRequest } from '@/hooks/useReschedule';
import { formatDateTime } from '@/lib/formatters';
import { useT } from '@/hooks/useT';

/**
 * الطرف الآخر في الجلسة يرد على اقتراح موعد جديد: الموافقة تطبّقه فوراً بلا إدارة،
 * والرفض يحيل الطلب للإدارة لتقرر. بلا رد قبل المهلة يُحال للإدارة تلقائياً.
 * `request` = pending_reschedule_request كما يرسله ClassSessionResource.
 */
export function RescheduleResponseModal({ request, onClose, onDone }) {
  const t = useT();
  const { user } = useAuth();
  const respond = useRespondRescheduleRequest();
  const [choice, setChoice] = useState(null);
  const tz = user?.timezone;

  const submit = (accept) => {
    setChoice(accept);
    respond.mutate(
      { requestId: request.id, accept },
      { onSuccess: (result) => onDone?.(result?.message) },
    );
  };

  const requesterLabel = t(`dashboard.rescheduleResponse.requester.${request.requester_role}`);
  // makeup: current_scheduled_at = الجلسة الفائتة، والموافقة تُنشئ جلسة تعويضية بالموعد المقترح
  const isMakeup = request.type === 'makeup';
  const text = (key) => t(`dashboard.rescheduleResponse.${isMakeup ? 'makeup.' : ''}${key}`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-right text-lg font-bold text-ink">{text('title')}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('dashboard.rescheduleResponse.close')}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-line/40 hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mb-4 text-right text-sm text-ink">
          {text('intro').replace('{requester}', requesterLabel)}
        </p>

        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl bg-[#F7F8FD] p-4 text-sm">
          <div className="text-right">
            <div className="text-xs text-ink-soft">{text('current')}</div>
            <div className={`font-semibold text-ink-soft ${isMakeup ? '' : 'line-through'}`} dir="ltr">
              {formatDateTime(request.current_scheduled_at, tz)}
            </div>
          </div>
          <ArrowLeft size={18} className="shrink-0 text-primary" />
          <div className="text-right">
            <div className="text-xs text-ink-soft">{t('dashboard.rescheduleResponse.proposed')}</div>
            <div className="font-bold text-primary" dir="ltr">{formatDateTime(request.proposed_scheduled_at, tz)}</div>
          </div>
        </div>

        {request.reason && (
          <div className="mb-4 text-right text-sm">
            <span className="text-ink-soft">{t('dashboard.rescheduleResponse.reason')}: </span>
            <span className="text-ink">{request.reason}</span>
          </div>
        )}

        <p className="mb-4 text-right text-xs text-ink-soft">
          {t('dashboard.rescheduleResponse.deadline').replace('{deadline}', formatDateTime(request.counterparty_deadline, tz))}
        </p>

        <ApiErrorList error={respond.error} className="mb-4" />

        <div className="flex gap-3">
          <button
            type="button"
            disabled={respond.isPending}
            onClick={() => submit(true)}
            className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {respond.isPending && choice === true ? t('dashboard.rescheduleResponse.sending') : text('accept')}
          </button>
          <button
            type="button"
            disabled={respond.isPending}
            onClick={() => submit(false)}
            className="flex-1 rounded-xl border border-[#FF383C] bg-[#FDF0F0] px-4 py-3 text-sm font-medium text-[#FF383C] hover:bg-[#FF383C]/10 disabled:opacity-50"
          >
            {respond.isPending && choice === false ? t('dashboard.rescheduleResponse.sending') : t('dashboard.rescheduleResponse.decline')}
          </button>
        </div>
        <p className="mt-3 text-right text-xs text-ink-soft">{t('dashboard.rescheduleResponse.declineHint')}</p>
      </div>
    </div>
  );
}
