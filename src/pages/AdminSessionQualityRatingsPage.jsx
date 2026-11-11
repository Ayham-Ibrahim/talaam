import { useState } from 'react';
import { Filter, Star } from 'lucide-react';
import { AdminDashboardLayout } from '@/components/dashboard/admin/AdminDashboardLayout';
import { Pagination } from '@/components/dashboard/Pagination';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useAdminSessionQualityRatings } from '@/hooks/useSessionQuality';
import { formatDateTime } from '@/lib/formatters';
import { SESSION_QUALITY_CRITERIA } from '@/pages/SessionQualityRatingPage';
import { useT } from '@/hooks/useT';

function Score({ value }) {
  const color = value >= 4 ? 'text-success' : value >= 3 ? 'text-[#B7791F]' : 'text-red-600';
  return (
    <span className={`inline-flex items-center gap-1 font-bold ${color}`}>
      {value}
      <Star size={13} className="fill-current" />
    </span>
  );
}

/**
 * تقييمات جودة الجلسات — للأدمن فقط (لا تظهر للمعلم ولا في بروفايله). كل سطر: بيانات الجلسة
 * (الباقة، نوعها، رقم الجلسة، المعلم، الطالب، المادة، تاريخ الجلسة والتقييم) ثم المعايير الخمسة والتعليق.
 */
const EMPTY_FILTERS = { sort: 'latest', teacherName: '', studentName: '', subjectId: '' };

const inputClass =
  'rounded-btn border border-line bg-surface p-2.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

export function AdminSessionQualityRatingsPage() {
  const t = useT();
  const [page, setPage] = useState(1);
  // المُدخَل حالياً بالحقول، والمُطبَّق فعلاً (بزر "تصفية") — كل الفلاتر تُطبَّق معاً
  const [draft, setDraft] = useState(EMPTY_FILTERS);
  const [applied, setApplied] = useState(EMPTY_FILTERS);
  const { data, isLoading, isError, refetch } = useAdminSessionQualityRatings({ page, ...applied });
  const rows = data?.items ?? [];
  const subjectOptions = data?.subjectOptions ?? [];
  const hasFilters = JSON.stringify(applied) !== JSON.stringify(EMPTY_FILTERS);

  const set = (key) => (e) => setDraft((prev) => ({ ...prev, [key]: e.target.value }));
  const applyFilters = (e) => {
    e?.preventDefault();
    setApplied({ ...draft, teacherName: draft.teacherName.trim(), studentName: draft.studentName.trim() });
    setPage(1);
  };
  const resetFilters = () => {
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setPage(1);
  };

  const infoCols = ['package', 'packageType', 'sessionNumber', 'teacher', 'student', 'subject', 'sessionDate', 'ratedAt'];

  return (
    <AdminDashboardLayout variant="admin">
      <div className="flex flex-col gap-6">
        <div className="text-right">
          <h1 className="text-xl font-bold text-ink">{t('sessionQuality.adminTitle')}</h1>
          <p className="mt-1 text-sm text-ink-soft">{t('sessionQuality.adminSubtitle')}</p>
        </div>

        <form onSubmit={applyFilters} className="flex flex-wrap items-end gap-3 rounded-2xl bg-white p-4 shadow-card">
          <label className="flex flex-col gap-1.5 text-right">
            <span className="text-sm font-semibold text-ink">{t('sessionQuality.filters.sort')}</span>
            <select value={draft.sort} onChange={set('sort')} className={inputClass}>
              {['latest', 'highest', 'lowest'].map((key) => (
                <option key={key} value={key}>
                  {t(`sessionQuality.filters.sortOptions.${key}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-[180px] flex-col gap-1.5 text-right">
            <span className="text-sm font-semibold text-ink">{t('sessionQuality.filters.teacherName')}</span>
            <input value={draft.teacherName} onChange={set('teacherName')} placeholder={t('sessionQuality.filters.teacherPlaceholder')} className={inputClass} />
          </label>
          <label className="flex min-w-[180px] flex-col gap-1.5 text-right">
            <span className="text-sm font-semibold text-ink">{t('sessionQuality.filters.studentName')}</span>
            <input value={draft.studentName} onChange={set('studentName')} placeholder={t('sessionQuality.filters.studentPlaceholder')} className={inputClass} />
          </label>
          <label className="flex min-w-[160px] flex-col gap-1.5 text-right">
            <span className="text-sm font-semibold text-ink">{t('sessionQuality.filters.subject')}</span>
            <select value={draft.subjectId} onChange={set('subjectId')} className={inputClass}>
              <option value="">{t('sessionQuality.filters.allSubjects')}</option>
              {subjectOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover">
            <Filter size={16} />
            {t('sessionQuality.filters.apply')}
          </button>
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink-soft hover:bg-line/30"
          >
            {t('sessionQuality.filters.reset')}
          </button>
        </form>

        {isError ? (
          <ErrorState onRetry={refetch} />
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-2xl" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState title={t(hasFilters ? 'sessionQuality.adminNoMatches' : 'sessionQuality.adminEmpty')} />
        ) : (
          <>
            <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
              <table className="w-full text-sm" style={{ minWidth: 1600 }}>
                <thead>
                  <tr className="border-b border-line text-right">
                    {infoCols.map((col) => (
                      <th key={col} className="whitespace-nowrap px-4 py-3 font-bold text-ink">
                        {t(`sessionQuality.info.${col}`)}
                      </th>
                    ))}
                    <th className="whitespace-nowrap px-4 py-3 font-bold text-ink">{t('sessionQuality.info.average')}</th>
                    {SESSION_QUALITY_CRITERIA.map((c) => (
                      <th key={c.key} className="whitespace-nowrap px-4 py-3 font-bold text-ink">
                        {t(`sessionQuality.criteriaShort.${c.key}`)}
                      </th>
                    ))}
                    <th className="px-4 py-3 font-bold text-ink">{t('sessionQuality.info.comment')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.map((row, i) => (
                    <tr key={row.id} className={i % 2 === 1 ? 'bg-[#FAFBFD]' : ''}>
                      <td className="px-4 py-3 font-semibold text-ink">{row.packageTitle ?? '—'}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-ink-soft">
                        {row.packageType ? t(`sessionQuality.packageTypes.${row.packageType}`) : '—'}
                      </td>
                      <td className="px-4 py-3 text-ink-soft">{row.sessionNumber ?? '—'}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-ink">{row.teacherName ?? '—'}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-ink">{row.studentName ?? '—'}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{row.subjectName ?? '—'}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{row.sessionDate ? formatDateTime(row.sessionDate) : '—'}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{row.ratedAt ? formatDateTime(row.ratedAt) : '—'}</td>
                      <td className="px-4 py-3">
                        <Score value={row.averageScore} />
                      </td>
                      {SESSION_QUALITY_CRITERIA.map((c) => (
                        <td key={c.key} className="px-4 py-3">
                          <Score value={row[c.key]} />
                        </td>
                      ))}
                      <td className="max-w-xs px-4 py-3 text-ink-soft">{row.comment || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data?.meta?.last_page > 1 && (
              <Pagination page={data.meta.current_page} totalPages={data.meta.last_page} onChange={setPage} />
            )}
          </>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
