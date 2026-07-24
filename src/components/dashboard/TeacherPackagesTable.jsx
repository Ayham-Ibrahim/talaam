import { Eye, Pencil } from 'lucide-react';
import { TEACHER_PACKAGE_TYPE_STYLES } from '@/mocks/teacherDashboard.mock';
import { useT } from '@/hooks/useT';

function SeatsCell({ seats, type }) {
  if (!seats) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="h-3 w-3 rounded-full bg-[#34C759]" />-
      </span>
    );
  }
  const isFull = type !== 'group' || seats.filled === seats.total;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded-full ${isFull ? 'bg-[#34C759]' : 'bg-[#FF8D28]'}`} />
      {type === 'group' ? `${seats.filled}/${seats.total}` : seats.filled}
    </span>
  );
}

export function TeacherPackagesTable({ packages, onEdit, onView }) {
  const t = useT();

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
      <table className="w-full min-w-[900px] text-sm">
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
            const typeStyle = TEACHER_PACKAGE_TYPE_STYLES[pkg.type];
            return (
              <tr key={pkg.id} className={i % 2 === 1 ? 'bg-[#FAFBFD]' : ''}>
                <td className="px-4 py-4 text-right font-semibold text-ink">{pkg.packageTitle}</td>
                <td className="px-4 py-4 text-center font-semibold" style={{ color: typeStyle?.color }}>
                  {typeStyle?.label}
                </td>
                <td className="px-4 py-4 text-center text-ink-soft">{pkg.subject}</td>
                <td className="px-4 py-4 text-center text-ink">
                  <SeatsCell seats={pkg.seats} type={pkg.type} />
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="rounded-pill bg-[#EAFEEF] px-4 py-1.5 text-xs font-bold text-[#34C759]">
                    {t('dashboard.teacherPackages.statusActive')}
                  </span>
                </td>
                <td className="px-4 py-4 text-center font-semibold text-ink">{pkg.price}$</td>
                <td className="px-4 py-4 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => onEdit?.(pkg)}
                      className="text-[#FF8D28] hover:opacity-70"
                      aria-label={t('dashboard.teacherPackages.edit')}
                    >
                      <Pencil size={18} />
                    </button>
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
