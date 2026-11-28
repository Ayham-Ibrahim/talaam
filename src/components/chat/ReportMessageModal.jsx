import { useState } from 'react';
import { Flag, X } from 'lucide-react';
import { Button } from '@/components/ui';
import { useReportMessage } from '@/hooks/useChat';
import { useT } from '@/hooks/useT';

/** الإبلاغ عن رسالة الطرف الآخر — يُنشئ شكوى للإدارة مرتبطة بالمحادثة */
export function ReportMessageModal({ message, onClose }) {
  const t = useT();
  const [description, setDescription] = useState('');
  const report = useReportMessage();

  return (
    <div dir="rtl" className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-bold text-ink">
            <Flag size={18} className="text-accent-pink" />
            {t('chat.reportTitle')}
          </h2>
          <button type="button" onClick={onClose} aria-label={t('chat.close')} className="text-ink-soft hover:text-ink">
            <X size={18} />
          </button>
        </div>

        {report.isSuccess ? (
          <div className="space-y-4">
            <p className="text-sm text-ink">{t('chat.reportSent')}</p>
            <p className="text-xs text-ink-soft">
              {t('chat.reportReference')} {report.data?.reference}
            </p>
            <Button className="w-full" onClick={onClose}>
              {t('chat.close')}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <blockquote className="rounded-xl bg-line/30 px-3 py-2 text-sm text-ink-soft">
              {message.is_deleted ? t('chat.deletedMessage') : message.body}
            </blockquote>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              rows={4}
              placeholder={t('chat.reportPlaceholder')}
              className="w-full resize-none rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-primary"
            />
            {report.isError && <p className="text-xs text-accent-pink">{report.error?.message}</p>}
            <div className="flex gap-2">
              <Button
                className="flex-1"
                disabled={report.isPending}
                onClick={() => report.mutate({ messageId: message.id, description })}
              >
                {t('chat.reportSubmit')}
              </Button>
              <Button variant="ghost" onClick={onClose}>
                {t('chat.cancel')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
