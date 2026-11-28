import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { MessageCircle, X } from 'lucide-react';
import { queryKeys } from '@/api/queryKeys';
import { useAuthStore } from '@/store';
import { connectEcho } from '@/lib/echo';
import { findCachedConversation, refreshConversationList } from '@/lib/chatCache';
import { CHAT_PATH, useChatEnabled } from '@/hooks/useChat';
import { useT } from '@/hooks/useT';

const TOAST_MS = 6000;
/** أقصى تأخير عشوائي لجلب ما فات بعد عودة الاتصال — يوزّع موجة إعادة الاتصال الجماعية */
const RECONNECT_JITTER_MS = 5000;

/**
 * يُركَّب مرة واحدة على مستوى الموجّه (AppRouter) لا داخل DashboardLayout: كل صفحة لوحة
 * تركّب تخطيطها من جديد، فكان الاشتراك يُعاد (طلب مصادقة) مع كل تنقل ويختفي الـ toast.
 * يفتح اتصال WebSocket لطرف المحادثة المسجّل ويستمع لقناته الخاصة: chat.updated يحدّث
 * عداد الهيدر وقائمة المحادثات ويعرض toast إن لم يكن داخل تلك المحادثة، و
 * conversation.status_changed (حظر إداري) يحدّث القائمة. الاشتراك فيها هو أيضاً ما يجعله
 * "متصلاً" فلا يصله إشعار database (NewChatMessage::isOnline). عند عودة الاتصال بعد انقطاع
 * يُعيد جلب كل ما يخص المحادثة.
 */
export function ChatRealtimeBridge() {
  const t = useT();
  const enabled = useChatEnabled();
  const token = useAuthStore((s) => s.token);
  // المعرّف لا الكائن: user يُستبدل بكائن جديد عند كل مزامنة فيُعاد الاشتراك بلا داعٍ
  const userId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const pathRef = useRef(location.pathname);
  pathRef.current = location.pathname;

  useEffect(() => {
    if (!enabled || !userId) return undefined;
    const echo = connectEcho(token);
    if (!echo) return undefined;

    const channelName = `user.${userId}`;
    const channel = echo.private(channelName);
    channel.listen('.conversation.status_changed', (event) => {
      refreshConversationList(queryClient);
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.conversation(event.conversation_id) });
    });
    channel.listen('.chat.updated', (event) => {
      queryClient.setQueryData(queryKeys.chat.unreadCount(), event.unread_total);

      // الاسم من القائمة قبل تحديثها (القصّ قد يُسقط محادثة من صفحة لاحقة)
      const conversation = findCachedConversation(queryClient, event.conversation_id);
      refreshConversationList(queryClient);

      const message = event.last_message;
      const insideConversation = pathRef.current === `${CHAT_PATH}/${event.conversation_id}`;
      if (message && message.type === 'text' && message.sender_id !== userId && !insideConversation) {
        setToast({
          id: message.id,
          conversationId: event.conversation_id,
          name: conversation?.counterpart?.name ?? null,
          preview: message.body,
        });
      }
    });

    // pusher-js يعيد الاتصال تلقائياً — ما فات أثناء الانقطاع يُجلب عبر HTTP، بعد انقطاع اتصال
    // كان قائماً أو بعد عطل منذ فتح الصفحة (unavailable/failed: كانت الواجهة تستطلع، وما وصل
    // بين آخر استطلاع ولحظة الاتصال كان يضيع). لا عند الاتصال الأول العادي. بتأخير عشوائي حتى
    // 5 ثوانٍ: عند عودة Reverb يعيد الكل الاتصال معاً، فكانت تصل الـ API موجة في لحظة واحدة.
    const connection = echo.connector.pusher.connection;
    let hasConnected = connection.state === 'connected';
    let wasDisconnected = false;
    let hadOutage = false;
    let catchUpTimer = null;
    const onStateChange = ({ current }) => {
      if (current === 'unavailable' || current === 'failed') hadOutage = true;
      if (current === 'connected') {
        if ((hasConnected && wasDisconnected) || hadOutage) {
          clearTimeout(catchUpTimer);
          catchUpTimer = setTimeout(
            () => queryClient.invalidateQueries({ queryKey: ['chat'] }),
            Math.random() * RECONNECT_JITTER_MS,
          );
        }
        hasConnected = true;
        wasDisconnected = false;
        hadOutage = false;
      } else {
        wasDisconnected = true;
      }
    };
    connection.bind('state_change', onStateChange);

    return () => {
      clearTimeout(catchUpTimer);
      connection.unbind('state_change', onStateChange);
      echo.leave(channelName);
    };
  }, [enabled, token, userId, queryClient]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  return (
    <div dir="rtl" className="fixed bottom-6 left-6 z-[60] w-80 max-w-[calc(100vw-3rem)]">
      <div className="flex items-start gap-3 rounded-2xl border border-line bg-white p-4 shadow-lift">
        <button
          type="button"
          onClick={() => {
            setToast(null);
            navigate(`${CHAT_PATH}/${toast.conversationId}`);
          }}
          className="flex min-w-0 flex-1 items-start gap-3 text-right"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MessageCircle size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-ink">
              {toast.name ? t('chat.toastFrom').replace('{name}', toast.name) : t('chat.toastNew')}
            </span>
            <span className="block truncate text-xs text-ink-soft">{toast.preview}</span>
          </span>
        </button>
        <button type="button" onClick={() => setToast(null)} className="text-ink-soft hover:text-ink" aria-label={t('chat.close')}>
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
