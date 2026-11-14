import { client } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { withTeacherType } from '@/services/authService';
import { getBrowserTimezone } from '@/lib/timezone';

/**
 * الحملات الإعلانية وباقاتها المخفضة، وحجز الجلسة المجانية بلا حساب.
 * بلا فرع محاكاة — مبنية مباشرة ضد الباك الحقيقي (نفس اختيار registerStudent).
 */
export const campaignService = {
  /** صفحة الهبوط: { name, slug, is_open } */
  async getCampaign(slug) {
    const { data } = await client.get(endpoints.campaigns.show(slug));
    return data.data;
  },

  /** التسجيل من رابط الحملة — نفس شكل استجابة login (user + token) */
  async register(slug, payload) {
    const { data } = await client.post(endpoints.campaigns.register(slug), {
      ...payload,
      timezone: getBrowserTimezone(),
    });
    return { ...data.data, user: withTeacherType(data.data.user) };
  },

  async convertAccount() {
    const { data } = await client.post(endpoints.campaigns.convertAccount);
    return withTeacherType(data.data);
  },

  /** { right_used, packages: [...StudentPackageResource + teacher] } — لحسابات الحملة فقط */
  async getCampaignPackages() {
    const { data } = await client.get(endpoints.campaigns.packages);
    return data.data;
  },

  async sendGuestCode(packageId, email) {
    const { data } = await client.post(endpoints.guestTrial.sendCode(packageId), { email });
    return data;
  },

  /** slots: [{ date: 'YYYY-MM-DD', start_time: 'HH:mm' }] */
  async bookGuestTrial(packageId, { email, code, name, slots }) {
    const { data } = await client.post(endpoints.guestTrial.book(packageId), {
      email,
      code,
      name,
      slots,
      timezone: getBrowserTimezone(),
    });
    return data.data;
  },

  /* ── الأدمن ── */

  async adminListCampaigns() {
    const { data } = await client.get(endpoints.campaigns.adminList);
    return data.data;
  },

  async adminCreateCampaign(payload) {
    const { data } = await client.post(endpoints.campaigns.adminCreate, payload);
    return data.data;
  },

  async adminUpdateCampaign(id, payload) {
    const { data } = await client.put(endpoints.campaigns.adminUpdate(id), payload);
    return data.data;
  },

  /** باقات الحملة لمعلم بكل حالاتها (نشطة ومعطّلة) — نفس GET /packages للأدمن بفلتري audience و owner */
  async adminListCampaignPackages(teacherId) {
    const { data } = await client.get(endpoints.admin.packages, {
      params: { audience: 'campaign', owner: teacherId, per_page: 100 },
    });
    return data.data;
  },

  async adminCreateCampaignPackage(payload) {
    const { data } = await client.post(endpoints.campaigns.adminCreatePackage, payload);
    return data.data;
  },

  async adminSetPackageEnabled(id, enabled) {
    const url = enabled ? endpoints.admin.enablePackage(id) : endpoints.admin.disablePackage(id);
    const { data } = await client.post(url);
    return data.data;
  },

  /** أيام توفّر المعلم — أيام باقة الحملة يجب أن تكون ضمنها */
  async adminTeacherAvailableDays(teacherId) {
    const { data } = await client.get(endpoints.teachers.availabilitySlots(teacherId));
    return (data.data ?? []).map((slot) => slot.day_of_week);
  },
};
