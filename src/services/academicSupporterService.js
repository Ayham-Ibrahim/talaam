import { config } from '@/config/env';
import { client, mockDelay } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { assertFileWithinLimits } from '@/lib/fileValidation';

const GALLERY_MIME_TYPES = [
  'image/jpeg', 'image/png', 'application/pdf',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
];

/**
 * الداعم الأكاديمي — كيان منفصل تماماً عن Teacher (راجع AcademicSupporter model
 * بالباك اند). هذه الخدمة الوحيدة التي تعرف طريقة جلب/تعديل بياناته، سواء من
 * منظور الأدمن (إدارة الحسابات) أو الداعم نفسه (ملفه الشخصي) أو الطالب الجامعي
 * (تصفّح/بروفايل). كل الأفعال تمرّ عبر /academic-supporters/* فقط.
 */
export const academicSupporterService = {
  // ----- Admin -----
  async getAdminList(filters = {}) {
    const { page = 1, per_page: perPage = 20, ...rest } = filters;
    if (config.useMocks) {
      await mockDelay(300);
      return { data: [], total: 0, currentPage: 1, lastPage: 1 };
    }
    const { data } = await client.get(endpoints.admin.academicSupporters, { params: { ...rest, page, per_page: perPage } });
    return {
      data: data.data,
      total: data.meta?.total ?? data.data.length,
      currentPage: data.meta?.current_page ?? page,
      lastPage: data.meta?.last_page ?? 1,
    };
  },

  async getAdminDetail(id) {
    if (config.useMocks) {
      await mockDelay(300);
      return null;
    }
    const { data } = await client.get(endpoints.admin.academicSupporterDetail(id));
    return data.data;
  },

  async createAccount(payload) {
    if (config.useMocks) {
      await mockDelay(400);
      return { id: Date.now(), ...payload };
    }
    const { data } = await client.post(endpoints.admin.createAcademicSupporterAccount, payload);
    return data.data;
  },

  async resetPassword(id, password) {
    if (config.useMocks) {
      await mockDelay(400);
      return true;
    }
    const { data } = await client.put(endpoints.admin.resetAcademicSupporterPassword(id), { password });
    return data.data;
  },

  async suspend(id, reason) {
    if (config.useMocks) {
      await mockDelay(400);
      return true;
    }
    const { data } = await client.post(endpoints.admin.suspendAcademicSupporter(id), { reason });
    return data.data;
  },

  async reactivate(id) {
    if (config.useMocks) {
      await mockDelay(400);
      return true;
    }
    const { data } = await client.post(endpoints.admin.reactivateAcademicSupporter(id));
    return data.data;
  },

  async deleteAccount(id) {
    if (config.useMocks) {
      await mockDelay(400);
      return true;
    }
    const { data } = await client.delete(endpoints.admin.deleteAcademicSupporter(id));
    return data.data;
  },

  // ----- Self-serve (الداعم نفسه — نفس مسارات الأدمن، صلاحيات موسَّعة للمالك) -----
  async getMyProfile(id) {
    if (config.useMocks) {
      await mockDelay(200);
      return null;
    }
    const { data } = await client.get(endpoints.admin.academicSupporterDetail(id));
    return data.data;
  },

  async updateProfile(id, payload) {
    if (config.useMocks) {
      await mockDelay(300);
      return payload;
    }
    const { data } = await client.put(endpoints.admin.updateAcademicSupporter(id), payload);
    return data.data;
  },

  /** $thumbnail صورة مصغّرة اختيارية يرفعها الداعم يدوياً — بلا توليد تلقائي (راجع FileTypeIcon) */
  async addGalleryItem(id, file, thumbnail = null) {
    assertFileWithinLimits(file, {
      maxBytes: 20 * 1024 * 1024,
      mimeTypes: GALLERY_MIME_TYPES,
      field: 'file',
      sizeMessage: 'حجم الملف أكبر من الحد المسموح (20 ميغابايت كحد أقصى)',
      typeMessage: 'صيغة الملف غير مدعومة — يُسمح فقط بصورة، PDF، أو ملف PowerPoint/Excel',
    });
    if (thumbnail) {
      assertFileWithinLimits(thumbnail, {
        maxBytes: 5 * 1024 * 1024,
        mimeTypes: ['image/jpeg', 'image/png'],
        field: 'thumbnail',
        sizeMessage: 'حجم الصورة المصغّرة أكبر من الحد المسموح (5 ميغابايت كحد أقصى)',
        typeMessage: 'صيغة الصورة المصغّرة غير مدعومة — يُسمح فقط بـ JPG أو PNG',
      });
    }
    const form = new FormData();
    form.append('file', file);
    if (thumbnail) form.append('thumbnail', thumbnail);
    const { data } = await client.post(endpoints.admin.academicSupporterGalleryItems(id), form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  async removeGalleryItem(itemId) {
    const { data } = await client.delete(endpoints.admin.academicSupporterGalleryItem(itemId));
    return data.data;
  },

  async getMySupportPackages() {
    if (config.useMocks) {
      await mockDelay(300);
      return [];
    }
    const { data } = await client.get(endpoints.supportPackages.list);
    return data.data;
  },

  async createSupportPackage(payload) {
    if (config.useMocks) {
      await mockDelay(500);
      return { id: Date.now(), status: 'pending_approval', ...payload };
    }
    const { data } = await client.post(endpoints.supportPackages.create, payload);
    return data.data;
  },

  async disableSupportPackage(id) {
    const { data } = await client.post(endpoints.supportPackages.disable(id));
    return data.data;
  },

  async enableSupportPackage(id) {
    const { data } = await client.post(endpoints.supportPackages.enable(id));
    return data.data;
  },

  // ----- Admin: approving/rejecting a supporter's support packages (from the supporter's own admin detail page) -----
  async approveSupportPackage(id) {
    const { data } = await client.post(endpoints.supportPackages.approve(id));
    return data.data;
  },

  async rejectSupportPackage(id, reason) {
    const { data } = await client.post(endpoints.supportPackages.reject(id), { reason });
    return data.data;
  },

  async getMyPurchases(filters = {}) {
    if (config.useMocks) {
      await mockDelay(300);
      return { data: [] };
    }
    const { data } = await client.get(endpoints.supportPackagePurchases.list, { params: filters });
    return data;
  },

  // ----- Student-facing (تصفّح/بروفايل — حصراً للطالب الجامعي من داخل لوحته) -----
  async search(filters = {}) {
    if (config.useMocks) {
      await mockDelay(300);
      return { data: [], currentPage: 1, lastPage: 1 };
    }
    const { page = 1, per_page: perPage = 20, ...rest } = filters;
    const { data } = await client.get(endpoints.academicSupporters.search, { params: { ...rest, page, per_page: perPage } });
    return {
      data: data.data,
      currentPage: data.meta?.current_page ?? page,
      lastPage: data.meta?.last_page ?? 1,
    };
  },

  async getPublicProfile(id) {
    if (config.useMocks) {
      await mockDelay(300);
      return null;
    }
    const { data } = await client.get(endpoints.academicSupporters.detail(id));
    return data.data;
  },

  async purchasePackage(supportPackageId, couponCode) {
    const { data } = await client.post(endpoints.supportPackages.purchase(supportPackageId), {
      coupon_code: couponCode || undefined,
    });
    return data.data; // { purchase, checkout_url }
  },

  async getPurchaseDetail(id) {
    const { data } = await client.get(endpoints.supportPackagePurchases.detail(id));
    return data.data;
  },

  async retryPurchaseCheckout(id) {
    const { data } = await client.post(endpoints.supportPackagePurchases.checkout(id));
    return data.data;
  },
};
