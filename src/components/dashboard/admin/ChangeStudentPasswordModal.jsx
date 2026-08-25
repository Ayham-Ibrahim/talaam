import { useState } from 'react';
import { X } from 'lucide-react';
import { ApiErrorList } from '@/components/ui';
import { useAdminResetStudentPassword } from '@/hooks/useAdminStudents';
import { useT } from '@/hooks/useT';
import { validatePassword } from '@/lib/accountFormValidation';

/** يوازي AddStudentAccountModal في حقل كلمة المرور تماماً (نفس القواعد) — راجعه لتفصيل الأنماط المشتركة */
export function ChangeStudentPasswordModal({ student, onClose }) {
  const t = useT();
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const resetPassword = useAdminResetStudentPassword();

  const passwordValidation = validatePassword(password);
  const shouldShowError = touched || submitAttempted;
  const errorKey = shouldShowError && passwordValidation
    ? `dashboard.adminStudentImport.password${passwordValidation === 'required' ? 'Required' : passwordValidation === 'tooLong' ? 'TooLong' : 'Min'}`
    : null;

  const handleSubmit = () => {
    setSubmitAttempted(true);
    if (passwordValidation) return;
    resetPassword.mutate(
      { studentId: student.id, password },
      { onSuccess: () => onClose?.() },
    );
  };

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
          <h3 className="flex-1 text-center text-lg font-bold text-ink">{t('dashboard.adminStudents.changePasswordTitle')}</h3>
          <span className="w-8" />
        </div>

        <p className="mb-4 text-center text-sm text-ink-soft">
          {t('dashboard.adminStudents.changePasswordFor')} <span className="font-semibold text-ink">{student.name}</span>
        </p>

        {resetPassword.isError && <ApiErrorList error={resetPassword.error} labelFor={() => null} className="mb-4" />}

        <label className="flex flex-col gap-1.5 text-right">
          <span className="text-sm font-semibold text-ink">{t('dashboard.adminStudentImport.passwordLabel')}</span>
          <input
            type="password"
            dir="ltr"
            maxLength={255}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched(true)}
            aria-invalid={!!errorKey}
            className={`w-full rounded-btn border bg-surface p-3 text-sm text-ink focus:outline-none focus:ring-2 ${
              errorKey ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
            }`}
          />
          <span className={`text-xs ${errorKey ? 'text-accent-pink' : 'text-ink-soft'}`}>
            {errorKey ? t(errorKey) : t('dashboard.adminStudents.changePasswordHint')}
          </span>
        </label>

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
            disabled={resetPassword.isPending}
            onClick={handleSubmit}
            className="flex-1 rounded-xl bg-primary py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {resetPassword.isPending ? t('dashboard.adminStudents.changingPassword') : t('dashboard.adminStudents.changePasswordSubmit')}
          </button>
        </div>
      </div>
    </div>
  );
}
