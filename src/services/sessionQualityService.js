import { client } from '@/api/client';
import { endpoints } from '@/api/endpoints';

/** تقييم جودة الجلسة — صفحة الطالب، ولوحة الأدمن (للأدمن فقط). */
export const sessionQualityService = {
  /** الرابط برمز عشوائي يصل من الباك (إشعار الطالب، و quality_rating_path لزر النسخ عند المعلم) */
  async getForStudent(token) {
    const { data } = await client.get(endpoints.sessionQuality.byToken(token));
    return data.data;
  },

  async submit(token, payload) {
    const { data } = await client.post(endpoints.sessionQuality.byToken(token), payload);
    return data;
  },

  /** فلاتر تراكمية: اسم المعلم، اسم الطالب، المادة، والترتيب (latest | highest | lowest) */
  async adminList({ page = 1, teacherName, studentName, subjectId, sort } = {}) {
    const { data } = await client.get(endpoints.sessionQuality.adminList, {
      params: {
        page,
        per_page: 20,
        teacher_name: teacherName || undefined,
        student_name: studentName || undefined,
        subject_id: subjectId || undefined,
        sort: sort || undefined,
      },
    });
    return { items: data.data, meta: data.meta, subjectOptions: data.additional_data?.subjectOptions ?? [] };
  },
};
