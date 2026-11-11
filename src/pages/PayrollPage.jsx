import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { CheckCircle2, Download, Gift, Lock, Pencil, Plus, Wallet } from 'lucide-react';
import { AdminDashboardLayout } from '@/components/dashboard/admin/AdminDashboardLayout';
import { SmoothSelect } from '@/components/dashboard/SmoothSelect';
import { AdjustmentModal } from '@/components/dashboard/admin/employees/AdjustmentModal';
import { ExchangeRatesModal } from '@/components/dashboard/admin/employees/ExchangeRatesModal';
import {
  BASE_CURRENCY,
  currentMonth,
  formatRate,
  Field,
  INPUT_CLASS,
  ModalActions,
  ModalShell,
  MoneyWithAed,
  RATE_INPUTS,
  SalaryStatusBadge,
  StatCard,
} from '@/components/dashboard/admin/employees/PayrollUi';
import { ApiErrorList, EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useExportPayroll, useMarkSalaryPaid, usePayroll, usePayrollRates } from '@/hooks/useEmployees';
import { PAYOUT_STATUS_STYLES } from '@/mocks/adminPayouts.mock';
import { formatPrice } from '@/lib/formatters';
import { saveBlob } from '@/lib/download';
import { useT } from '@/hooks/useT';

/**
 * كشف رواتب شهر: توليد الكشوف لكل الموظفين النشطين (آمن التكرار)، بونص/خصم من الصف، وتسجيل الدفع.
 * كشف غير مدفوع يُعاد حسابه بالباك عند كل بونص/خصم؛ المدفوع مقفل. التوليد يمر بنافذة أسعار صرف
 * الشهر، وكل كشف بعملة أجنبية يظهر مع مقابله بالدرهم؛ المجاميع كلها بالدرهم.
 */
