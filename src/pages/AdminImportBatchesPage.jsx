import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { AdminDashboardLayout } from '@/components/dashboard/admin/AdminDashboardLayout';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useImportBatches } from '@/hooks/useImportBatches';
import { formatDateTime } from '@/lib/formatters';
import { useT } from '@/hooks/useT';

const FILTERS = [
  { value: undefined, key: 'filterAll' },
  { value: 'student', key: 'filterStudents' },
  { value: 'teacher', key: 'filterTeachers' },
];

const STATUS_STYLES = {
  queued: 'bg-line/50 text-ink-soft',
  processing: 'bg-primary-light text-primary',
  completed: 'bg-success-light text-success',
  failed: 'bg-accent-pink/10 text-accent-pink',
};

function StatusBadge({ status }) {
  const t = useT();
  return (
    <span className={`inline-flex items-center rounded-pill px-3 py-1 text-xs font-bold ${STATUS_STYLES[status]}`}>
      {t(`dashboard.importBatches.status${status.charAt(0).toUpperCase()}${status.slice(1)}`)}
    </span>
  );
}

function BatchRow({ batch }) {
  const t = useT();
  const [expanded, setExpanded] = useState(false);
  const hasErrors = batch.errors?.length > 0;

  return (
    <>
      <tr className="border-b border-line/60">
        <td className="px-4 py-3 text-sm text-ink">{t(`dashboard.importBatches.type${batch.type === 'student' ? 'Student' : 'Teacher'}`)}</td>
        <td className="max-w-[200px] truncate px-4 py-3 text-sm text-ink" title={batch.fileName}>{batch.fileName}</td>
        <td className="px-4 py-3"><StatusBadge status={batch.status} /></td>
        <td className="px-4 py-3 text-sm text-ink-soft">
          {batch.totalRows != null ? `${batch.processedRows}/${batch.totalRows} (${batch.progressPercent}%)` : '—'}
        </td>
        <td className="px-4 py-3 text-sm font-semibold text-success">{batch.importedCount}</td>
        <td className="px-4 py-3 text-sm font-semibold text-accent-pink">{batch.failedCount}</td>
        <td className="px-4 py-3 text-sm text-ink-soft">{batch.createdBy ?? '—'}</td>
        <td className="px-4 py-3 text-sm text-ink-soft">{formatDateTime(batch.createdAt)}</td>
        <td className="px-4 py-3">
          {hasErrors && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:opacity-70"
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </td>
      </tr>
      {expanded && hasErrors && (
        <tr className="border-b border-line/60 bg-canvas">
          <td colSpan={9} className="px-4 py-3">
            <ul className="flex flex-col gap-1 text-xs text-ink-soft">
              {batch.errors.map((err) => (
                <li key={err.row}>
                  <span className="font-bold text-ink">{err.row}:</span>{' '}
                  {Object.values(err.errors).flat().join('، ')}
                </li>
              ))}
            </ul>
          </td>
        </tr>
      )}
      {batch.status === 'failed' && batch.failureReason && (
        <tr className="border-b border-line/60 bg-accent-pink/5">
          <td colSpan={9} className="px-4 py-2 text-xs text-accent-pink">{batch.failureReason}</td>
        </tr>
      )}
    </>
  );
}

export function AdminImportBatchesPage() {
  const t = useT();
  const { user } = useAuth();
  const [type, setType] = useState(undefined);
  const { data: batches, isLoading, isError, refetch } = useImportBatches({ type });

  if (!user) return <Navigate to="/login" replace />;

  return (
    <AdminDashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="text-right">
          <h1 className="text-xl font-bold text-ink">{t('dashboard.importBatches.title')}</h1>
          <p className="mt-1 text-sm text-ink-soft">{t('dashboard.importBatches.subtitle')}</p>
        </div>

        <div className="flex items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setType(f.value)}
              className={`rounded-pill px-4 py-1.5 text-sm font-medium transition-colors ${
                type === f.value ? 'bg-primary text-white' : 'bg-line/40 text-ink-soft hover:bg-line/60'
              }`}
            >
              {t(`dashboard.importBatches.${f.key}`)}
            </button>
          ))}
        </div>

        {isError ? (
          <ErrorState onRetry={refetch} />
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-2xl" />
            ))}
          </div>
        ) : !batches || batches.length === 0 ? (
          <EmptyState title={t('dashboard.importBatches.empty')} />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-card">
            <table className="w-full min-w-[820px] text-right text-sm">
              <thead>
                <tr className="border-b border-line bg-canvas">
                  <th className="px-4 py-3 font-bold text-ink">{t('dashboard.importBatches.colType')}</th>
                  <th className="px-4 py-3 font-bold text-ink">{t('dashboard.importBatches.colFile')}</th>
                  <th className="px-4 py-3 font-bold text-ink">{t('dashboard.importBatches.colStatus')}</th>
                  <th className="px-4 py-3 font-bold text-ink">{t('dashboard.importBatches.colProgress')}</th>
                  <th className="px-4 py-3 font-bold text-ink">{t('dashboard.importBatches.colImported')}</th>
                  <th className="px-4 py-3 font-bold text-ink">{t('dashboard.importBatches.colFailed')}</th>
                  <th className="px-4 py-3 font-bold text-ink">{t('dashboard.importBatches.colCreatedBy')}</th>
                  <th className="px-4 py-3 font-bold text-ink">{t('dashboard.importBatches.colDate')}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {batches.map((batch) => (
                  <BatchRow key={batch.id} batch={batch} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
