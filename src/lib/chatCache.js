import { queryKeys } from '@/api/queryKeys';

/**
 * كاش رسائل المحادثة بشكل { messages: [...مرتبة تصاعدياً بالمعرّف], hasMore } — نفس
 * الدوال تخدم ردّ HTTP (إرسال/تعديل/حذف) وأحداث WebSocket، فلا تتكرر رسالة وصلت
 * بالطريقين معاً (الدمج بالمعرّف).
 */
export function mergeMessages(current = [], incoming = []) {
  const byId = new Map(current.map((message) => [message.id, message]));
  incoming.forEach((message) => byId.set(message.id, { ...byId.get(message.id), ...message }));
  return [...byId.values()].sort((a, b) => a.id - b.id);
}

export function upsertMessages(queryClient, conversationId, incoming) {
  queryClient.setQueryData(queryKeys.chat.messages(conversationId), (data) =>
    data ? { ...data, messages: mergeMessages(data.messages, incoming) } : data,
  );
}

/**
 * readerId قرأ حتى لحظة readAt (بساعة السيرفر) — رسائل غيره غير المقروءة حتى تلك اللحظة صارت
 * مقروءة. تُستخدم لحدث MessagesRead (قراءة الطرف الآخر)، ولردّ تعليم القارئ نفسه: ذلك
 * الحدث لا يصل للقارئ، فبدونها تبقى نسخته "غير مقروءة" ولا يُعلَّم ما يصل بعدها.
 */
export function applyRead(queryClient, conversationId, readerId, readAt) {
  const limit = new Date(readAt).getTime();
  queryClient.setQueryData(queryKeys.chat.messages(conversationId), (data) =>
    data
      ? {
          ...data,
          messages: data.messages.map((message) =>
            message.sender_id !== readerId &&
            message.type === 'text' &&
            !message.read_at &&
            new Date(message.created_at).getTime() <= limit
              ? { ...message, read_at: readAt }
              : message,
          ),
        }
      : data,
  );
}

/**
 * تحديث قائمة المحادثات بعد حدث (رسالة، قراءة، حظر): إبطال useInfiniteQuery يعيد جلب كل
 * الصفحات المحمّلة واحدة تلو الأخرى — معلم مرّر عشر صفحات كان يُطلق عشرة طلبات مع كل رسالة.
 * الحدث يغيّر رأس القائمة فقط (الأحدث أولاً)، فتُقصّ للصفحة الأولى ثم تُجلب وحدها؛ الأقدم
 * يُحمَّل من جديد عند التمرير.
 */
export function refreshConversationList(queryClient) {
  // كل القوائم المخزّنة (بكل نصوص البحث) — لا القائمة غير المفلترة وحدها
  const prefix = queryKeys.chat.conversationsAll();
  queryClient.setQueriesData({ queryKey: prefix }, (data) =>
    data?.pages?.length > 1 ? { pages: data.pages.slice(0, 1), pageParams: data.pageParams.slice(0, 1) } : data,
  );
  queryClient.invalidateQueries({ queryKey: prefix });
}

/** محادثة من أي قائمة مخزّنة (مفلترة أو لا) — لاسم الطرف الآخر في الـ toast */
export function findCachedConversation(queryClient, conversationId) {
  for (const [, data] of queryClient.getQueriesData({ queryKey: queryKeys.chat.conversationsAll() })) {
    const found = flattenConversations(data).find((c) => c.id === conversationId);
    if (found) return found;
  }
  return null;
}

/** قائمة المحادثات مُرقّمة (useInfiniteQuery) — كل الصفحات كقائمة واحدة */
export function flattenConversations(data) {
  return data?.pages?.flatMap((page) => page.items) ?? [];
}

export function newestMessageId(queryClient, conversationId) {
  const messages = queryClient.getQueryData(queryKeys.chat.messages(conversationId))?.messages;
  return messages?.length ? messages[messages.length - 1].id : null;
}

/** التعديل والحذف متاحان للمرسل خلال 30 دقيقة (editable_until من الباك) وفي محادثة نشطة */
export function canModifyMessage(message, userId, conversationStatus, now) {
  return (
    message.type === 'text' &&
    !message.is_deleted &&
    message.sender_id === userId &&
    conversationStatus === 'active' &&
    !!message.editable_until &&
    new Date(message.editable_until).getTime() > now
  );
}

/**
 * حالات لم يُؤكَّد فيها الحجز/التسجيل/الشراء بعد (أو لن يُؤكَّد) — المحادثة تُفتح عند التأكيد
 * فقط، فزر "مراسلة" فيها لا يجد محادثة. الملغى بعد تأكيد له محادثة قائمة فلا يُستثنى.
 */
const NOT_CONFIRMED_STATUSES = ['pending_teacher_confirmation', 'pending_payment', 'rejected', 'expired'];

export function hasConfirmedRelation(status) {
  return Boolean(status) && !NOT_CONFIRMED_STATUSES.includes(status);
}
