import { config } from '@/config/env';
import { client, mockDelay } from '@/api/client';
import { endpoints } from '@/api/endpoints';

/**
 * Mirrors StudentImportService::import() on the backend, via TeacherImportService —
 * partial success, one bad row never aborts the whole batch, errors reported per row.
 * See adminStudentImportService.js for the equivalent student-side implementation.
 */
export const adminTeacherImportService = {
  async importTeachers(file) {
    if (config.useMocks) {
      await mockDelay(900);
      return {
        fileName: file.name,
        imported: 9,
        failed: 1,
        errors: [{ row: 5, errors: { email: ['البريد الإلكتروني مستخدم مسبقاً'] } }],
      };
    }
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await client.post(endpoints.admin.teachersImport, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return { fileName: file.name, ...data.data };
  },
};
