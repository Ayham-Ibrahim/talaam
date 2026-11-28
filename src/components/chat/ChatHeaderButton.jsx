import { NavLink } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { CHAT_PATH, useChatEnabled, useChatUnreadCount } from '@/hooks/useChat';
import { useT } from '@/hooks/useT';

/** أيقونة المحادثات في هيدر اللوحة مع عدد الرسائل غير المقروءة */
export function ChatHeaderButton({ className }) {
  const t = useT();
  const enabled = useChatEnabled();
  const { data: unreadCount } = useChatUnreadCount();

  if (!enabled) return null;

  return (
    <NavLink
      to={CHAT_PATH}
      aria-label={t('chat.title')}
      className={className ?? 'relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-line/40'}
    >
      <MessageCircle size={18} className="text-[#2D2D2D]" />
      {!!unreadCount && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-pink px-1 text-[10px] font-bold text-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </NavLink>
  );
}
