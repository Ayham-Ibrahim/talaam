import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Eye, Gift, Pencil, Plus, Search, Trash2, Users, Wallet } from 'lucide-react';
import { AdminDashboardLayout } from '@/components/dashboard/admin/AdminDashboardLayout';
import { SmoothSelect } from '@/components/dashboard/SmoothSelect';
import { EmployeeFormModal } from '@/components/dashboard/admin/employees/EmployeeFormModal';
import { AdjustmentModal } from '@/components/dashboard/admin/employees/AdjustmentModal';
import { EmployeeDetailsModal } from '@/components/dashboard/admin/employees/EmployeeDetailsModal';
import { StatCard } from '@/components/dashboard/admin/employees/PayrollUi';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useDeleteEmployee, useEmployees } from '@/hooks/useEmployees';
import { formatDate, formatNumber, formatPrice } from '@/lib/formatters';
import { useT } from '@/hooks/useT';

/** قائمة الموظفين الإداريين (بلا حساب دخول) برواتبهم — للأدمن والمحاسب (variant) */
export function EmployeesPage({ variant = 'admin' }) {
  const t = useT();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState('');
  // null: مغلق، {}: إضافة، employee: تعديل
  const [formEmployee, setFormEmployee] = useState(null);
  const [adjustmentEmployee, setAdjustmentEmployee] = useState(null);
  const [detailsId, setDetailsId] = useState(null);

  const { data, isLoading, isError, refetch } = useEmployees({ search: search.trim(), isActive });
  const deleteEmployee = useDeleteEmployee();

  if (!user) return <Navigate to="/login" replace />;

  const employees = data?.data ?? [];
  const summary = data?.summary ?? { activeEmployees: 0, monthlyBasePayroll: 0 };

  const handleDelete = (employee) => {
    if (!window.confirm(t('dashboard.employees.confirmDelete'))) return;
    deleteEmployee.mutate(employee.id, { onError: (err) => window.alert(err?.message) });
  };

  return (
    <AdminDashboardLayout variant={variant}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-right">
            <h1 className="text-xl font-bold text-ink">{t('dashboard.employees.title')}</h1>
            <p className="mt-1 text-sm text-ink-soft">{t('dashboard.employees.subtitle')}</p>
          </div>
          <button
            type="button"
            onClick={() => setFormEmployee({})}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
          >
            <Plus size={16} />
            {t('dashboard.employees.add')}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <StatCard icon={Users} label={t('dashboard.employees.activeCount')} value={formatNumber(summary.activeEmployees)} />
          <StatCard
            icon={Wallet}
            label={t('dashboard.employees.monthlyBasePayroll')}
            value={formatPrice(summary.monthlyBasePayroll)}
            bg="#E3F5EC"
            color="#2E9E6B"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex w-full max-w-xs items-center gap-2 rounded-btn border border-line bg-white px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
            <Search size={16} className="text-ink-soft" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('dashboard.employees.searchPlaceholder')}
              className="w-full bg-transparent py-2.5 text-sm text-ink focus:outline-none"
            />
          </div>
          <SmoothSelect
            className="w-full max-w-xs"
            value={isActive}
            onChange={setIsActive}
            placeholder={t('dashboard.employees.allStatuses')}
            options={[
              { value: '1', label: t('dashboard.employees.active') },
              { value: '0', label: t('dashboard.employees.inactive') },
            ]}
          />
        </div>

        {isError ? (
          <ErrorState onRetry={refetch} />
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-2xl" />
            ))}
          </div>
        ) : employees.length === 0 ? (
          <EmptyState title={t('dashboard.employees.empty')} />
        ) : (
          <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-line text-right">
                  {['name', 'jobTitle', 'baseSalary', 'hiredAt', 'status', 'actions'].map((col) => (
                    <th key={col} className="px-4 py-4 font-bold text-ink">
                      {t(`dashboard.employees.cols.${col}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {employees.map((e, i) => (
                  <tr key={e.id} className={i % 2 === 1 ? 'bg-[#FAFBFD]' : ''}>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-ink">{e.name}</div>
                      {e.phone && <div className="text-right text-xs text-ink-soft" dir="ltr">{e.phone}</div>}
                    </td>
                    <td className="px-4 py-4 text-ink-soft">{e.jobTitle || '—'}</td>
                    <td className="px-4 py-4 font-semibold text-price">{formatPrice(e.baseSalary, e.currency)}</td>
                    <td className="px-4 py-4 text-ink-soft">{e.hiredAt ? formatDate(e.hiredAt) : '—'}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-pill px-3 py-1 text-xs font-bold ${
                          e.isActive ? 'bg-success-light text-success' : 'bg-line/50 text-ink-soft'
                        }`}
                      >
                        {t(e.isActive ? 'dashboard.employees.active' : 'dashboard.employees.inactive')}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-start gap-3">
                        <button
                          type="button"
                          onClick={() => setAdjustmentEmployee(e)}
                          className="flex items-center gap-1.5 text-sm font-medium text-success hover:opacity-70"
                        >
                          {t('dashboard.employees.addBonus')}
                          <Gift size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDetailsId(e.id)}
                          className="flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"
                        >
                          {t('dashboard.employees.view')}
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormEmployee(e)}
                          aria-label={t('dashboard.employees.edit')}
                          title={t('dashboard.employees.edit')}
                          className="text-primary hover:opacity-70"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          disabled={deleteEmployee.isPending}
                          onClick={() => handleDelete(e)}
                          aria-label={t('dashboard.employees.delete')}
                          title={t('dashboard.employees.delete')}
                          className="text-ink-soft hover:text-accent-pink disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {formEmployee && (
        <EmployeeFormModal employee={formEmployee.id ? formEmployee : null} onClose={() => setFormEmployee(null)} />
      )}
      {adjustmentEmployee && (
        <AdjustmentModal employee={adjustmentEmployee} onClose={() => setAdjustmentEmployee(null)} />
      )}
      {detailsId != null && <EmployeeDetailsModal employeeId={detailsId} onClose={() => setDetailsId(null)} />}
    </AdminDashboardLayout>
  );
}
