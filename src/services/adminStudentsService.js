import { config } from '@/config/env';
import { client, mockDelay } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { assertFileWithinLimits } from '@/lib/fileValidation';
import { searchMockStudents, filterMockStudents } from '@/mocks/adminStudents.mock';

/** GET /students row → مرة لمنتقي الحجز اليدوي (بلا فلاتر)، ومرة لصفحة "إدارة الطلاب" (بكل الحقول) */
function mapStudentRow(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    avatar: row.avatar ?? null,
    isActive: row.is_active ?? row.isActive ?? true,
    educationType: row.education_type ?? row.educationType ?? null,
    imported: row.imported ?? false,
    createdAt: row.created_at ?? row.createdAt ?? null,
  };
}

export const adminStudentsService = {
  /** يُستخدم فقط في منتقي الحجز اليدوي (بحث سريع بلا فلاتر/صفحات) — StudentPolicy::viewAny */
  async search(query) {
    if (config.useMocks) {
      await mockDelay(200);
      return searchMockStudents(query);
    }
    const { data } = await client.get(endpoints.students.search, { params: { search: query, per_page: 10 } });
    return data.data;
  },

  /** صفحة "إدارة الطلاب" لدى الأدمن — يجلب دفعة واحدة كبيرة ثم تُقسَّم صفحاتها في الواجهة (نفس نمط adminService.getTeachers) */
  async list({ search, educationType } = {}) {
    if (config.useMocks) {
      await mockDelay(300);
      const data = filterMockStudents({ search, educationType }).map(mapStudentRow);
      return { data, total: data.length };
    }
    const { data } = await client.get(endpoints.students.search, {
      params: { search: search || undefined, education_type: educationType || undefined, per_page: 200 },
    });
    return { data: data.data.map(mapStudentRow), total: data.meta?.total ?? data.data.length };
  },

  /** الأدمن يضع كلمة مرور جديدة مباشرة — بلا حاجة لمعرفة القديمة، تُرسَل للطالب بالبريد (StudentService::resetPasswordByAdmin) */
  async resetPassword(studentId, password) {
    if (config.useMocks) {
      await mockDelay(400);
      return { message: 'تم تغيير كلمة مرور الطالب بنجاح' };
    }
    const { data } = await client.put(endpoints.students.resetPassword(studentId), { password });
    return { message: data.message };
  },

  /** صفحة تفاصيل طالب لدى الأدمن — نفس مسار StudentController::show (StudentPolicy::view يسمح للأدمن دوماً) */
  async getDetail(id) {
    if (config.useMocks) {
      await mockDelay(300);
      return null;
    }
    const { data } = await client.get(endpoints.students.detail(id));
    return data.data;
  },

  /**
   * الأدمن يكمل/يعدّل الملف الأكاديمي لطالب نيابة عنه — نفس مسار
   * StudentController::update تماماً الذي يستخدمه الطالب لنفسه (studentAccountService)؛
   * StudentPolicy::update وُسِّعت لتقبل الأدمن أيضاً.
   */
  async updateProfile(id, payload) {
    if (config.useMocks) {
      await mockDelay(300);
      return payload;
    }
    const { data } = await client.put(endpoints.students.update(id), payload);
    return data.data;
  },

  /** الأدمن يرفع صورة طالب نيابة عنه — يوازي adminService.uploadTeacherAvatar تماماً */
  async uploadAvatar(id, file) {
    if (config.useMocks) {
      await mockDelay(400);
      return null;
    }
    assertFileWithinLimits(file, {
      maxBytes: 15 * 1024 * 1024,
      mimeTypes: ['image/jpeg', 'image/png'],
      field: 'avatar',
      sizeMessage: 'حجم الصورة أكبر من الحد المسموح (15 ميغابايت كحد أقصى)',
      typeMessage: 'صيغة الصورة غير مدعومة — يُسمح فقط بصورة JPG أو PNG',
    });
    const form = new FormData();
    form.append('avatar', file);
    const { data } = await client.post(endpoints.students.avatar(id), form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  async deleteAvatar(id) {
    if (config.useMocks) {
      await mockDelay(300);
      return null;
    }
    const { data } = await client.delete(endpoints.students.avatar(id));
    return data.data;
  },
};
