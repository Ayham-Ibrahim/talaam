import { Loader2 } from 'lucide-react';
import { useT } from '@/hooks/useT';

/**
 * حالة دفعة استيراد قيد المتابعة (queued/processing/failed) — الحالة
 * "completed" يُترَك عرضها لجدول النتائج الموجود أصلاً (StudentImportResults/
 * TeacherImportResults) عبر renderResults، فلا تكرار في عرض الأرقام النهائية.
 */
export function ImportBatchStatus({ batch, renderResults }) {
  const t = useT();

  if (!batch) return null;

  if (batch.status === 'queued' || batch.status === 'processing') {
    return (
      <div className="rounded-2xl border border-line bg-white p-5">
        <div className="flex items-center justify-between text-sm font-bold text-ink">
          <span className="flex items-center gap-2">
            <Loader2 size={16} className="animate-spin text-primary" />
            {t(batch.status === 'queued' ? 'dashboard.importBatch.queued' : 'dashboard.importBatch.processing')}
          </span>
          {batch.totalRows != null && (
            <span className="text-ink-soft">
              {batch.processedRows}/{batch.totalRows} {t('dashboard.importBatch.rowsProgress')}
            </span>
          )}
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-line/50">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${batch.progressPercent}%` }}
          />
        </div>
      </div>
    );
  }

  if (batch.status === 'failed') {
    return (
      <div className="rounded-btn bg-accent-pink/10 px-4 py-3 text-sm text-accent-pink">
        {batch.failureReason || t('dashboard.importBatch.failedGeneric')}
      </div>
    );
  }

  return renderResults({ imported: batch.importedCount, failed: batch.failedCount, errors: batch.errors });
}
