import { config } from '@/config/env';
import { client, mockDelay } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import {
  mockAdminTeachers,
  filterMockAdminTeachers,
  getAdminOverviewStats,
  getPendingVerificationTeachers,
  getTeacherDocuments,
  getTeacherBadgeAwards,
  findMockAdminTeacher,
  updateMockTeacher,
  updateMockDocument,
  addMockBadgeAward,
  removeMockBadgeAward,
  BADGE_CATALOG,
} from '@/mocks/admin.mock';
import { getPendingListingsCount } from '@/mocks/adminListings.mock';
import { getOpenComplaintsCount } from '@/mocks/adminComplaints.mock';

/**
 * Admin service — teacher verification, approval and badge management.
 * Same mock/real switch as every other service. The real branch calls the
 * exact routes the backend exposes (see AuthController/TeacherController/
 * VerificationDocumentController/BadgeController).
 */
export const adminService = {
  async getOverview() {
    if (config.useMocks) {
      await mockDelay(300);
      return {
        stats: getAdminOverviewStats(getPendingListingsCount(), getOpenComplaintsCount()),
        pendingVerifications: getPendingVerificationTeachers(),
      };
    }
    const { data } = await client.get(endpoints.dashboard.admin);
    return data.data;
  },

  /**
   * ترقيم الصفحات حقيقي من الباك اند (page/per_page) — لا يُجلب كل المعلمين
   * دفعة واحدة ثم يُقصّ محلياً؛ كان هذا يحصر القائمة فعلياً بأول صفحة واحدة
   * فقط (افتراضياً 20 صفاً) بصرف النظر عن العدد الحقيقي لكل نوع معلم،
   * فتظهر أعداد أقل بكثير من الواقع (RULE، انظر AdminTeachersPage).
   */
  async getTeachers(filters = {}) {
    const { page = 1, per_page: perPage = 20, ...rest } = filters;

    if (config.useMocks) {
      await mockDelay(300);
      const all = filterMockAdminTeachers(mockAdminTeachers, rest);
      const start = (page - 1) * perPage;
      return {
        data: all.slice(start, start + perPage),
        total: all.length,
        currentPage: page,
        lastPage: Math.max(1, Math.ceil(all.length / perPage)),
      };
    }
    // الباك اند يتوقع teacher_type/search — لا type/q (اسما الحقلين الداخليان في
    // هذه الصفحة وفلترة المحاكاة) — راجع TeacherController::index. تحويل الاسم
    // هنا فقط بدل تغييره في كل مكان آخر يستخدم filters.type/filters.q محلياً.
    const { type, q, ...restParams } = rest;
    const params = {
      ...restParams,
      page,
      per_page: perPage,
      ...(type ? { teacher_type: type } : {}),
      ...(q ? { search: q } : {}),
    };
    const { data } = await client.get(endpoints.admin.teachers, { params });
    return {
      data: data.data,
      total: data.meta?.total ?? data.data.length,
      currentPage: data.meta?.current_page ?? page,
      lastPage: data.meta?.last_page ?? 1,
    };
  },

  /** الأدمن يضع كلمة مرور مباشرة — لا رابط دعوة، الحساب فعّال فوراً (انظر TeacherService::createByAdmin) */
  async createTeacherAccount(payload) {
    if (config.useMocks) {
      await mockDelay(400);
      return { id: Date.now(), ...payload };
    }
    const { data } = await client.post(endpoints.admin.createTeacherAccount, payload);
    return data.data;
  },

  async createStudentAccount(payload) {
    if (config.useMocks) {
      await mockDelay(400);
      return { id: Date.now(), ...payload };
    }
    const { data } = await client.post(endpoints.admin.createStudentAccount, payload);
    return data.data;
  },

  async getTeacherDetail(id) {
    if (config.useMocks) {
      await mockDelay(300);
      const teacher = findMockAdminTeacher(id);
      if (!teacher) return null;
      return {
        teacher,
        documents: getTeacherDocuments(id),
        badgeAwards: getTeacherBadgeAwards(id),
        badgeCatalog: BADGE_CATALOG,
      };
    }
    const { data } = await client.get(endpoints.admin.teacherDetail(id));
    return data.data;
  },

  async approveTeacher(id) {
    if (config.useMocks) {
      await mockDelay(400);
      return updateMockTeacher(id, {
        status: 'verified',
        verifiedAt: new Date().toISOString().slice(0, 10),
        rejectionReason: null,
        suspensionReason: null,
      });
    }
    const { data } = await client.post(endpoints.admin.approveTeacher(id));
    return data.data;
  },

  async rejectTeacher(id, reason) {
    if (config.useMocks) {
      await mockDelay(400);
      return updateMockTeacher(id, { status: 'rejected', rejectionReason: reason });
    }
    const { data } = await client.post(endpoints.admin.rejectTeacher(id), { reason });
    return data.data;
  },

  async suspendTeacher(id, reason) {
    if (config.useMocks) {
      await mockDelay(400);
      return updateMockTeacher(id, { status: 'suspended', suspensionReason: reason });
    }
    const { data } = await client.post(endpoints.admin.suspendTeacher(id), { reason });
    return data.data;
  },

  async reactivateTeacher(id) {
    if (config.useMocks) {
      await mockDelay(400);
      return updateMockTeacher(id, { status: 'verified', suspensionReason: null });
    }
    // كانت تستدعي approveTeacher خطأً — endpoint التوثيق يشترط status='pending_verification'
    // تحديداً في الباك اند، فيُرفض دائماً لمعلم suspended فعلياً (RULE، انظر
    // TeacherService::reactivate). مسار reactivate مخصَّص فعلياً لهذا الانتقال.
    const { data } = await client.post(endpoints.admin.reactivateTeacher(id));
    return data.data;
  },

  /** متاح فقط لمعلم status='rejected' (يتحقق منه الباك اند) — حذف حقيقي نهائي لكل بياناته ووثائقه */
  async deleteTeacher(id) {
    if (config.useMocks) {
      await mockDelay(400);
      return null;
    }
    const { data } = await client.delete(endpoints.admin.deleteTeacher(id));
    return data.data;
  },

  /** الأدمن يضع كلمة مرور جديدة مباشرة — بلا حاجة لمعرفة القديمة، تُرسَل للمعلم بالبريد (TeacherService::resetPasswordByAdmin) */
  async resetTeacherPassword(teacherId, password) {
    if (config.useMocks) {
      await mockDelay(400);
      return { message: 'تم تغيير كلمة مرور المعلم بنجاح' };
    }
    const { data } = await client.put(endpoints.teachers.resetPassword(teacherId), { password });
    return { message: data.message };
  },

  /** رابط موقَّع صالح 15 دقيقة (VerificationDocumentController::downloadUrl) — لا مقابل مباشر في وضع المحاكاة */
  async getDocumentDownloadUrl(documentId) {
    if (config.useMocks) {
      await mockDelay(200);
      return null;
    }
    const { data } = await client.post(endpoints.admin.documentDownloadUrl(documentId));
    return data.data.url;
  },

  async approveDocument(documentId) {
    if (config.useMocks) {
      await mockDelay(300);
      return updateMockDocument(documentId, { status: 'approved', rejectionReason: null });
    }
    const { data } = await client.post(endpoints.admin.approveDocument(documentId));
    return data.data;
  },

  async rejectDocument(documentId, reason) {
    if (config.useMocks) {
      await mockDelay(300);
      return updateMockDocument(documentId, { status: 'rejected', rejectionReason: reason });
    }
    const { data } = await client.post(endpoints.admin.rejectDocument(documentId), { reason });
    return data.data;
  },

  async grantBadge(teacherId, badgeId) {
    if (config.useMocks) {
      await mockDelay(300);
      return addMockBadgeAward(teacherId, badgeId);
    }
    const { data } = await client.post(endpoints.admin.grantBadge(teacherId), { badge_id: badgeId });
    return data.data;
  },

  async revokeBadge(awardId) {
    if (config.useMocks) {
      await mockDelay(300);
      removeMockBadgeAward(awardId);
      return true;
    }
    const { data } = await client.post(endpoints.admin.revokeBadge(awardId));
    return data.data;
  },
};
