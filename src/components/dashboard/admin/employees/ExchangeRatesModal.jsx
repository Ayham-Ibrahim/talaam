import { useState } from 'react';
import { ApiErrorList } from '@/components/ui';
import { useGeneratePayroll, useUpdatePayrollRates } from '@/hooks/useEmployees';
import { useT } from '@/hooks/useT';
import { Field, INPUT_CLASS, inputToRate, ModalActions, ModalShell, RATE_INPUTS, rateToInput } from './PayrollUi';

/**
 * أسعار صرف شهر مقابل الدرهم. mode='generate': يولّد كشوف الشهر بهذه الأسعار، mode='edit': يحفظها
 * فقط (الباك يعيد حساب الكشوف غير المدفوعة). الخانات تُعبأ بسعر الشهر أو آخر سعر محفوظ كاقتراح.
 * locked: دُفع كشف في الشهر فأسعاره المحفوظة مقفلة — تُعرض معطّلة ولا تُرسل (عملة بلا سعر تبقى قابلة للإدخال).
 */
export function ExchangeRatesModal({ month, mode, initialRates, locked = false, onClose, onDone }) {
  const t = useT();
  const generate = useGeneratePayroll();
  const updateRates = useUpdatePayrollRates();
  const mutation = mode === 'generate' ? generate : updateRates;

  const [values, setValues] = useState(() =>
    Object.fromEntries(
      RATE_INPUTS.map(({ currency, inverse }) => [currency, rateToInput(initialRates?.[currency]?.rate, inverse)]),
    ),
  );

  const isLocked = (currency) => locked && initialRates?.[currency]?.saved;

  const rates = Object.fromEntries(
    RATE_INPUTS.filter(({ currency }) => !isLocked(currency))
      .map(({ currency, inverse }) => [currency, inputToRate(values[currency], inverse)])
      .filter(([, r]) => r),
  );
  // الحفظ يحتاج سعراً واحداً على الأقل؛ التوليد مسموح بلا أسعار (للموظفين بالدرهم فقط) والباك يرفض العملة الناقصة
  const canSubmit = mode === 'generate' || Object.keys(rates).length > 0;

  return (
    <ModalShell
      title={t(mode === 'generate' ? 'dashboard.payroll.generateTitle' : 'dashboard.payroll.ratesTitle').replace('{month}', month)}
      closeLabel={t('dashboard.employees.cancel')}
      onClose={onClose}
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit) mutation.mutate({ month, rates }, { onSuccess: onDone });
        }}
      >
        {mutation.isError && (
          <ApiErrorList
            error={mutation.error}
            labelFor={(path) => {
              const currency = path.replace('rates.', '');
              return RATE_INPUTS.some((r) => r.currency === currency) ? t(`dashboard.payroll.rateLabels.${currency}`) : null;
            }}
          />
        )}

        <p className="text-right text-sm text-ink-soft">{t('dashboard.payroll.ratesHint')}</p>
        {locked && <p className="rounded-btn bg-[#FEF3E2] px-3 py-2 text-right text-sm text-[#B7791F]">{t('dashboard.payroll.ratesLocked')}</p>}

        {RATE_INPUTS.map(({ currency }) => (
          <Field key={currency} label={t(`dashboard.payroll.rateLabels.${currency}`)}>
            <div className="flex items-center gap-2" dir="ltr">
              <input
                type="number"
                min="0"
                step="any"
                value={values[currency]}
                disabled={isLocked(currency)}
                onChange={(e) => setValues((prev) => ({ ...prev, [currency]: e.target.value }))}
                className={`${INPUT_CLASS} disabled:bg-line/30 disabled:text-ink-soft`}
              />
              <span className="w-12 shrink-0 text-sm font-semibold text-ink-soft">
                {t(`dashboard.payroll.rateSuffix.${currency}`)}
              </span>
            </div>
            {initialRates?.[currency]?.rate && !initialRates[currency].saved && (
              <span className="text-xs text-ink-soft">{t('dashboard.payroll.ratesSuggested')}</span>
            )}
          </Field>
        ))}

        <ModalActions
          onCancel={onClose}
          cancelLabel={t('dashboard.employees.cancel')}
          submitLabel={
            mutation.isPending
              ? t(mode === 'generate' ? 'dashboard.payroll.generating' : 'dashboard.employees.saving')
              : t(mode === 'generate' ? 'dashboard.payroll.generate' : 'dashboard.payroll.saveRates')
          }
          disabled={!canSubmit || mutation.isPending}
        />
      </form>
    </ModalShell>
  );
}
