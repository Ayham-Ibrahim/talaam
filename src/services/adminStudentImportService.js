import { config } from '@/config/env';
import { client, mockDelay } from '@/api/client';
import { endpoints } from '@/api/endpoints';

/**
 * Mirrors StudentImportService::import() on the backend: partial success —
 * one bad row never aborts the whole batch, errors are reported per row.
 * The mock can't actually parse the file's contents (no XLSX parser on the
 * frontend), so it fabricates a plausible result the same way other mock
 * services do — real parsing happens once VITE_USE_MOCKS=false.
 */
export const adminStudentImportService = {
  async importStudents(file) {
    if (config.useMocks) {
      await mockDelay(900);
      return {
        fileName: file.name,
        imported: 11,
        failed: 2,
        errors: [
          { row: 4, errors: { email: ['البريد الإلكتروني مستخدم مسبقاً'] } },
          { row: 9, errors: { curriculum_code: ['الرمز "cambridge-x" غير معروف'] } },
        ],
      };
    }
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await client.post(endpoints.admin.studentsImport, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
