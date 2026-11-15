import { useState } from 'react';
import { PasswordInputActions } from '@/components/ui';
import { useT } from '@/hooks/useT';
import { validatePassword } from '@/lib/accountFormValidation';

const ERROR_KEYS = {
  required: 'siblings.passwordRequired',
  min: 'siblings.passwordMin',
  tooLong: 'siblings.passwordTooLong',
  weak: 'siblings.passwordWeak',
};

/** نفس سياسة الباك اند (Password::min(8)->mixedCase()->numbers()) — تفرّد كلمة المرور داخل العائلة يُفحص هناك فقط */
export function validateSiblingPassword(value) {
  const base = validatePassword(value);
  if (base) return base;
  if (!/[a-z]/.test(value) || !/[A-Z]/.test(value) || !/\d/.test(value)) return 'weak';

  return null;
}

/**
 * حقل كلمة مرور حساب الأخ (إضافة أخ + تغيير كلمة مروره من الحساب الأساسي) —
 * حقل واحد مع توليد/إظهار كما في نوافذ الأدمن، والتأكيد يُرسَل بنفس القيمة.
 */
export function SiblingPasswordField({ value, onChange, showError }) {
  const t = useT();
  const [visible, setVisible] = useState(false);
  const [touched, setTouched] = useState(false);

  const validation = validateSiblingPassword(value);
  const errorKey = (touched || showError) && validation ? ERROR_KEYS[validation] : null;

  return (
    <label className="flex flex-col gap-1.5 text-right">
      <span className="text-sm font-semibold text-ink">{t('siblings.passwordLabel')}</span>
      <div className="flex items-center gap-2">
        <input
          type={visible ? 'text' : 'password'}
          dir="ltr"
          autoComplete="new-password"
          maxLength={255}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setTouched(true)}
          aria-invalid={!!errorKey}
          className={`w-full rounded-btn border bg-white p-3 text-sm text-ink focus:outline-none focus:ring-2 ${
            errorKey ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
          }`}
        />
        <PasswordInputActions
          visible={visible}
          onToggleVisible={() => setVisible((v) => !v)}
          onGenerate={(generated) => {
            onChange(generated);
            setVisible(true);
            setTouched(true);
          }}
        />
      </div>
      <span className={`text-xs ${errorKey ? 'text-accent-pink' : 'text-ink-soft'}`}>
        {errorKey ? t(errorKey) : t('siblings.passwordHint')}
      </span>
    </label>
  );
}
