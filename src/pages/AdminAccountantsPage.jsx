import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { AdminDashboardLayout } from '@/components/dashboard/admin/AdminDashboardLayout';
import { ApiErrorList } from '@/components/ui';
import { client } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { useAuth } from '@/hooks/useAuth';
import { useT } from '@/hooks/useT';

const EMPTY_FORM = { name: '', email: '', phone: '', password: '' };

/** الأدمن يُنشئ حساب محاسب بكلمة مرور يضعها بنفسه — يُرسَل بريد بالبيانات للمحاسب (AccountCreatedByAdmin) */
export function AdminAccountantsPage() {
  const t = useT();
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [success, setSuccess] = useState('');

  const create = useMutation({
    mutationFn: async (payload) => {
      const { data } = await client.post(endpoints.accountants.create, payload);
      return data.data;
    },
    onSuccess: () => {
      setSuccess(t('dashboard.accountants.createdSuccess'));
      setForm(EMPTY_FORM);
    },
  });

  if (!user) return <Navigate to="/login" replace />;

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  const canSubmit = form.name.trim() && form.email.trim() && form.password.length >= 8;

  return (
    <AdminDashboardLayout>
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        <div className="text-right">
          <h1 className="text-xl font-bold text-ink">{t('dashboard.accountants.title')}</h1>
          <p className="mt-1 text-sm text-ink-soft">{t('dashboard.accountants.subtitle')}</p>
        </div>

        <form
          className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-card"
          onSubmit={(e) => {
            e.preventDefault();
            setSuccess('');
            if (canSubmit) create.mutate({ ...form, phone: form.phone || null });
          }}
        >
          {create.isError && <ApiErrorList error={create.error} labelFor={() => null} />}
          {success && <div className="rounded-btn bg-success-light px-4 py-3 text-sm text-success">{success}</div>}

          {[
            ['name', 'nameLabel', 'text'],
            ['email', 'emailLabel', 'email'],
            ['phone', 'phoneLabel', 'tel'],
            ['password', 'passwordLabel', 'text'],
          ].map(([field, labelKey, type]) => (
            <label key={field} className="flex flex-col gap-1.5 text-right">
              <span className="text-sm font-semibold text-ink">{t(`dashboard.accountants.${labelKey}`)}</span>
              <input
                type={type}
                dir={field === 'name' ? 'rtl' : 'ltr'}
                value={form[field]}
                onChange={set(field)}
                className="w-full rounded-btn border border-line bg-white p-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>
          ))}
          <span className="text-xs text-ink-soft">{t('dashboard.accountants.passwordHint')}</span>

          <button
            type="submit"
            disabled={!canSubmit || create.isPending}
            className="rounded-xl bg-primary py-3 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {create.isPending ? t('dashboard.accountants.creating') : t('dashboard.accountants.create')}
          </button>
        </form>
      </div>
    </AdminDashboardLayout>
  );
}
