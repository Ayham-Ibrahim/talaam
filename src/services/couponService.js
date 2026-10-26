import { config } from '@/config/env';
import { client, mockDelay } from '@/api/client';
import { endpoints } from '@/api/endpoints';

/** كوبونات خصم على باقة محددة — يديرها المعلم المالك (أو الأدمن) من لوحته */
export const couponService = {
  async list(packageId) {
    if (config.useMocks) {
      await mockDelay(300);
      return [];
    }
    const { data } = await client.get(endpoints.coupons.list(packageId));
    return data.data;
  },

  async create(packageId, payload) {
    if (config.useMocks) {
      await mockDelay(400);
      return { id: Math.floor(Math.random() * 100000), ...payload, redeemedCount: 0, isActive: true, isRedeemable: true };
    }
    const { data } = await client.post(endpoints.coupons.create(packageId), {
      code: payload.code || undefined,
      discount_type: payload.discountType,
      discount_value: payload.discountValue,
      max_redemptions: payload.maxRedemptions || undefined,
      expires_at: payload.expiresAt || undefined,
    });
    return data.data;
  },

  async update(id, payload) {
    if (config.useMocks) {
      await mockDelay(350);
      return { id, ...payload };
    }
    const { data } = await client.put(endpoints.coupons.update(id), {
      ...(payload.discountType != null && { discount_type: payload.discountType }),
      ...(payload.discountValue != null && { discount_value: payload.discountValue }),
      ...(payload.maxRedemptions !== undefined && { max_redemptions: payload.maxRedemptions || null }),
      ...(payload.expiresAt !== undefined && { expires_at: payload.expiresAt || null }),
      ...(payload.isActive != null && { is_active: payload.isActive }),
    });
    return data.data;
  },

  async remove(id) {
    if (config.useMocks) {
      await mockDelay(300);
      return null;
    }
    await client.delete(endpoints.coupons.delete(id));
    return null;
  },

  // كوبونات الأدمن متعددة الباقات — remove أعلاه مشترك (نفس Coupon model)
  async listMultiPackage() {
    if (config.useMocks) {
      await mockDelay(300);
      return [];
    }
    const { data } = await client.get(endpoints.multiPackageCoupons.list);
    return data.data;
  },

  async createMultiPackage(payload) {
    if (config.useMocks) {
      await mockDelay(400);
      return { id: Math.floor(Math.random() * 100000), ...payload, redeemedCount: 0, isActive: true, isRedeemable: true };
    }
    const { data } = await client.post(endpoints.multiPackageCoupons.create, {
      code: payload.code || undefined,
      package_ids: payload.packageIds,
      course_ids: payload.courseIds,
      discount_type: payload.discountType,
      discount_value: payload.discountValue,
      max_redemptions: payload.maxRedemptions || undefined,
      expires_at: payload.expiresAt || undefined,
    });
    return data.data;
  },

  async updateMultiPackage(id, payload) {
    if (config.useMocks) {
      await mockDelay(350);
      return { id, ...payload };
    }
    const { data } = await client.put(endpoints.multiPackageCoupons.update(id), {
      ...(payload.packageIds != null && { package_ids: payload.packageIds }),
      ...(payload.courseIds != null && { course_ids: payload.courseIds }),
      ...(payload.discountType != null && { discount_type: payload.discountType }),
      ...(payload.discountValue != null && { discount_value: payload.discountValue }),
      ...(payload.maxRedemptions !== undefined && { max_redemptions: payload.maxRedemptions || null }),
      ...(payload.expiresAt !== undefined && { expires_at: payload.expiresAt || null }),
      ...(payload.isActive != null && { is_active: payload.isActive }),
    });
    return data.data;
  },

  // باقات ودورات معتمدة يمكن ضمّها لكوبون متعدد — نفس endpoints الأدمن (status=active).
  // key يميّز النوع لأن معرّفات الباقات والدورات تسلسلان مستقلان.
  async listPackageOptions() {
    if (config.useMocks) {
      await mockDelay(300);
      return [];
    }
    const params = { params: { status: 'active', per_page: 500 } };
    const [packagesRes, coursesRes] = await Promise.all([
      client.get(endpoints.admin.packages, params),
      client.get(endpoints.admin.courses, params),
    ]);
    const map = (raw, kind) => ({
      key: `${kind}:${raw.id}`,
      kind,
      id: raw.id,
      title: raw.title,
      teacherName: raw.teacher?.name ?? null,
      subjectName: (kind === 'course' ? raw.course_field : raw.subject) ?? null,
      // باقة: individual/group، دورة: course — يغذي فلتر/عمود النوع مباشرة
      type: kind === 'course' ? 'course' : (raw.session_format ?? null),
      studentPrice: raw.student_price != null ? Number(raw.student_price) : null,
      marginPercent: raw.platform_margin_percent != null ? Number(raw.platform_margin_percent) : null,
      platformRevenue: raw.platform_revenue != null ? Number(raw.platform_revenue) : null,
    });
    return [
      ...packagesRes.data.data.map((raw) => map(raw, 'package')),
      ...coursesRes.data.data.map((raw) => map(raw, 'course')),
    ];
  },

  // كوبونات باقات الدعم الأكاديمي — الأدمن فقط (راجع CouponPolicy). update/remove أعلاه مشتركان بالفعل.
  async listForSupportPackage(supportPackageId) {
    if (config.useMocks) {
      await mockDelay(300);
      return [];
    }
    const { data } = await client.get(endpoints.supportPackageCoupons.list(supportPackageId));
    return data.data;
  },

  async createForSupportPackage(supportPackageId, payload) {
    if (config.useMocks) {
      await mockDelay(400);
      return { id: Math.floor(Math.random() * 100000), ...payload, redeemedCount: 0, isActive: true, isRedeemable: true };
    }
    const { data } = await client.post(endpoints.supportPackageCoupons.create(supportPackageId), {
      code: payload.code || undefined,
      discount_type: payload.discountType,
      discount_value: payload.discountValue,
      max_redemptions: payload.maxRedemptions || undefined,
      expires_at: payload.expiresAt || undefined,
    });
    return data.data;
  },
};
