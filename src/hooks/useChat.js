import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { queryKeys } from '@/api/queryKeys';
import { chatService } from '@/services/chatService';
import { useAuth } from '@/hooks/useAuth';
import { getConnectionState, getEcho, pollIntervalMs, subscribeConnectionState } from '@/lib/echo';
import { applyRead, newestMessageId, refreshConversationList, upsertMessages } from '@/lib/chatCache';

/** أطراف المحادثة: الطالب والمعلم والداعم الأكاديمي. الأدمن يطّلع من الشكوى فقط */
export const CHAT_ROLES = ['student', 'teacher', 'academic_support'];

export const CHAT_PATH = '/dashboard/messages';

/** بلا WebSocket (مفتاح Reverb فارغ أو انقطاع): استطلاع دوري بدل البث اللحظي */
const POLL_MS = 15_000;

/** WebSocket متصل فعلاً الآن — يقرر بين البث اللحظي والاستطلاع الدوري */
export function useRealtimeConnected() {
  return useSyncExternalStore(subscribeConnectionState, () => getConnectionState() === 'connected');
}

export function useChatEnabled() {
  const { user, isAuthenticated } = useAuth();
  return isAuthenticated && CHAT_ROLES.includes(user?.role);
}

/** مرقّمة: المعلم قد يملك مئات المحادثات (طالب لكل علاقة مؤكدة). search: باسم الطرف الآخر */
export function useConversations(search = '') {
  const enabled = useChatEnabled();
  const connected = useRealtimeConnected();
  return useInfiniteQuery({
    queryKey: queryKeys.chat.conversations(search),
    queryFn: ({ pageParam }) => chatService.getConversations(pageParam, search),
    // نتائج البحث السابق تبقى ظاهرة أثناء جلب الجديد بدل وميض الهيكل الفارغ
    placeholderData: (previous) => previous,
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta && lastPage.meta.current_page < lastPage.meta.last_page ? lastPage.meta.current_page + 1 : undefined,
    enabled,
    // دالة لا قيمة: تُعاد بعد كل جلب فيتباطأ الاستطلاع تدريجياً إن طال الانقطاع
    refetchInterval: () => (connected ? false : pollIntervalMs(POLL_MS)),
  });
}

export function useChatUnreadCount() {
  const enabled = useChatEnabled();
  const connected = useRealtimeConnected();
  return useQuery({
    queryKey: queryKeys.chat.unreadCount(),
    queryFn: () => chatService.getUnreadCount(),
    enabled,
    // مع WebSocket يصل العداد عبر chat.updated — الاستطلاع البطيء شبكة أمان فقط
    refetchInterval: () => (connected ? 120_000 : pollIntervalMs(POLL_MS)),
  });
}

export function useConversation(conversationId) {
  return useQuery({
    queryKey: queryKeys.chat.conversation(conversationId),
    queryFn: () => chatService.getConversation(conversationId),
    enabled: Boolean(conversationId),
  });
}

/**
 * اتصال الطرف الآخر بالمنصة (أي صفحة) — بنفس معنى "متصل" الذي يقرر إشعار الجرس في الباك.
 * فقط والـ WebSocket متصل (بدونه لا يُعرض مؤشر أصلاً)، كل دقيقة والتبويب ظاهر.
 */
export function useCounterpartPresence(conversationId, enabled) {
  return useQuery({
    queryKey: queryKeys.chat.presence(conversationId),
    queryFn: () => chatService.getPresence(conversationId),
    enabled: Boolean(conversationId) && enabled,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useMessages(conversationId) {
  return useQuery({
    queryKey: queryKeys.chat.messages(conversationId),
    queryFn: async () => {
      const result = await chatService.getMessages(conversationId);
      return { messages: result.messages, hasMore: result.has_more };
    },
    enabled: Boolean(conversationId),
    staleTime: 0,
  });
}

/** تحميل الأقدم عند التمرير لأعلى المحادثة */
export function useLoadOlderMessages(conversationId) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const loadOlder = useCallback(async () => {
    const key = queryKeys.chat.messages(conversationId);
    const current = queryClient.getQueryData(key);
    if (!current?.hasMore || !current.messages.length || isLoading) return;

    setIsLoading(true);
    try {
      const result = await chatService.getMessages(conversationId, { beforeId: current.messages[0].id });
      upsertMessages(queryClient, conversationId, result.messages);
      queryClient.setQueryData(key, (data) => (data ? { ...data, hasMore: result.has_more } : data));
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, isLoading, queryClient]);

  return { loadOlder, isLoading };
}

/** يجلب ما وصل بعد آخر رسالة معروفة — بعد انقطاع WebSocket، أو دورياً بلا WebSocket */
export function useSyncNewMessages(conversationId) {
  const queryClient = useQueryClient();

  return useCallback(async () => {
    const afterId = newestMessageId(queryClient, conversationId);
    if (!afterId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.messages(conversationId) });
      return;
    }
    const result = await chatService.getMessages(conversationId, { afterId, limit: 100 });
    upsertMessages(queryClient, conversationId, result.messages);
  }, [conversationId, queryClient]);
}

function useInvalidateChatSummary() {
  const queryClient = useQueryClient();
  return () => {
    refreshConversationList(queryClient);
    queryClient.invalidateQueries({ queryKey: queryKeys.chat.unreadCount() });
  };
}

export function useSendMessage(conversationId) {
  const queryClient = useQueryClient();
  const invalidateSummary = useInvalidateChatSummary();
  return useMutation({
    mutationFn: (body) => chatService.sendMessage(conversationId, body),
    onSuccess: (message) => {
      upsertMessages(queryClient, conversationId, [message]);
      invalidateSummary();
    },
  });
}

export function useEditMessage(conversationId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, body }) => chatService.editMessage(messageId, body),
    onSuccess: (message) => upsertMessages(queryClient, conversationId, [message]),
  });
}

