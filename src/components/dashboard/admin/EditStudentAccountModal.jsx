import { useState } from 'react';
import { X } from 'lucide-react';
import { ApiErrorList } from '@/components/ui';
import { useAdminUpdateStudentAccount } from '@/hooks/useAdminStudents';
import { useT } from '@/hooks/useT';

/**
 * الأدمن يعدّل اسم/بريد/هاتف الطالب — نفس شكل ChangeStudentPasswordModal.
 * حساب الأخ بلا بريد (يدخل ببريد الأساسي)، فيُخفى حقل البريد ولا يُرسَل.
 */
export function EditStudentAccountModal({ studentId, student, onClose }) {
  const t = useT();
  const isSibling = !student.email;
  const [name, setName] = useState(student.name ?? '');
  const [email, setEmail] = useState(student.email ?? '');
  const [phone, setPhone] = useState(student.phone ?? '');
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const updateAccount = useAdminUpdateStudentAccount(studentId);

  const nameError = submitAttempted && !name.trim() ? 'dashboard.adminStudentDetail.nameRequired' : null;
  const emailError = submitAttempted && !isSibling && !email.trim() ? 'dashboard.adminStudentDetail.emailRequired' : null;

  const handleSubmit = () => {
    setSubmitAttempted(true);
    if (!name.trim() || (!isSibling && !email.trim())) return;
    updateAccount.mutate(
      {
        name: name.trim(),
        ...(isSibling ? {} : { email: email.trim() }),
        phone: phone.trim() || null,
      },
      { onSuccess: () => onClose?.() },
    );
  };

  const inputClass = (error) =>
    `w-full rounded-btn border bg-surface p-3 text-sm text-ink focus:outline-none focus:ring-2 ${
      error ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
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
          <h3 className="flex-1 text-center text-lg font-bold text-ink">{t('dashboard.adminStudentDetail.editAccountTitle')}</h3>
          <span className="w-8" />
        </div>

        {updateAccount.isError && <ApiErrorList error={updateAccount.error} labelFor={() => null} className="mb-4" />}

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-right">
            <span className="text-sm font-semibold text-ink">{t('dashboard.adminStudentDetail.nameLabel')}</span>
            <input
              type="text"
              dir="auto"
              maxLength={150}
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={!!nameError}
              className={inputClass(nameError)}
            />
            {nameError && <span className="text-xs text-accent-pink">{t(nameError)}</span>}
          </label>

          <label className="flex flex-col gap-1.5 text-right">
            <span className="text-sm font-semibold text-ink">{t('dashboard.adminStudentDetail.emailLabel')}</span>
            {isSibling ? (
              <span className="text-xs text-ink-soft">{t('dashboard.adminStudentDetail.siblingNoEmail')}</span>
            ) : (
              <>
                <input
                  type="email"
                  dir="ltr"
                  maxLength={150}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!emailError}
                  className={inputClass(emailError)}
                />
                {emailError && <span className="text-xs text-accent-pink">{t(emailError)}</span>}
              </>
            )}
          </label>

          <label className="flex flex-col gap-1.5 text-right">
            <span className="text-sm font-semibold text-ink">{t('dashboard.adminStudentDetail.phoneLabel')}</span>
            <input
              type="tel"
              dir="ltr"
              maxLength={25}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass(null)}
            />
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
            disabled={updateAccount.isPending}
            onClick={handleSubmit}
            className="flex-1 rounded-xl bg-primary py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {updateAccount.isPending ? t('dashboard.adminStudentDetail.saving') : t('dashboard.adminStudentDetail.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
