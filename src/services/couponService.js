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
};
