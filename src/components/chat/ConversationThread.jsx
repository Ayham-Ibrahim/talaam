import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Ban } from 'lucide-react';
import { Avatar, ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useNow } from '@/hooks/useNow';
import { useT } from '@/hooks/useT';
import {
  CHAT_PATH,
  useConversation,
  useConversationChannel,
  useCounterpartPresence,
  useRealtimeConnected,
  useDeleteMessage,
  useEditMessage,
  useLoadOlderMessages,
  useMarkConversationRead,
  useMessages,
  useSendMessage,
  useSyncNewMessages,
} from '@/hooks/useChat';
import { canModifyMessage } from '@/lib/chatCache';
import { pollIntervalMs } from '@/lib/echo';
import { MessageBubble } from './MessageBubble';
import { MessageComposer } from './MessageComposer';
import { ReportMessageModal } from './ReportMessageModal';
import { dayKey, formatDayLabel } from './chatFormat';

/** بلا WebSocket: جلب الجديد دورياً (يتباطأ إن طال الانقطاع — pollIntervalMs) */
const POLL_MS = 10_000;
/** حالة المحادثة (حظر/رفع حظر) أثناء الاستطلاع — نادرة التغيّر */
const STATUS_POLL_MS = 60_000;
/** المستخدم قرب أسفل المحادثة — الرسالة الجديدة تُمرّر إليها تلقائياً */
const NEAR_BOTTOM_PX = 120;

