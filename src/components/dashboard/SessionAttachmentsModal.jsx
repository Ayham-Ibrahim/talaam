import { X } from 'lucide-react';
import { SessionAttachmentsPanel } from './SessionAttachmentsPanel';
import { useT } from '@/hooks/useT';

/** نافذة "ملفات الجلسة" لجداول الجلسات التي لا صفحة تفاصيل لها (الطالب، الأدمن) */
export function SessionAttachmentsModal({ sessionId, canUpload = true, onClose }) {
  const t = useT();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end px-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            aria-label={t('dashboard.sessionAttachments.close')}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-line/40 hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>
        <SessionAttachmentsPanel sessionId={sessionId} canUpload={canUpload} className="border-0 shadow-none" />
      </div>
    </div>
  );
}
