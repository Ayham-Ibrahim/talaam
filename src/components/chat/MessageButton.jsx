import { MessageCircle } from 'lucide-react';
import { useOpenConversationWith } from '@/hooks/useChat';
import { useT } from '@/hooks/useT';

/**
 * زر "مراسلة" في صفحات الحجز/الكورس/باقة الدعم/قائمة الطلاب. المحادثة تُفتح تلقائياً عند
 * التأكيد — إن لم تكن قائمة (404) تظهر رسالة الباك بدل الانتقال.
 */
export function MessageButton({ userId, className, label }) {
  const t = useT();
  const open = useOpenConversationWith();

  if (!userId) return null;

  return (
    <span className="inline-flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={() => open.mutate(userId)}
        disabled={open.isPending}
        className={
          className ??
          'inline-flex items-center gap-1.5 rounded-xl border border-primary bg-white px-4 py-2 text-xs font-medium text-primary hover:bg-primary/10 disabled:opacity-50'
        }
      >
        <MessageCircle size={14} />
        {label ?? t('chat.messageButton')}
      </button>
      {open.isError && <span className="max-w-[220px] text-center text-[11px] text-accent-pink">{open.error?.message}</span>}
    </span>
  );
}
