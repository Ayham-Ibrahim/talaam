import { Trash2 } from 'lucide-react';
import { ErrorState, Skeleton } from '@/components/ui';
import { useDeleteAdjustment, useEmployee } from '@/hooks/useEmployees';
import { formatDate, formatPrice } from '@/lib/formatters';
import { useT } from '@/hooks/useT';
import { ModalShell, SalaryStatusBadge } from './PayrollUi';

/** ملف الموظف: بياناته + سجل كشوف رواتبه + بونصاته/خصوماته (الحذف فقط لشهر غير مدفوع) */
export function EmployeeDetailsModal({ employeeId, onClose }) {
  const t = useT();
  const { data: employee, isLoading, isError, refetch } = useEmployee(employeeId);
  const deleteAdjustment = useDeleteAdjustment();

  const paidMonths = new Set((employee?.salaries ?? []).filter((s) => s.status === 'paid').map((s) => s.month));

  const handleDeleteAdjustment = (adj) => {
    if (!window.confirm(t('dashboard.employees.confirmDeleteAdjustment'))) return;
    deleteAdjustment.mutate(adj.id, { onError: (err) => window.alert(err?.message) });
  };

  return (
    <ModalShell
      title={employee?.name ?? t('dashboard.employees.detailsTitle')}
      closeLabel={t('dashboard.employees.cancel')}
      onClose={onClose}
      size="max-w-3xl"
    >
      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading || !employee ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-6 text-right">
          <div className="grid grid-cols-2 gap-3 rounded-xl bg-[#F5F7FA] p-4 text-sm sm:grid-cols-3">
            <Info label={t('dashboard.employees.jobTitleLabel')} value={employee.jobTitle} />
            <Info label={t('dashboard.employees.baseSalaryLabel')} value={formatPrice(employee.baseSalary, employee.currency)} />
            <Info label={t('dashboard.employees.hiredAtLabel')} value={employee.hiredAt ? formatDate(employee.hiredAt) : null} />
            <Info label={t('dashboard.employees.phoneLabel')} value={employee.phone} />
            <Info label={t('dashboard.employees.emailLabel')} value={employee.email} />
            <Info
              label={t('dashboard.employees.statusLabel')}
              value={t(employee.isActive ? 'dashboard.employees.active' : 'dashboard.employees.inactive')}
            />
          </div>

          <section>
            <h4 className="mb-2 font-bold text-ink">{t('dashboard.employees.salaryHistory')}</h4>
            {employee.salaries.length === 0 ? (
              <p className="text-sm text-ink-soft">{t('dashboard.employees.noSalaries')}</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-line">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-line text-right">
                      {['month', 'base', 'bonuses', 'deductions', 'net', 'status'].map((col) => (
                        <th key={col} className="px-3 py-2 font-bold text-ink">
                          {t(`dashboard.payroll.cols.${col}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {employee.salaries.map((s) => (
                      <tr key={s.id}>
                        <td className="px-3 py-2 text-ink">{s.month}</td>
                        <td className="px-3 py-2 text-ink-soft">{formatPrice(s.baseSalary, s.currency)}</td>
                        <td className="px-3 py-2 text-success">{formatPrice(s.bonusesTotal, s.currency)}</td>
                        <td className="px-3 py-2 text-accent-pink">{formatPrice(s.deductionsTotal, s.currency)}</td>
                        <td className="px-3 py-2 font-semibold text-ink">{formatPrice(s.netAmount, s.currency)}</td>
                        <td className="px-3 py-2">
                          <SalaryStatusBadge status={s.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section>
            <h4 className="mb-2 font-bold text-ink">{t('dashboard.employees.adjustmentsHistory')}</h4>
            {employee.adjustments.length === 0 ? (
              <p className="text-sm text-ink-soft">{t('dashboard.employees.noAdjustments')}</p>
            ) : (
              <ul className="divide-y divide-line rounded-xl border border-line">
                {employee.adjustments.map((adj) => (
                  <li key={adj.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                    <div>
                      <span className={`font-semibold ${adj.type === 'bonus' ? 'text-success' : 'text-accent-pink'}`}>
                        {adj.type === 'bonus' ? '+' : '−'}
                        {formatPrice(adj.amount, employee.currency)}
                      </span>
                      <span className="mx-2 text-ink-soft">
                        {t(`dashboard.employees.types.${adj.type}`)} · {adj.month}
                      </span>
                      {adj.reason && <span className="text-ink">{adj.reason}</span>}
                    </div>
                    {!paidMonths.has(adj.month) && (
                      <button
                        type="button"
                        disabled={deleteAdjustment.isPending}
                        onClick={() => handleDeleteAdjustment(adj)}
                        aria-label={t('dashboard.employees.delete')}
                        title={t('dashboard.employees.delete')}
                        className="text-ink-soft hover:text-accent-pink disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </ModalShell>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div className="text-xs text-ink-soft">{label}</div>
      <div className="font-semibold text-ink">{value || '—'}</div>
    </div>
  );
}
