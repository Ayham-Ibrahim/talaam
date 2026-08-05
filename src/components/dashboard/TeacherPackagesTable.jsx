import { Eye, Pencil, Send } from 'lucide-react';
import { TEACHER_PACKAGE_TYPE_STYLES, TEACHER_PACKAGE_STATUS_STYLES } from '@/mocks/teacherDashboard.mock';
import { useTaxonomyList } from '@/hooks/useTaxonomy';
import { useT } from '@/hooks/useT';

function SeatsCell({ capacity, enrolledCount, format }) {
  if (format !== 'group') {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className={`h-3 w-3 rounded-full ${enrolledCount > 0 ? 'bg-[#34C759]' : 'bg-line'}`} />-
      </span>
    );
  }
  const isFull = enrolledCount >= capacity;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded-full ${isFull ? 'bg-[#34C759]' : 'bg-[#FF8D28]'}`} />
      {enrolledCount}/{capacity}
    </span>
  );
}

export function TeacherPackagesTable({ packages, onEdit, onView, onSubmit, isSubmitting }) {
  const t = useT();
  const { data: subjects = [] } = useTaxonomyList('subjects');

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
      <table className="w-full min-w-[960px] text-sm">
        <thead>
          <tr className="border-b border-line">
            <th className="px-4 py-4 text-right font-bold text-ink">{t('dashboard.teacherPackages.package')}</th>
            <th className="px-4 py-4 text-center font-bold text-ink">{t('dashboard.teacherPackages.type')}</th>
            <th className="px-4 py-4 text-center font-bold text-ink">{t('dashboard.teacherPackages.subject')}</th>
            <th className="px-4 py-4 text-center font-bold text-ink">{t('dashboard.teacherPackages.seats')}</th>
            <th className="px-4 py-4 text-center font-bold text-ink">{t('dashboard.teacherPackages.status')}</th>
            <th className="px-4 py-4 text-center font-bold text-ink">{t('dashboard.teacherPackages.price')}</th>
            <th className="px-4 py-4 text-center font-bold text-ink">{t('dashboard.teacherPackages.action')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {packages.map((pkg, i) => {
            const typeStyle = TEACHER_PACKAGE_TYPE_STYLES[pkg.session_format];
            const statusStyle = TEACHER_PACKAGE_STATUS_STYLES[pkg.status] ?? TEACHER_PACKAGE_STATUS_STYLES.draft;
            const subjectName = subjects.find((s) => s.id === pkg.subject_id)?.name_ar ?? '—';
            return (
              <tr key={pkg.id} className={i % 2 === 1 ? 'bg-[#FAFBFD]' : ''}>
                <td className="px-4 py-4 text-right font-semibold text-ink">{pkg.title}</td>
                <td className="px-4 py-4 text-center font-semibold" style={{ color: typeStyle?.color }}>
                  {typeStyle?.label}
                </td>
                <td className="px-4 py-4 text-center text-ink-soft">{subjectName}</td>
                <td className="px-4 py-4 text-center text-ink">
                  <SeatsCell capacity={pkg.capacity} enrolledCount={pkg.enrolled_count} format={pkg.session_format} />
                </td>
                <td className="px-4 py-4 text-center">
                  <span
                    className="rounded-pill px-4 py-1.5 text-xs font-bold"
                    style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
                  >
                    {statusStyle.label}
                  </span>
                </td>
                <td className="px-4 py-4 text-center font-semibold text-ink">{pkg.teacher_price}$</td>
                <td className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-3">
                    {pkg.status === 'draft' && (
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => onSubmit?.(pkg)}
                        className="text-success hover:opacity-70 disabled:opacity-40"
                        aria-label={t('dashboard.teacherPackages.submitForReview')}
                        title={t('dashboard.teacherPackages.submitForReview')}
                      >
                        <Send size={18} />
                      </button>
                    )}
                    {pkg.status === 'draft' && (
                      <button
                        type="button"
                        onClick={() => onEdit?.(pkg)}
                        className="text-[#FF8D28] hover:opacity-70"
                        aria-label={t('dashboard.teacherPackages.edit')}
                        title={t('dashboard.teacherPackages.edit')}
                      >
                        <Pencil size={18} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onView?.(pkg)}
                      className="text-[#00C0E8] hover:opacity-70"
                      aria-label={t('dashboard.teacherPackages.view')}
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
