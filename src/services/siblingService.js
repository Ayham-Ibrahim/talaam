import { client } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { withTeacherType } from '@/services/authService';

/**
 * حسابات الإخوة (SiblingController في الباك اند) — بلا فرع محاكاة، مبنية مباشرة
 * ضد الباك الحقيقي فقط (نفس اختيار registerStudent).
 */
export const siblingService = {
  /** كل حسابات العائلة: الأساسي أولاً ثم الإخوة، مع is_current للحساب المفتوح حالياً */
  async family() {
    const { data } = await client.get(endpoints.siblings.list);
    return (data.data ?? []).map(withTeacherType);
  },

  async add(payload) {
    const { data } = await client.post(endpoints.siblings.create, payload);
    return withTeacherType(data.data);
  },

  /** يرجع { user, token } — التوكن السابق يُبطَل في الباك اند فيجب استبداله فوراً */
  async switchTo(userId) {
    const { data } = await client.post(endpoints.siblings.switch(userId));
    return { ...data.data, user: withTeacherType(data.data.user) };
  },
};
