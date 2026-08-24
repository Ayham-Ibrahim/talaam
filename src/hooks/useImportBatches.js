import { useQuery } from '@tanstack/react-query';
import { importBatchService, isImportBatchActive } from '@/services/importBatchService';

/**
 * يستطلع دفعة استيراد واحدة دورياً (كل 3 ثوانٍ) طالما لا تزال queued/processing،
 * ويتوقف تلقائياً بمجرد اكتمالها أو فشلها — هذا ما يُغني الأدمن عن انتظار
 * استجابة الطلب الأصلي (الذي بات يعود فوراً بحالة queued فقط، راجع
 * StudentImportController::store).
 */
export function useImportBatch(batchId, { enabled = true } = {}) {
  return useQuery({
    queryKey: ['importBatches', 'detail', batchId],
    queryFn: () => importBatchService.get(batchId),
    enabled: enabled && !!batchId,
    refetchInterval: (query) => (isImportBatchActive(query.state.data) ? 3000 : false),
  });
}

/** سجل كل عمليات الاستيراد (طلاب/معلمين) — صفحة "مراقبة الاستيراد" في لوحة الأدمن. */
export function useImportBatches({ type } = {}) {
  return useQuery({
    queryKey: ['importBatches', 'list', type ?? 'all'],
    queryFn: () => importBatchService.list({ type }),
    refetchInterval: (query) => ((query.state.data ?? []).some(isImportBatchActive) ? 4000 : false),
  });
}
