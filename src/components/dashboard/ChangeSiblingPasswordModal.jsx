import { useState } from 'react';
import { X } from 'lucide-react';
import { ApiErrorList } from '@/components/ui';
import { SiblingPasswordField, validateSiblingPassword } from '@/components/dashboard/SiblingPasswordField';
import { useUpdateSiblingPassword } from '@/hooks/useSiblings';
import { useT } from '@/hooks/useT';

/** الحساب الأساسي يضع كلمة مرور جديدة لأحد إخوته — بلا القديمة (يوازي ChangeStudentPasswordModal للأدمن) */
export function ChangeSiblingPasswordModal({ sibling, onClose, onSaved }) {
  const t = useT();
  const [password, setPassword] = useState('');
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const updatePassword = useUpdateSiblingPassword();

  const handleSubmit = () => {
    setSubmitAttempted(true);
    if (validateSiblingPassword(password)) return;
    updatePassword.mutate({ userId: sibling.id, password }, {
      onSuccess: () => {
        onSaved?.();
        onClose?.();
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            aria-label={t('siblings.cancel')}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-line/40 hover:text-ink"
          >
            <X size={18} />
          </button>
          <h3 className="flex-1 text-center text-lg font-bold text-ink">{t('siblings.changePasswordTitle')}</h3>
          <span className="w-8" />
        </div>

        <p className="mb-1 text-center text-sm text-ink-soft">
          {t('siblings.changePasswordFor')} <span className="font-semibold text-ink">{sibling.name}</span>
        </p>
        <p className="mb-4 text-center text-xs text-ink-soft">{t('siblings.changePasswordNote')}</p>

        {updatePassword.isError && <ApiErrorList error={updatePassword.error} labelFor={() => null} className="mb-4" />}

        <SiblingPasswordField value={password} onChange={setPassword} showError={submitAttempted} />

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-line py-3 text-sm font-medium text-ink-soft hover:bg-line/30"
          >
            {t('siblings.cancel')}
          </button>
          <button
            type="button"
            disabled={updatePassword.isPending}
            onClick={handleSubmit}
            className="flex-1 rounded-xl bg-primary py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {updatePassword.isPending ? t('siblings.changingPassword') : t('siblings.changePasswordSubmit')}
          </button>
        </div>
      </div>
    </div>
  );
}
