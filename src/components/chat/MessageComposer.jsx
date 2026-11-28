import { useEffect, useRef, useState } from 'react';
import { Pencil, SendHorizontal, X } from 'lucide-react';
import { useT } from '@/hooks/useT';

/** يطابق Message::MAX_LENGTH في الباك اند */
export const MESSAGE_MAX_LENGTH = 2000;

/** خطأ 422 من الباك (فلترة الأرقام/الروابط، الطول، الحظر) يظهر كما هو تحت الحقل */
function errorText(error) {
  if (!error) return null;
  const fieldErrors = error.errors?.body ?? error.errors?.conversation;
  return fieldErrors?.[0] ?? error.message;
}

export function MessageComposer({ disabled, editingMessage, onCancelEdit, onSubmit, onTyping, isSubmitting, error }) {
  const t = useT();
  const [body, setBody] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    setBody(editingMessage ? editingMessage.body : '');
    if (editingMessage) textareaRef.current?.focus();
  }, [editingMessage]);

  // ارتفاع تلقائي حتى 5 أسطر تقريباً
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [body]);

  const submit = async () => {
    const text = body.trim();
    if (!text || disabled || isSubmitting) return;
    try {
      await onSubmit(text);
      setBody('');
    } catch {
      // الخطأ يُعرض عبر prop error — يبقى النص ليعدّله المستخدم
    }
  };

  const message = errorText(error);
  const nearLimit = body.length > MESSAGE_MAX_LENGTH - 200;

  return (
    <div className="border-t border-line/60 bg-white p-3">
      {editingMessage && (
        <div className="mb-2 flex items-center justify-between rounded-xl bg-primary/5 px-3 py-1.5 text-xs text-primary">
          <span className="flex items-center gap-1.5 font-semibold">
            <Pencil size={13} />
            {t('chat.editingMessage')}
          </span>
          <button type="button" onClick={onCancelEdit} aria-label={t('chat.cancel')}>
            <X size={14} />
          </button>
        </div>
      )}

      {message && <div className="mb-2 rounded-xl bg-accent-pink/10 px-3 py-2 text-xs text-accent-pink">{message}</div>}

      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          rows={1}
          value={body}
          maxLength={MESSAGE_MAX_LENGTH}
          disabled={disabled}
          onChange={(e) => {
            setBody(e.target.value);
            if (!editingMessage) onTyping?.();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit();
            }
            if (e.key === 'Escape' && editingMessage) onCancelEdit();
          }}
          placeholder={disabled ? t('chat.disabledPlaceholder') : t('chat.placeholder')}
          className="max-h-[140px] min-h-[44px] flex-1 resize-none rounded-2xl border border-line bg-[#FAFBFD] px-4 py-2.5 text-sm text-ink outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="button"
          onClick={submit}
          disabled={disabled || isSubmitting || !body.trim()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white hover:bg-primary-hover disabled:opacity-40"
          aria-label={editingMessage ? t('chat.saveEdit') : t('chat.send')}
        >
          <SendHorizontal size={18} className="-scale-x-100" />
        </button>
      </div>

      <div className="mt-1 flex justify-between px-1 text-[11px] text-ink-soft">
        <span>{t('chat.contactInfoHint')}</span>
        {nearLimit && (
          <span className={body.length >= MESSAGE_MAX_LENGTH ? 'text-accent-pink' : ''}>
            {body.length}/{MESSAGE_MAX_LENGTH}
          </span>
        )}
      </div>
    </div>
  );
}