export function ConversationThread({ conversationId }) {
  const t = useT();
  const { user } = useAuth();
  const now = useNow();
  const { data: conversation, isError: conversationError, refetch: refetchConversation } = useConversation(conversationId);
  const { data, isLoading, isError, refetch } = useMessages(conversationId);
  const { loadOlder, isLoading: loadingOlder } = useLoadOlderMessages(conversationId);
  const syncNew = useSyncNewMessages(conversationId);
  const send = useSendMessage(conversationId);
  const edit = useEditMessage(conversationId);
  const remove = useDeleteMessage(conversationId);
  const markRead = useMarkConversationRead(conversationId);
  const [editingMessage, setEditingMessage] = useState(null);
  const [reportingMessage, setReportingMessage] = useState(null);
  const scrollRef = useRef(null);
  const nearBottomRef = useRef(true);
  const lastMessageIdRef = useRef(null);
  const prependAnchorRef = useRef(null);

  const { otherInConversation, presenceReady, otherTyping, notifyTyping } = useConversationChannel(conversationId);
  const connected = useRealtimeConnected();
  const { data: otherOnPlatform } = useCounterpartPresence(conversationId, connected);

  const messages = data?.messages ?? [];
  const isBlocked = conversation?.status === 'blocked';
  // معطّل، محذوف، أو زائر لم يُنشئ حسابه بعد — الباك يرفض الإرسال إليه
  const isUnavailable = conversation?.counterpart?.is_available === false;
  const counterpart = conversation?.counterpart;

  // تبديل المحادثة: إلغاء أي تعديل جارٍ والعودة لأسفلها
  useEffect(() => {
    setEditingMessage(null);
    lastMessageIdRef.current = null;
    nearBottomRef.current = true;
  }, [conversationId]);

  // تعليم المقروء ما دامت المحادثة مفتوحة والتبويب ظاهراً. المفتاح معرّف أحدث رسالة غير
  // مقروءة (لا قيمة منطقية): كل رسالة جديدة تصل تُعلَّم بدورها، ونجاح التعليم يحدّث النسخة
  // المحلية (applyRead) فيصبح null حتى الرسالة التالية.
  const markReadMutate = markRead.mutate;
  const newestUnreadId = messages.reduce(
    (max, m) => (m.type === 'text' && m.sender_id !== user?.id && !m.read_at && !m.is_deleted && m.id > max ? m.id : max),
    0,
  );
  useEffect(() => {
    if (!newestUnreadId) return undefined;
    const mark = () => document.visibilityState === 'visible' && markReadMutate();
    mark();
    document.addEventListener('visibilitychange', mark);
    return () => document.removeEventListener('visibilitychange', mark);
  }, [newestUnreadId, conversationId, markReadMutate]);

  // بلا WebSocket متصل فعلاً (لا مفتاح، أو Reverb متوقف/منقطع): جلب الجديد دورياً. setTimeout
  // متتابع لا setInterval كي تُحسب الفترة من جديد كل مرة (تتباطأ إن طال العطل)، ولا جلب في
  // تبويب مخفي — يُجلب فور عودته ظاهراً. حالة المحادثة (حظر) نادرة التغيّر: كل دقيقة فقط.
  useEffect(() => {
    if (connected) return undefined;
    let timer = null;
    let lastStatusFetch = Date.now();

    const poll = () => {
      if (document.visibilityState !== 'visible') return;
      syncNew();
      if (Date.now() - lastStatusFetch >= STATUS_POLL_MS) {
        lastStatusFetch = Date.now();
        refetchConversation();
      }
    };
    const schedule = () => {
      timer = setTimeout(() => {
        poll();
        schedule();
      }, pollIntervalMs(POLL_MS));
    };
    const onVisible = () => document.visibilityState === 'visible' && poll();

    schedule();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [connected, syncNew, refetchConversation]);

  // التمرير: لأسفل عند رسالة جديدة (إن كان المستخدم قريباً منه)، وثبات الموضع عند تحميل الأقدم
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || !messages.length) return;

    if (prependAnchorRef.current !== null) {
      el.scrollTop = el.scrollHeight - prependAnchorRef.current;
      prependAnchorRef.current = null;
      return;
    }

    const newestId = messages[messages.length - 1].id;
    if (newestId !== lastMessageIdRef.current) {
      const isFirstRender = lastMessageIdRef.current === null;
      const newestIsOwn = messages[messages.length - 1].sender_id === user?.id;
      if (isFirstRender || nearBottomRef.current || newestIsOwn) el.scrollTop = el.scrollHeight;
      lastMessageIdRef.current = newestId;
    }
  }, [messages, user]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    nearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
    if (el.scrollTop < 60 && data?.hasMore && !loadingOlder) {
      prependAnchorRef.current = el.scrollHeight - el.scrollTop;
      loadOlder();
    }
  };

  const handleSubmit = async (body) => {
    if (editingMessage) {
      await edit.mutateAsync({ messageId: editingMessage.id, body });
      setEditingMessage(null);
      return;
    }
    await send.mutateAsync(body);
  };

  const handleDelete = (message) => {
    if (window.confirm(t('chat.confirmDelete'))) remove.mutate(message.id);
  };

  if (isError || conversationError) {
    return (
      <div className="flex h-full items-center justify-center">
        <ErrorState onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-line/60 bg-white px-4 py-3">
        <Link to={CHAT_PATH} className="text-ink-soft hover:text-ink lg:hidden" aria-label={t('chat.back')}>
          <ArrowRight size={20} />
        </Link>
        <Avatar name={counterpart?.name} src={counterpart?.avatar_path} size="sm" />
        <div className="min-w-0 flex-1 text-right">
          <div className="truncate text-sm font-bold text-ink">{counterpart?.name ?? '…'}</div>
          <div className="text-xs text-ink-soft">
            {otherTyping ? (
              <span className="text-primary">{t('chat.typing')}</span>
            ) : connected && presenceReady && (otherInConversation || otherOnPlatform !== undefined) ? (
              // في المحادثة الآن (قناة المحادثة) > متصل بالمنصة (سؤال الباك) > غير متصل
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={`h-2 w-2 rounded-full ${otherInConversation || otherOnPlatform ? 'bg-success' : 'bg-line'}`}
                />
                {otherInConversation ? t('chat.inConversation') : otherOnPlatform ? t('chat.online') : t('chat.offline')}
              </span>
            ) : (
              counterpart?.role && t(`chat.roles.${counterpart.role}`)
            )}
          </div>
        </div>
      </div>

      {isBlocked ? (
        <div className="flex items-center gap-2 border-b border-accent-pink/20 bg-accent-pink/5 px-4 py-2 text-xs font-semibold text-accent-pink">
          <Ban size={14} />
          {t('chat.blockedBanner')}
        </div>
      ) : isUnavailable ? (
        <div className="flex items-center gap-2 border-b border-line bg-line/20 px-4 py-2 text-xs font-semibold text-ink-soft">
          <Ban size={14} />
          {t('chat.unavailableBanner')}
        </div>
      ) : null}

      {/* Messages */}
      <div ref={scrollRef} onScroll={handleScroll} className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[#F7F8FB] px-4 py-4">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className={`h-12 w-2/3 rounded-2xl ${i % 2 ? 'mr-auto' : ''}`} />
            ))}
          </div>
        ) : (
          <>
            {data?.hasMore && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    prependAnchorRef.current = scrollRef.current.scrollHeight - scrollRef.current.scrollTop;
                    loadOlder();
                  }}
                  disabled={loadingOlder}
                  className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
                >
                  {loadingOlder ? '…' : t('chat.loadOlder')}
                </button>
              </div>
            )}
            {messages.length === 0 && (
              <p className="py-10 text-center text-sm text-ink-soft">{t('chat.startHint')}</p>
            )}
            {messages.map((message, index) => {
              const showDay = index === 0 || dayKey(messages[index - 1].created_at) !== dayKey(message.created_at);
              const isOwn = message.sender_id === user?.id;
              return (
                <Fragment key={message.id}>
                  {showDay && (
                    <div className="flex justify-center py-2">
                      <span className="rounded-pill bg-white px-3 py-1 text-[11px] font-semibold text-ink-soft shadow-card">
                        {formatDayLabel(message.created_at, t)}
                      </span>
                    </div>
                  )}
                  <MessageBubble
                    message={message}
                    isOwn={isOwn}
                    role={user?.role}
                    canModify={canModifyMessage(message, user?.id, conversation?.status, now)}
                    canReport={!isOwn && message.type === 'text'}
                    onEdit={setEditingMessage}
                    onDelete={handleDelete}
                    onReport={setReportingMessage}
                  />
                </Fragment>
              );
            })}
          </>
        )}
      </div>

      <MessageComposer
        disabled={isBlocked || isUnavailable}
        editingMessage={editingMessage}
        onCancelEdit={() => setEditingMessage(null)}
        onSubmit={handleSubmit}
        onTyping={notifyTyping}
        isSubmitting={send.isPending || edit.isPending}
        error={editingMessage ? edit.error : (send.error ?? remove.error)}
      />

      {reportingMessage && <ReportMessageModal message={reportingMessage} onClose={() => setReportingMessage(null)} />}
    </div>
  );
}
