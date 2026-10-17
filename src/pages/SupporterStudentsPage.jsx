import { Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Avatar, EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { formatPrice, formatDate } from '@/lib/formatters';
import { useAuth } from '@/hooks/useAuth';
import { useMySupporterPurchases } from '@/hooks/useSupporterAccount';
import { useT } from '@/hooks/useT';

const STATUS_STYLES = {
  pending_payment: { bg: '#FEF3E2', color: '#B7791F' },
  confirmed: { bg: '#E3F5EC', color: '#2E9E6B' },
  expired: { bg: '#F2F2F7', color: '#6B7280' },
};

/** الطلاب الجامعيون الذين اشتروا باقات هذا الداعم — لا نسبة له من المبلغ (كله للمنصة)، فقط إعلام بمن اشترك ليتواصل معه مباشرة. */
export function SupporterStudentsPage() {
  const t = useT();
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useMySupporterPurchases();
  const purchases = data?.data ?? [];

  if (!user) return <Navigate to="/login" replace />;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-right text-xl font-bold text-ink">{t('academicSupporter.students.title')}</h1>

        {isError ? (
          <ErrorState onRetry={refetch} />
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-2xl" />
            ))}
          </div>
        ) : purchases.length === 0 ? (
          <EmptyState title={t('academicSupporter.students.empty')} />
        ) : (
          <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="px-4 py-4 text-right font-bold text-ink">{t('academicSupporter.students.colStudent')}</th>
                  <th className="px-4 py-4 text-right font-bold text-ink">{t('academicSupporter.students.colPackage')}</th>
                  <th className="px-4 py-4 text-right font-bold text-ink">{t('academicSupporter.students.colAmount')}</th>
                  <th className="px-4 py-4 text-right font-bold text-ink">{t('academicSupporter.students.colStatus')}</th>
                  <th className="px-4 py-4 text-right font-bold text-ink">{t('academicSupporter.students.colDate')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {purchases.map((purchase, i) => {
                  const style = STATUS_STYLES[purchase.status] ?? STATUS_STYLES.expired;
                  return (
                    <tr key={purchase.id} className={i % 2 === 1 ? 'bg-[#FAFBFD]' : ''}>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Avatar name={purchase.student?.user?.name} src={purchase.student?.user?.avatar_path} size="sm" className="!h-9 !w-9" />
                          <span className="font-semibold text-ink">{purchase.student?.user?.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right text-ink-soft">
                        {t(`dashboard.teacherSupportPackages.tier${purchase.supportPackage?.tier === 'premium' ? 'Premium' : 'Basic'}`)}
                        {' — '}
                        {purchase.supportPackage?.subject?.name_ar}
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-price">{formatPrice(purchase.amount, purchase.currency)}</td>
                      <td className="px-4 py-4 text-right">
                        <span className="rounded-pill px-3 py-1 text-xs font-bold" style={{ background: style.bg, color: style.color }}>
                          {t(`academicSupporter.students.status.${purchase.status}`)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right text-ink-soft">{formatDate(purchase.confirmed_at ?? purchase.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
