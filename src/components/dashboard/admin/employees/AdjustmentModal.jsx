import { useState } from 'react';
import { ApiErrorList } from '@/components/ui';
import { useAddAdjustment } from '@/hooks/useEmployees';
import { useT } from '@/hooks/useT';
import { currentMonth, Field, INPUT_CLASS, ModalActions, ModalShell } from './PayrollUi';

const FIELD_LABELS = { month: 'monthLabel', amount: 'amountLabel', reason: 'reasonLabel', type: 'typeLabel' };

/** بونص (افتراضياً) أو خصم لموظف في شهر — الشهر المدفوع مقفل بالباك (422) */
export function AdjustmentModal({ employee, defaultMonth, onClose }) {
  const t = useT();
  const add = useAddAdjustment();
  const [form, setForm] = useState({ type: 'bonus', month: defaultMonth || currentMonth(), amount: '', reason: '' });

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  const canSubmit = form.month && Number(form.amount) > 0;

  return (
    <ModalShell
      title={`${t('dashboard.employees.adjustmentTitle')} — ${employee.name}`}
      closeLabel={t('dashboard.employees.cancel')}
      onClose={onClose}
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit) add.mutate({ employeeId: employee.id, ...form }, { onSuccess: onClose });
        }}
      >
        {add.isError && (
          <ApiErrorList
            error={add.error}
            labelFor={(path) => (FIELD_LABELS[path] ? t(`dashboard.employees.${FIELD_LABELS[path]}`) : null)}
          />
        )}

        <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#F5F7FA] p-1">
          {['bonus', 'deduction'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, type }))}
              className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
                form.type === type ? (type === 'bonus' ? 'bg-success text-white' : 'bg-accent-pink text-white') : 'text-ink-soft hover:text-ink'
              }`}
            >
              {t(`dashboard.employees.types.${type}`)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label={t('dashboard.employees.monthLabel')}>
            <input type="month" value={form.month} onChange={set('month')} className={INPUT_CLASS} />
          </Field>
          <Field label={t('dashboard.employees.amountLabel')}>
            <input type="number" min="0" step="0.01" dir="ltr" value={form.amount} onChange={set('amount')} className={INPUT_CLASS} />
          </Field>
        </div>
        <Field label={t('dashboard.employees.reasonLabel')}>
          <input value={form.reason} onChange={set('reason')} placeholder={t('dashboard.employees.reasonPlaceholder')} className={INPUT_CLASS} />
        </Field>

        <ModalActions
          onCancel={onClose}
          cancelLabel={t('dashboard.employees.cancel')}
          submitLabel={add.isPending ? t('dashboard.employees.saving') : t('dashboard.employees.save')}
          disabled={!canSubmit || add.isPending}
        />
      </form>
    </ModalShell>
  );
}
