import { Link } from 'react-router-dom';
import { Check, CheckCheck, Flag, Paperclip, Pencil, Trash2 } from 'lucide-react';
import { useT } from '@/hooks/useT';
import { formatMessageTime } from './chatFormat';

/** رابط رسالة النظام: "تم رفع مرفق للجلسة" يفتح صفحة الجلسة الحالية لكل دور */
function systemMessageLink(message, role) {
  if (message.meta?.event !== 'session_attachment_uploaded') return null;
  return role === 'teacher'
    ? `/dashboard/teacher/sessions/${message.meta.class_session_id}`
    : '/dashboard/student/sessions';
}

export function MessageBubble({ message, isOwn, canModify, canReport, role, onEdit, onDelete, onReport }) {
  const t = useT();

  if (message.type === 'system') {
    const link = systemMessageLink(message, role);
    return (
      <div className="flex justify-center py-1">
        <div className="max-w-[85%] rounded-pill bg-line/40 px-4 py-1.5 text-center text-xs text-ink-soft">
          {message.body}
          {link && (
            <Link to={link} className="mr-2 inline-flex items-center gap-1 font-semibold text-primary hover:underline">
              <Paperclip size={12} />
              {t('chat.openAttachments')}
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`group flex flex-col ${isOwn ? 'items-start' : 'items-end'}`}>
      <div
        className={`max-w-[80%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-6 ${
          message.is_deleted
            ? 'border border-dashed border-line bg-white italic text-ink-soft'
            : isOwn
              ? 'rounded-tr-md bg-primary text-white'
              : 'rounded-tl-md bg-white text-ink shadow-card'
        }`}
      >
        {message.is_deleted ? t('chat.deletedMessage') : message.body}
      </div>

      <div className="mt-1 flex items-center gap-2 px-1 text-[11px] text-ink-soft">
        <span>{formatMessageTime(message.created_at)}</span>
        {message.is_edited && !message.is_deleted && <span>· {t('chat.edited')}</span>}
        {isOwn && !message.is_deleted && (
          message.read_at ? (
            <CheckCheck size={14} className="text-primary" aria-label={t('chat.read')} />
          ) : (
            <Check size={14} aria-label={t('chat.sent')} />
          )
        )}
        {canModify && (
          <>
            <button type="button" onClick={() => onEdit(message)} className="hover:text-primary" aria-label={t('chat.edit')}>
              <Pencil size={13} />
            </button>
            <button type="button" onClick={() => onDelete(message)} className="hover:text-accent-pink" aria-label={t('chat.delete')}>
              <Trash2 size={13} />
            </button>
          </>
        )}
        {canReport && (
          <button
            type="button"
            onClick={() => onReport(message)}
            className="opacity-0 transition-opacity hover:text-accent-pink focus:opacity-100 group-hover:opacity-100"
            aria-label={t('chat.report')}
            title={t('chat.report')}
          >
            <Flag size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
