import { config } from '@/config/env';
import { client, mockDelay } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { mapImportBatch } from '@/services/importBatchService';

/**
 * الاستيراد يعمل الآن في الخلفية عبر طابور (ProcessStudentImportJob) — هذا
 * الطلب يعيد فوراً دفعة بحالة "queued" فقط (لا نتيجة نهائية)، ويتابع الأدمن
 * تقدّمها عبر useImportBatch (استطلاع دوري GET /import-batches/{id}) بدل
 * انتظار استجابة هذا الطلب. راجع StudentImportController::store.
 */
export const adminStudentImportService = {
  async importStudents(file) {
    if (config.useMocks) {
      await mockDelay(400);
      return { id: Date.now(), type: 'student', status: 'queued', fileName: file.name };
    }
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await client.post(endpoints.admin.studentsImport, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
    return mapImportBatch(data.data);
  },
};