export function PayrollPage({ variant = 'admin' }) {
  const t = useT();
  const { user } = useAuth();
  const [month, setMonth] = useState(currentMonth());
  const [status, setStatus] = useState('');
  const [adjustmentSalary, setAdjustmentSalary] = useState(null);
  const [paySalary, setPaySalary] = useState(null);
  const [payNotes, setPayNotes] = useState('');
  const [notice, setNotice] = useState('');
  // null | 'generate' | 'edit' — نفس نافذة الأسعار للتوليد ولتعديل أسعار شهر مولَّد
  const [ratesMode, setRatesMode] = useState(null);

  const { data, isLoading, isError, refetch } = usePayroll({ month, status });
  const { data: ratesData } = usePayrollRates(month);
  const markPaid = useMarkSalaryPaid();
  const exportPayroll = useExportPayroll();

  if (!user) return <Navigate to="/login" replace />;

  // لا كشف لشهر لم يبدأ (GeneratePayrollRequest بالباك) — مقارنة نصية صحيحة بصيغة YYYY-MM
  const isFutureMonth = month > currentMonth();
  const salaries = data?.data ?? [];
  const summary = data?.summary ?? {};

  const savedRates = RATE_INPUTS.filter(({ currency }) => ratesData?.rates?.[currency]?.saved);

  const handleRatesDone = (res) => {
    setRatesMode(null);
    if (res && 'created' in res) {
      setNotice(
        res.created > 0
          ? t('dashboard.payroll.generated').replace('{count}', res.created)
          : t('dashboard.payroll.alreadyGenerated'),
      );
    } else {
      setNotice(t('dashboard.payroll.ratesSaved'));
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportPayroll.mutateAsync({ month, status: status || undefined });
      saveBlob(blob, `payroll-${month || 'all'}.xlsx`);
    } catch (err) {
      window.alert(err?.message || t('dashboard.payroll.exportFailed'));
    }
  };

  const closePay = () => {
    setPaySalary(null);
    setPayNotes('');
    markPaid.reset();
  };

  return (
    <AdminDashboardLayout variant={variant}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-right">
            <h1 className="text-xl font-bold text-ink">{t('dashboard.payroll.title')}</h1>
            <p className="mt-1 text-sm text-ink-soft">{t('dashboard.payroll.subtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={exportPayroll.isPending}
              onClick={handleExport}
              className="flex items-center gap-1.5 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink hover:bg-line/30 disabled:opacity-50"
            >
              <Download size={16} />
              {exportPayroll.isPending ? t('dashboard.payroll.exporting') : t('dashboard.payroll.exportExcel')}
            </button>
            <button
              type="button"
              disabled={!month || isFutureMonth}
              title={isFutureMonth ? t('dashboard.payroll.futureMonth') : undefined}
              onClick={() => {
                setNotice('');
                setRatesMode('generate');
              }}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
            >
              <Plus size={16} />
              {t('dashboard.payroll.generate')}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-btn border border-line bg-white px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
            <span className="text-sm text-ink-soft">{t('dashboard.payroll.monthFilter')}</span>
            <input
              type="month"
              value={month}
              onChange={(e) => {
                setMonth(e.target.value);
                setNotice('');
              }}
              max={currentMonth()}
              aria-label={t('dashboard.payroll.monthFilter')}
              className="bg-transparent py-2.5 text-sm text-ink focus:outline-none"
            />
          </div>
          <SmoothSelect
            className="w-full max-w-xs"
            value={status}
            onChange={setStatus}
            placeholder={t('dashboard.payroll.allStatuses')}
            options={Object.entries(PAYOUT_STATUS_STYLES).map(([value, style]) => ({ value, label: style.label }))}
          />
          {month && (
            <div className="flex flex-wrap items-center gap-2 rounded-btn border border-line bg-white px-3 py-2.5 text-sm">
              <span className="text-ink-soft">{t('dashboard.payroll.monthRates')}:</span>
              {savedRates.length === 0 ? (
                <span className="text-ink-soft">{t('dashboard.payroll.noRates')}</span>
              ) : (
                savedRates.map(({ currency }) => (
                  <span key={currency} dir="ltr" className="font-semibold text-ink">
                    {formatRate(currency, ratesData.rates[currency].rate)}
                  </span>
                ))
              )}
              {ratesData?.locked ? (
                <span className="flex items-center gap-1 text-ink-soft" title={t('dashboard.payroll.ratesLocked')}>
                  <Lock size={14} />
                  {t('dashboard.payroll.ratesLockedShort')}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setNotice('');
                    setRatesMode('edit');
                  }}
                  className="flex items-center gap-1 font-medium text-primary hover:opacity-70"
                >
                  <Pencil size={14} />
                  {t('dashboard.payroll.editRates')}
                </button>
              )}
            </div>
          )}
        </div>

        {notice && <div className="rounded-btn bg-success-light px-4 py-3 text-sm text-success">{notice}</div>}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Wallet} label={t('dashboard.payroll.netTotal')} value={formatPrice(summary.netTotal ?? 0, BASE_CURRENCY)} />
          <StatCard
            icon={Gift}
            label={t('dashboard.payroll.bonusesTotal')}
            value={formatPrice(summary.bonusesTotal ?? 0, BASE_CURRENCY)}
            bg="#F0FAFD"
            color="#2F80ED"
          />
          <StatCard
            icon={CheckCircle2}
            label={t('dashboard.payroll.paidTotal')}
            value={formatPrice(summary.paidTotal ?? 0, BASE_CURRENCY)}
            bg="#E3F5EC"
            color="#2E9E6B"
          />
          <StatCard
            icon={Wallet}
            label={t('dashboard.payroll.outstandingTotal')}
            value={formatPrice(summary.outstandingTotal ?? 0, BASE_CURRENCY)}
            bg="#FEF3E2"
            color="#B7791F"
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
        ) : salaries.length === 0 ? (
          <EmptyState title={t('dashboard.payroll.empty')} hint={t('dashboard.payroll.emptyHint')} />
        ) : (
          <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-line text-right">
                  {['employee', 'month', 'base', 'bonuses', 'deductions', 'net', 'netAed', 'status', 'actions'].map((col) => (
                    <th key={col} className="px-4 py-4 font-bold text-ink">
                      {t(`dashboard.payroll.cols.${col}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {salaries.map((s, i) => (
                  <tr key={s.id} className={i % 2 === 1 ? 'bg-[#FAFBFD]' : ''}>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-ink">{s.employeeName}</div>
                      <div className="text-xs text-ink-soft">{s.jobTitle}</div>
                    </td>
                    <td className="px-4 py-4 text-ink-soft">{s.month}</td>
                    <td className="px-4 py-4 text-ink-soft">
                      <MoneyWithAed amount={s.baseSalary} currency={s.currency} aed={s.baseSalaryAed} />
                    </td>
                    <td className="px-4 py-4 text-success">
                      <MoneyWithAed amount={s.bonusesTotal} currency={s.currency} aed={s.bonusesTotalAed} />
                    </td>
                    <td className="px-4 py-4 text-accent-pink">
                      <MoneyWithAed amount={s.deductionsTotal} currency={s.currency} aed={s.deductionsTotalAed} />
                    </td>
                    <td className="px-4 py-4 font-semibold text-price">{formatPrice(s.netAmount, s.currency)}</td>
                    <td className="px-4 py-4 font-semibold text-ink">{formatPrice(s.netAmountAed, BASE_CURRENCY)}</td>
                    <td className="px-4 py-4">
                      <SalaryStatusBadge status={s.status} />
                    </td>
                    <td className="px-4 py-4">
                      {s.status === 'pending' && (
                        <div className="flex items-center justify-start gap-3">
                          <button
                            type="button"
                            onClick={() => setAdjustmentSalary(s)}
                            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-70"
                          >
                            {t('dashboard.payroll.addAdjustment')}
                            <Gift size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaySalary(s)}
                            className="flex items-center gap-1.5 text-sm font-medium text-success hover:opacity-70"
                          >
                            {t('dashboard.payroll.markPaid')}
                            <Wallet size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {adjustmentSalary && (
        <AdjustmentModal
          employee={{ id: adjustmentSalary.employeeId, name: adjustmentSalary.employeeName }}
          defaultMonth={adjustmentSalary.month}
          onClose={() => setAdjustmentSalary(null)}
        />
      )}

      {ratesMode && (
        <ExchangeRatesModal
          month={month}
          mode={ratesMode}
          initialRates={ratesData?.rates}
          locked={ratesData?.locked}
          onClose={() => setRatesMode(null)}
          onDone={handleRatesDone}
        />
      )}

      {paySalary && (
        <ModalShell title={t('dashboard.payroll.markPaidTitle')} closeLabel={t('dashboard.employees.cancel')} onClose={closePay}>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              markPaid.mutate({ id: paySalary.id, notes: payNotes }, { onSuccess: closePay });
            }}
          >
            {markPaid.isError && <ApiErrorList error={markPaid.error} labelFor={() => null} />}
            <p className="text-center text-sm text-ink-soft">
              {t('dashboard.payroll.markPaidConfirm')
                .replace('{name}', paySalary.employeeName)
                .replace(
                  '{amount}',
                  paySalary.currency === BASE_CURRENCY
                    ? formatPrice(paySalary.netAmount, paySalary.currency)
                    : `${formatPrice(paySalary.netAmount, paySalary.currency)} (≈ ${formatPrice(paySalary.netAmountAed, BASE_CURRENCY)})`,
                )
                .replace('{month}', paySalary.month)}
            </p>
            <Field label={t('dashboard.payroll.notesLabel')}>
              <input value={payNotes} onChange={(e) => setPayNotes(e.target.value)} className={INPUT_CLASS} />
            </Field>
            <ModalActions
              onCancel={closePay}
              cancelLabel={t('dashboard.employees.cancel')}
              submitLabel={t('dashboard.payroll.confirm')}
              disabled={markPaid.isPending}
            />
          </form>
        </ModalShell>
      )}
    </AdminDashboardLayout>
  );
}
