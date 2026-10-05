import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AdminDashboardLayout } from '@/components/dashboard/admin/AdminDashboardLayout';
import { SmoothSelect } from '@/components/dashboard/SmoothSelect';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { financeService } from '@/services/financeService';
import { useAuth } from '@/hooks/useAuth';
import { useT } from '@/hooks/useT';
import { formatDate } from '@/lib/formatters';

const STATUS_OPTIONS = ['pending_payment', 'confirmed', 'active', 'completed', 'cancelled', 'expired'];

/** قائمة الحجوزات المالية (المبالغ المدفوعة، صافي المعلم، حصة المنصة) — للأدمن والمحاسب بنفس العرض */
export function FinanceBookingsPage({ variant = 'admin' }) {
  const t = useT();
  const { user } = useAuth();
  const [status, setStatus] = useState('');
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['finance', 'bookings', status],
    queryFn: () => financeService.getBookings({ status }),
  });

  if (!user) return <Navigate to="/login" replace />;

  const bookings = data?.data ?? [];

  return (
    <AdminDashboardLayout variant={variant}>
      <div className="flex flex-col gap-6">
        <div className="text-right">
          <h1 className="text-xl font-bold text-ink">{t('dashboard.financeBookings.title')}</h1>
          <p className="mt-1 text-sm text-ink-soft">{t('dashboard.financeBookings.subtitle')}</p>
        </div>

        <SmoothSelect
          className="max-w-xs"
          value={status}
          onChange={setStatus}
          placeholder={t('dashboard.financeBookings.allStatuses')}
          options={STATUS_OPTIONS.map((value) => ({ value, label: t(`dashboard.financeBookings.statuses.${value}`) }))}
        />

        {isError ? (
          <ErrorState onRetry={refetch} />
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-2xl" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState title={t('dashboard.financeBookings.empty')} />
        ) : (
          <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-line text-right">
                  {['reference', 'student', 'teacher', 'package', 'paid', 'teacherNet', 'platform', 'status', 'created'].map((col) => (
                    <th key={col} className="px-4 py-3 font-bold text-ink">
                      {t(`dashboard.financeBookings.cols.${col}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {bookings.map((b) => (
                  <tr key={b.id} className="text-right">
                    <td className="px-4 py-3 font-mono text-xs text-ink-soft" dir="ltr">{b.reference}</td>
                    <td className="px-4 py-3">{b.student?.user?.name ?? '—'}</td>
                    <td className="px-4 py-3">{b.teacher?.user?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-soft">{b.package?.title ?? '—'}</td>
                    <td className="px-4 py-3 font-semibold text-price">{Number(b.amount_paid ?? 0).toLocaleString('en-US')}</td>
                    <td className="px-4 py-3 text-ink">{Number(b.teacher_amount ?? 0).toLocaleString('en-US')}</td>
                    <td className="px-4 py-3 text-success">{Number(b.platform_amount ?? 0).toLocaleString('en-US')}</td>
                    <td className="px-4 py-3 text-ink-soft">{t(`dashboard.financeBookings.statuses.${b.status}`)}</td>
                    <td className="px-4 py-3 text-ink-soft">{formatDate(b.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
}
