import { config } from '@/config/env';
import { client, mockDelay } from '@/api/client';
import { endpoints } from '@/api/endpoints';
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
};
