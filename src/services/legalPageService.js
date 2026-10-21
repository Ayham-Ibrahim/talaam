import { config } from '@/config/env';
import { client, mockDelay } from '@/api/client';
import { endpoints } from '@/api/endpoints';

/**
 * سياسة الخصوصية والشروط والأحكام — بلا فرع محاكاة لمحتوى طويل مثل هذا (نفس
 * اختيار authService.registerStudent) — هذه الصفحات مبنية مباشرة ضد الباك
 * الحقيقي فقط. getBySlug عامة (بلا مصادقة)، update للأدمن فقط.
 */
export const legalPageService = {
  async getBySlug(slug) {
    if (config.useMocks) {
      await mockDelay(200);
      return { slug, sections: [], updatedAt: null };
    }
    const { data } = await client.get(endpoints.legalPages.show(slug));
    return data.data;
  },

  async update(slug, sections) {
    if (config.useMocks) {
      await mockDelay(300);
      return { slug, sections, updatedAt: new Date().toISOString() };
    }
    const { data } = await client.put(endpoints.legalPages.update(slug), { sections });
    return data.data;
  },
};
