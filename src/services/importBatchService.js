import { config } from '@/config/env';
import { client, mockDelay } from '@/api/client';
import { endpoints } from '@/api/endpoints';

/** GET/POST /import-batches(/{id}) row → مراقبة تقدّم استيراد الطلاب/المعلمين (ProcessStudentImportJob/ProcessTeacherImportJob) */
export function mapImportBatch(batch) {
  return {
    id: batch.id,
    type: batch.type,
    status: batch.status,
    fileName: batch.file_name,
    totalRows: batch.total_rows,
    processedRows: batch.processed_rows,
    importedCount: batch.imported_count,
    failedCount: batch.failed_count,
    progressPercent: batch.progress_percent,
    errors: batch.errors ?? [],
    failureReason: batch.failure_reason,
    createdBy: batch.created_by,
    startedAt: batch.started_at,
    completedAt: batch.completed_at,
    createdAt: batch.created_at,
  };
}

/** true طالما الدفعة لا تزال قيد الانتظار/المعالجة — يُستخدم لإيقاف الاستطلاع الدوري تلقائياً بمجرد الانتهاء */
export function isImportBatchActive(batch) {
  return batch?.status === 'queued' || batch?.status === 'processing';
}

export const importBatchService = {
  async list({ type } = {}) {
    if (config.useMocks) {
      await mockDelay(300);
      return [];
    }
    const { data } = await client.get(endpoints.admin.importBatches, {
      params: { type, per_page: 50 },
    });
    return data.data.map(mapImportBatch);
  },

  async get(id) {
    if (config.useMocks) {
      await mockDelay(300);
      return null;
    }
    const { data } = await client.get(endpoints.admin.importBatch(id));
    return mapImportBatch(data.data);
  },
};
