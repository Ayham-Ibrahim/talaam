import { useState } from 'react';
import { ApiErrorList } from '@/components/ui';
import { useSaveEmployee } from '@/hooks/useEmployees';
import { useT } from '@/hooks/useT';
import { Field, INPUT_CLASS, ModalActions, ModalShell } from './PayrollUi';

const FIELD_LABELS = {
  name: 'nameLabel',
  job_title: 'jobTitleLabel',
  phone: 'phoneLabel',
  email: 'emailLabel',
  base_salary: 'baseSalaryLabel',
  hired_at: 'hiredAtLabel',
  notes: 'notesLabel',
};

/** إضافة موظف (employee=null) أو تعديله — تعديل الراتب الأساسي ينعكس على كشوفه غير المدفوعة فقط */
export function EmployeeFormModal({ employee, onClose }) {
  const t = useT();
  const save = useSaveEmployee();
  const [form, setForm] = useState({
    name: employee?.name ?? '',
    jobTitle: employee?.jobTitle ?? '',
    phone: employee?.phone ?? '',
    email: employee?.email ?? '',
    baseSalary: employee?.baseSalary ?? '',
    hiredAt: employee?.hiredAt ?? '',
    isActive: employee?.isActive ?? true,
    notes: employee?.notes ?? '',
  });

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  const canSubmit = form.name.trim() && form.baseSalary !== '' && Number(form.baseSalary) >= 0;

  return (
    <ModalShell
      title={t(employee ? 'dashboard.employees.editTitle' : 'dashboard.employees.addTitle')}
      closeLabel={t('dashboard.employees.cancel')}
      onClose={onClose}
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit) save.mutate({ id: employee?.id, form }, { onSuccess: onClose });
        }}
      >
        {save.isError && (
          <ApiErrorList
            error={save.error}
            labelFor={(path) => (FIELD_LABELS[path] ? t(`dashboard.employees.${FIELD_LABELS[path]}`) : null)}
          />
        )}

        <Field label={t('dashboard.employees.nameLabel')}>
          <input value={form.name} onChange={set('name')} className={INPUT_CLASS} />
        </Field>
        <Field label={t('dashboard.employees.jobTitleLabel')}>
          <input value={form.jobTitle} onChange={set('jobTitle')} className={INPUT_CLASS} />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t('dashboard.employees.baseSalaryLabel')}>
            <input type="number" min="0" step="0.01" dir="ltr" value={form.baseSalary} onChange={set('baseSalary')} className={INPUT_CLASS} />
          </Field>
          <Field label={t('dashboard.employees.hiredAtLabel')}>
            <input type="date" value={form.hiredAt} onChange={set('hiredAt')} className={INPUT_CLASS} />
          </Field>
          <Field label={t('dashboard.employees.phoneLabel')}>
            <input type="tel" dir="ltr" value={form.phone} onChange={set('phone')} className={INPUT_CLASS} />
          </Field>
          <Field label={t('dashboard.employees.emailLabel')}>
            <input type="email" dir="ltr" value={form.email} onChange={set('email')} className={INPUT_CLASS} />
          </Field>
        </div>
        <Field label={t('dashboard.employees.notesLabel')}>
          <textarea rows={2} value={form.notes} onChange={set('notes')} className={INPUT_CLASS} />
        </Field>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
            className="h-4 w-4 accent-primary"
          />
          {t('dashboard.employees.isActiveLabel')}
        </label>

        <ModalActions
          onCancel={onClose}
          cancelLabel={t('dashboard.employees.cancel')}
          submitLabel={save.isPending ? t('dashboard.employees.saving') : t('dashboard.employees.save')}
          disabled={!canSubmit || save.isPending}
        />
      </form>
    </ModalShell>
  );
}
