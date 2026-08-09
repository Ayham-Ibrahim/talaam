import { useState } from 'react';
import { X } from 'lucide-react';
import { ApiErrorList } from '@/components/ui';
import { useCreateStudentAccount } from '@/hooks/useAdmin';
import { useT } from '@/hooks/useT';

const INITIAL = { name: '', email: '', phone: '', password: '' };

const ACCOUNT_FIELD_LABELS = { name: 'الاسم', email: 'البريد الإلكتروني', phone: 'الهاتف', password: 'كلمة المرور' };
const accountErrorLabel = (path) => ACCOUNT_FIELD_LABELS[path] ?? path;

export function AddStudentAccountModal({ onClose }) {
  const t = useT();
  const [form, setForm] = useState(INITIAL);
  const [touched, setTouched] = useState(false);
  const createAccount = useCreateStudentAccount();

  const patch = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const isValid = form.name.trim() !== '' && form.email.trim() !== '' && form.password.length >= 8;

  const handleSubmit = () => {
    setTouched(true);
    if (!isValid) return;
    createAccount.mutate(
      { ...form, phone: form.phone || null },
      { onSuccess: () => onClose?.() },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            aria-label={t('dashboard.adminStudentImport.close')}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-line/40 hover:text-ink"
          >
            <X size={18} />
          </button>
          <h3 className="flex-1 text-center text-lg font-bold text-ink">{t('dashboard.adminStudentImport.addModalTitle')}</h3>
          <span className="w-8" />
        </div>

        {createAccount.isError && <ApiErrorList error={createAccount.error} labelFor={accountErrorLabel} className="mb-4" />}

        <div className="flex flex-col gap-3 text-right">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">{t('dashboard.adminStudentImport.nameLabel')}</span>
            <input
              type="text"
              maxLength={150}
              value={form.name}
              onChange={patch('name')}
              className={`w-full rounded-btn border bg-surface p-3 text-sm text-ink focus:outline-none focus:ring-2 ${
                touched && form.name.trim() === '' ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
              }`}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">{t('dashboard.adminStudentImport.emailLabel')}</span>
            <input
              type="email"
              dir="ltr"
              maxLength={150}
              value={form.email}
              onChange={patch('email')}
              className={`w-full rounded-btn border bg-surface p-3 text-sm text-ink focus:outline-none focus:ring-2 ${
                touched && form.email.trim() === '' ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
              }`}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">{t('dashboard.adminStudentImport.phoneLabel')}</span>
            <input
              type="tel"
              dir="ltr"
              maxLength={25}
              value={form.phone}
              onChange={patch('phone')}
              className="w-full rounded-btn border border-line bg-surface p-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">{t('dashboard.adminStudentImport.passwordLabel')}</span>
            <input
              type="text"
              dir="ltr"
              value={form.password}
              onChange={patch('password')}
              className={`w-full rounded-btn border bg-surface p-3 text-sm text-ink focus:outline-none focus:ring-2 ${
                touched && form.password.length < 8 ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
              }`}
            />
            <span className="text-xs text-ink-soft">{t('dashboard.adminStudentImport.passwordHint')}</span>
          </label>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-line py-3 text-sm font-medium text-ink-soft hover:bg-line/30"
          >
            {t('dashboard.adminStudentImport.close')}
          </button>
          <button
            type="button"
            disabled={createAccount.isPending}
            onClick={handleSubmit}
            className="flex-1 rounded-xl bg-primary py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {t('dashboard.adminStudentImport.addSubmit')}
          </button>
        </div>
      </div>
    </div>
  );
}
