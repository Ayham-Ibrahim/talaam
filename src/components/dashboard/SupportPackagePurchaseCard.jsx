import { Link } from 'react-router-dom';
import { formatPrice, formatDate } from '@/lib/formatters';
import { useT } from '@/hooks/useT';

const STATUS_STYLES = {
  pending_payment: { bg: '#FEF3E2', color: '#B7791F' },
  confirmed: { bg: '#E3F5EC', color: '#2E9E6B' },
  expired: { bg: '#F2F2F7', color: '#6B7280' },
};

/** بطاقة اشتراك باقة دعم أكاديمي بتاب "الباقات" للطالب الجامعي — نظير PackageListCard لكن بلا إحصائيات جلسات (لا جلسات لهذا النوع أصلاً) */
export function SupportPackagePurchaseCard({ purchase }) {
  const t = useT();
  const style = STATUS_STYLES[purchase.status] ?? STATUS_STYLES.expired;
  const supportPackage = purchase.support_package;
  const subjects = supportPackage?.subjects ?? [];

  return (
    <Link
      to={`/dashboard/student/academic-support/${purchase.academic_supporter_id}`}
      className="flex w-full flex-col gap-4 rounded-2xl border border-line bg-white p-5 shadow-card transition-shadow hover:shadow-lift"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-right">
          <div className="font-bold text-ink">{supportPackage?.title || '—'}</div>
          <div className="text-sm text-ink-soft">
            {purchase.academic_supporter?.user?.name}
            {' — '}
            {t(`dashboard.teacherSupportPackages.tier${supportPackage?.tier === 'premium' ? 'Premium' : 'Basic'}`)}
          </div>
        </div>
        <span className="rounded-pill px-3 py-1 text-xs font-bold" style={{ backgroundColor: style.bg, color: style.color }}>
          {t(`academicSupporter.students.status.${purchase.status}`)}
        </span>
      </div>

      {subjects.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {subjects.map((s) => (
            <span key={s.id} className="rounded-lg bg-[#F2F2F7] px-4 py-2 text-xs font-semibold text-ink-soft">
              {s.name_ar}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-ink-soft">{formatDate(purchase.confirmed_at ?? purchase.created_at)}</span>
        <span className="font-semibold text-price">{formatPrice(purchase.amount, purchase.currency)}</span>
      </div>
    </Link>
  );
}
