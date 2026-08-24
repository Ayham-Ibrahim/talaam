import { config } from '@/config/env';
import { client, mockDelay } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { mapImportBatch } from '@/services/importBatchService';

/** يوازي adminStudentImportService.js تماماً — راجع تعليقه لتفصيل سبب الاستجابة الفورية بحالة "queued" فقط. */
export const adminTeacherImportService = {
  async importTeachers(file) {
    if (config.useMocks) {
      await mockDelay(400);
      return { id: Date.now(), type: 'teacher', status: 'queued', fileName: file.name };
    }
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await client.post(endpoints.admin.teachersImport, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
    return mapImportBatch(data.data);
  },
};