export function useDeleteMessage(conversationId) {
  const queryClient = useQueryClient();
  const invalidateSummary = useInvalidateChatSummary();
  return useMutation({
    mutationFn: (messageId) => chatService.deleteMessage(messageId),
    onSuccess: (message) => {
      upsertMessages(queryClient, conversationId, [message]);
      invalidateSummary();
    },
  });
}

export function useMarkConversationRead(conversationId) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const invalidateSummary = useInvalidateChatSummary();
  return useMutation({
    mutationFn: () => chatService.markRead(conversationId),
    onSuccess: (result) => {
      if (result?.read_at) applyRead(queryClient, conversationId, user?.id, result.read_at);
      if (result?.marked) invalidateSummary();
    },
  });
}

export function useReportMessage() {
  return useMutation({
    mutationFn: ({ messageId, description }) => chatService.reportMessage(messageId, description),
  });
}

/** زر "مراسلة" في صفحات الحجز/الكورس/الطلاب — يفتح المحادثة القائمة مع ذلك المستخدم */
export function useOpenConversationWith() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (userId) => chatService.findWithUser(userId),
    onSuccess: (conversation) => navigate(`${CHAT_PATH}/${conversation.id}`),
  });
}

/**
 * قناة presence للمحادثة المفتوحة: رسائل/تعديل/حذف/قراءة لحظياً، وهل الطرف الآخر فاتح هذه
 * المحادثة الآن (أعضاء القناة الحاضرون — otherInConversation)، و"يكتب الآن" عبر whisper بلا
 * سيرفر. presenceReady: وصلت قائمة الحاضرين (here) — قبلها لا يُعرض مؤشر، وإلا ظهر "غير متصل"
 * لجزء من الثانية. دخول الطرف الآخر يعني أنه متصل بالمنصة أيضاً، وخروجه يعيد سؤال الباك.
 */
export function useConversationChannel(conversationId, { onIncomingMessage } = {}) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  // المعرّف لا الكائن: user يُستبدل بكائن جديد عند كل مزامنة (العودة للنافذة)، فكان
  // الاعتماد عليه يغادر القناة ويعود إليها — وميض "غير متصل/متصل" عند الطرف الآخر
  const userId = user?.id;
  const [otherOnline, setOtherOnline] = useState(false);
  const [presenceReady, setPresenceReady] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const typingTimer = useRef(null);
  const lastWhisperAt = useRef(0);
  const onIncomingRef = useRef(onIncomingMessage);
  onIncomingRef.current = onIncomingMessage;

  useEffect(() => {
    const echo = getEcho();
    if (!echo || !conversationId || !userId) return undefined;

    const isOther = (member) => member.id !== userId;
    const channelName = `conversation.${conversationId}`;

    const channel = echo
      .join(channelName)
      .here((members) => {
        setOtherOnline(members.some(isOther));
        setPresenceReady(true);
      })
      .joining((member) => {
        if (!isOther(member)) return;
        setOtherOnline(true);
        queryClient.setQueryData(queryKeys.chat.presence(conversationId), true);
      })
      .leaving((member) => {
        if (!isOther(member)) return;
        setOtherOnline(false);
        setOtherTyping(false);
        // غادر المحادثة — قد يبقى في صفحة أخرى من المنصة أو يكون أغلقها
        queryClient.invalidateQueries({ queryKey: queryKeys.chat.presence(conversationId) });
      })
      .listen('.message.sent', ({ message }) => {
        upsertMessages(queryClient, conversationId, [message]);
        setOtherTyping(false);
        if (message.sender_id !== userId) onIncomingRef.current?.(message);
      })
      .listen('.message.updated', ({ message }) => upsertMessages(queryClient, conversationId, [message]))
      .listen('.message.deleted', ({ message }) => upsertMessages(queryClient, conversationId, [message]))
      .listen('.messages.read', (event) => applyRead(queryClient, conversationId, event.reader_id, event.read_at))
      .listen('.conversation.status_changed', () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.chat.conversation(conversationId) });
      })
      .listenForWhisper('typing', () => {
        setOtherTyping(true);
        clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setOtherTyping(false), 3000);
      });

    return () => {
      clearTimeout(typingTimer.current);
      echo.leave(channelName);
      setOtherOnline(false);
      setPresenceReady(false);
      setOtherTyping(false);
    };
  }, [conversationId, queryClient, userId]);

  /** مرة كل ثانيتين كحد أقصى أثناء الكتابة */
  const notifyTyping = useCallback(() => {
    const echo = getEcho();
    if (!echo || Date.now() - lastWhisperAt.current < 2000) return;
    lastWhisperAt.current = Date.now();
    echo.join(`conversation.${conversationId}`).whisper('typing', { userId });
  }, [conversationId, userId]);

  return { otherInConversation: otherOnline, presenceReady, otherTyping, notifyTyping };
}

export function useAdminComplaintConversation(complaintId, enabled = true) {
  return useQuery({
    queryKey: queryKeys.chat.adminConversation(complaintId),
    queryFn: () => chatService.getAdminConversation(complaintId),
    enabled: Boolean(complaintId) && enabled,
    staleTime: 0,
  });
}

export function useToggleConversationBlock(complaintId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, block }) =>
      block
        ? chatService.blockConversation(conversationId, complaintId)
        : chatService.unblockConversation(conversationId, complaintId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.chat.adminConversation(complaintId) }),
  });
}
