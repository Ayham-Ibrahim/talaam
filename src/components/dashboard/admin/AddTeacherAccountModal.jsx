import { useState } from 'react';
import { X } from 'lucide-react';
import { SmoothSelect } from '@/components/dashboard/SmoothSelect';
import { TEACHER_TYPE_LABELS } from '@/services/teacherService';
import { useCreateTeacherAccount } from '@/hooks/useAdmin';
import { useT } from '@/hooks/useT';

const TEACHER_TYPE_OPTIONS = Object.entries(TEACHER_TYPE_LABELS).map(([value, label]) => ({ value, label }));

const INITIAL = { name: '', email: '', phone: '', teacher_type: '', password: '' };

export function AddTeacherAccountModal({ onClose }) {
  const t = useT();
  const [form, setForm] = useState(INITIAL);
  const [touched, setTouched] = useState(false);
  const createAccount = useCreateTeacherAccount();

  const patch = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const isValid =
    form.name.trim() !== '' && form.email.trim() !== '' && form.teacher_type !== '' && form.password.length >= 8;

  const handleSubmit = () => {
    setTouched(true);
    if (!isValid) return;
    createAccount.mutate(
      { ...form, phone: form.phone || null },
      { onSuccess: () => onClose?.() },
    );
  };

  const errorMessage = createAccount.error?.errors
    ? Object.values(createAccount.error.errors).flat()[0]
    : createAccount.error?.message;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            aria-label={t('dashboard.adminTeachers.close')}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-line/40 hover:text-ink"
          >
            <X size={18} />
          </button>
          <h3 className="flex-1 text-center text-lg font-bold text-ink">{t('dashboard.adminTeachers.addModalTitle')}</h3>
          <span className="w-8" />
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-btn bg-accent-pink/10 px-4 py-3 text-sm text-accent-pink">{errorMessage}</div>
        )}

        <div className="flex flex-col gap-3 text-right">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">{t('dashboard.adminTeachers.nameLabel')}</span>
            <input
              type="text"
              value={form.name}
              onChange={patch('name')}
              className={`w-full rounded-btn border bg-surface p-3 text-sm text-ink focus:outline-none focus:ring-2 ${
                touched && form.name.trim() === '' ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
              }`}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">{t('dashboard.adminTeachers.emailLabel')}</span>
            <input
              type="email"
              dir="ltr"
              value={form.email}
              onChange={patch('email')}
              className={`w-full rounded-btn border bg-surface p-3 text-sm text-ink focus:outline-none focus:ring-2 ${
                touched && form.email.trim() === '' ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
              }`}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">{t('dashboard.adminTeachers.phoneLabel')}</span>
            <input
              type="tel"
              dir="ltr"
              value={form.phone}
              onChange={patch('phone')}
              className="w-full rounded-btn border border-line bg-surface p-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">{t('dashboard.adminTeachers.typeLabel')}</span>
            <SmoothSelect
              value={form.teacher_type}
              onChange={(v) => setForm((prev) => ({ ...prev, teacher_type: v }))}
              options={TEACHER_TYPE_OPTIONS}
              placeholder="—"
            />
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">{t('dashboard.adminTeachers.passwordLabel')}</span>
            <input
              type="text"
              dir="ltr"
              value={form.password}
              onChange={patch('password')}
              className={`w-full rounded-btn border bg-surface p-3 text-sm text-ink focus:outline-none focus:ring-2 ${
                touched && form.password.length < 8 ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
              }`}
            />
            <span className="text-xs text-ink-soft">{t('dashboard.adminTeachers.passwordHint')}</span>
          </label>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-line py-3 text-sm font-medium text-ink-soft hover:bg-line/30"
          >
            {t('dashboard.adminTeachers.close')}
          </button>
          <button
            type="button"
            disabled={createAccount.isPending}
            onClick={handleSubmit}
            className="flex-1 rounded-xl bg-primary py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {t('dashboard.adminTeachers.addSubmit')}
          </button>
        </div>
      </div>
    </div>
  );
}
