import { client } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { currentSocketId } from '@/lib/echo';

function socketHeaders() {
  const socketId = currentSocketId();
  return socketId ? { headers: { 'X-Socket-ID': socketId } } : undefined;
}

/**
 * المحادثة بين الطالب والمعلم/الداعم — بلا mocks: تعتمد على الباك اند فعلياً.
 * المحادثة تُفتح تلقائياً عند تأكيد حجز/تسجيل/باقة دعم، ولا تُنشأ من الواجهة.
 */
export const chatService = {
  /** search: باسم الطرف الآخر (في الباك — القائمة مرقّمة، فالبحث في المحمّل وحده يُفوّت الأقدم) */
  async getConversations(page = 1, search = '') {
    const { data } = await client.get(endpoints.chat.conversations, {
      params: { page, per_page: 30, search: search || undefined },
    });
    return { items: data.data, meta: data.meta };
  },

  async getConversation(id) {
    const { data } = await client.get(endpoints.chat.conversation(id));
    return data.data;
  },

  /** زر "مراسلة": يجلب المحادثة القائمة مع ذلك المستخدم — 404 إن لم تكن بينكما علاقة مؤكدة */
  async findWithUser(userId) {
    const { data } = await client.post(endpoints.chat.conversations, { user_id: userId });
    return data.data;
  },

  /** before_id للأقدم (التمرير للأعلى)، after_id لما فات بعد انقطاع الاتصال */
  async getMessages(conversationId, { beforeId, afterId, limit = 50 } = {}) {
    const { data } = await client.get(endpoints.chat.messages(conversationId), {
      params: { before_id: beforeId, after_id: afterId, limit },
    });
    return data.data;
  },

  async sendMessage(conversationId, body) {
    const { data } = await client.post(endpoints.chat.messages(conversationId), { body }, socketHeaders());
    return data.data;
  },

  async editMessage(messageId, body) {
    const { data } = await client.patch(endpoints.chat.message(messageId), { body }, socketHeaders());
    return data.data;
  },

  async deleteMessage(messageId) {
    const { data } = await client.delete(endpoints.chat.message(messageId), socketHeaders());
    return data.data;
  },

  async markRead(conversationId) {
    const { data } = await client.post(endpoints.chat.markRead(conversationId), null, socketHeaders());
    return data.data;
  },

  /** هل الطرف الآخر متصل بالمنصة الآن (أي صفحة) — يسأل الباك Reverb عن قناته الخاصة */
  async getPresence(conversationId) {
    const { data } = await client.get(endpoints.chat.presence(conversationId));
    return data.data.online;
  },

  async getUnreadCount() {
    const { data } = await client.get(endpoints.chat.unreadCount);
    return data.data.unread_count;
  },

  async reportMessage(messageId, description) {
    const { data } = await client.post(endpoints.chat.report(messageId), { description: description || null });
    return data.data;
  },

  async getAdminConversation(complaintId) {
    const { data } = await client.get(endpoints.chat.adminComplaintConversation(complaintId));
    return data.data;
  },

  async blockConversation(conversationId, complaintId) {
    const { data } = await client.post(endpoints.chat.adminBlock(conversationId), { complaint_id: complaintId });
    return data.data;
  },

  async unblockConversation(conversationId, complaintId) {
    const { data } = await client.post(endpoints.chat.adminUnblock(conversationId), { complaint_id: complaintId });
    return data.data;
  },
};
