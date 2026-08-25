import { useState } from 'react';
import { X } from 'lucide-react';
import { SmoothSelect } from '@/components/dashboard/SmoothSelect';
import { ApiErrorList } from '@/components/ui';
import { TEACHER_TYPE_LABELS } from '@/services/teacherService';
import { useCreateTeacherAccount } from '@/hooks/useAdmin';
import { useT } from '@/hooks/useT';
import {
  isEditingKey,
  isNameInputCharacterValid,
  isPhoneInputCharacterValid,
  sanitizeName,
  sanitizePhone,
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
} from '@/lib/accountFormValidation';

const TEACHER_TYPE_OPTIONS = Object.entries(TEACHER_TYPE_LABELS).map(([value, label]) => ({ value, label }));

const INITIAL = { name: '', email: '', phone: '', teacher_type: '', password: '' };
const INITIAL_TOUCHED = { name: false, email: false, phone: false, teacher_type: false, password: false };

const ACCOUNT_FIELD_LABELS = { name: 'الاسم', email: 'البريد الإلكتروني', phone: 'الهاتف', teacher_type: 'النوع', password: 'كلمة المرور' };
const accountErrorLabel = (path) => ACCOUNT_FIELD_LABELS[path] ?? path;

export function AddTeacherAccountModal({ onClose }) {
  const t = useT();
  const [form, setForm] = useState(INITIAL);
  const [touched, setTouched] = useState(INITIAL_TOUCHED);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [nameHasInvalidChars, setNameHasInvalidChars] = useState(false);
  const [phoneHasInvalidChars, setPhoneHasInvalidChars] = useState(false);
  const createAccount = useCreateTeacherAccount();

  const patch = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  const touch = (field) => setTouched((prev) => ({ ...prev, [field]: true }));
  const shouldShowError = (field) => touched[field] || submitAttempted;

  const handleNameChange = (e) => {
    const nextValue = e.target.value;

    setNameHasInvalidChars(!isNameInputCharacterValid(nextValue));
    setForm((prev) => ({ ...prev, name: sanitizeName(nextValue) }));
  };

  const handleNameKeyDown = (e) => {
    if (isEditingKey(e)) {
      setNameHasInvalidChars(false);
      return;
    }

    if (isNameInputCharacterValid(e.key)) {
      setNameHasInvalidChars(false);
      return;
    }

    e.preventDefault();
    setNameHasInvalidChars(true);
  };

  const handleNamePaste = (e) => {
    const pastedText = e.clipboardData.getData('text');

    if (!isNameInputCharacterValid(pastedText)) {
      e.preventDefault();
      setNameHasInvalidChars(true);
      return;
    }

    setNameHasInvalidChars(false);
  };

  const handlePhoneChange = (e) => {
    const nextValue = e.target.value;
    const sanitizedValue = sanitizePhone(nextValue);

    setPhoneHasInvalidChars(!isPhoneInputCharacterValid(nextValue));
    setForm((prev) => ({ ...prev, phone: sanitizedValue }));
  };

  const handlePhoneKeyDown = (e) => {
    if (isEditingKey(e)) {
      setPhoneHasInvalidChars(false);
      return;
    }

    const isAsciiDigit = /^\d$/.test(e.key);
    const isArabicIndicDigit = /^[٠-٩]$/.test(e.key);
    const isEasternArabicDigit = /^[۰-۹]$/.test(e.key);
    const canInsertLeadingPlus =
      e.key === '+' && !e.currentTarget.value.includes('+') && (e.currentTarget.selectionStart ?? 0) === 0;

    if (isAsciiDigit || isArabicIndicDigit || isEasternArabicDigit || canInsertLeadingPlus) {
      setPhoneHasInvalidChars(false);
      return;
    }

    e.preventDefault();
    setPhoneHasInvalidChars(true);
  };

  const handlePhonePaste = (e) => {
    const pastedText = e.clipboardData.getData('text');

    if (!isPhoneInputCharacterValid(pastedText)) {
      e.preventDefault();
      setPhoneHasInvalidChars(true);
      return;
    }

    setPhoneHasInvalidChars(false);
  };

  const nameValidation = validateName(form.name);
  const emailValidation = validateEmail(form.email);
  const phoneValidation = validatePhone(form.phone);
  const passwordValidation = validatePassword(form.password);
  const teacherTypeValidation = form.teacher_type === '' ? 'required' : null;

  const nameErrorKey = nameHasInvalidChars
    ? 'dashboard.adminTeachers.nameInvalid'
    : shouldShowError('name') && nameValidation
      ? `dashboard.adminTeachers.name${nameValidation === 'tooLong' ? 'TooLong' : nameValidation === 'required' ? 'Required' : 'Invalid'}`
      : null;
  const emailErrorKey = shouldShowError('email') && emailValidation
    ? `dashboard.adminTeachers.email${emailValidation === 'tooLong' ? 'TooLong' : emailValidation === 'required' ? 'Required' : 'Invalid'}`
    : null;
  const phoneErrorKey = phoneHasInvalidChars
    ? 'dashboard.adminTeachers.phoneInvalid'
    : shouldShowError('phone') && phoneValidation
      ? `dashboard.adminTeachers.phone${phoneValidation === 'tooLong' ? 'TooLong' : 'Invalid'}`
      : null;
  const teacherTypeErrorKey = shouldShowError('teacher_type') && teacherTypeValidation ? 'dashboard.adminTeachers.typeRequired' : null;
  const passwordErrorKey = shouldShowError('password') && passwordValidation
    ? `dashboard.adminTeachers.password${passwordValidation === 'required' ? 'Required' : passwordValidation === 'tooLong' ? 'TooLong' : 'Min'}`
    : null;

  const isValid =
    !nameValidation &&
    !emailValidation &&
    !phoneValidation &&
    !passwordValidation &&
    !teacherTypeValidation &&
    !nameHasInvalidChars &&
    !phoneHasInvalidChars;

  const handleSubmit = () => {
    setSubmitAttempted(true);
    setTouched({ name: true, email: true, phone: true, teacher_type: true, password: true });
    if (!isValid) return;
    createAccount.mutate(
      { ...form, name: form.name.trim(), email: form.email.trim(), phone: form.phone || null },
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
            aria-label={t('dashboard.adminTeachers.close')}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-line/40 hover:text-ink"
          >
            <X size={18} />
          </button>
          <h3 className="flex-1 text-center text-lg font-bold text-ink">{t('dashboard.adminTeachers.addModalTitle')}</h3>
          <span className="w-8" />
        </div>

        {createAccount.isError && <ApiErrorList error={createAccount.error} labelFor={accountErrorLabel} className="mb-4" />}

        <div className="flex flex-col gap-3 text-right">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">{t('dashboard.adminTeachers.nameLabel')}</span>
            <input
              type="text"
              maxLength={150}
              value={form.name}
              onKeyDown={handleNameKeyDown}
              onPaste={handleNamePaste}
              onChange={handleNameChange}
              onBlur={() => touch('name')}
              aria-invalid={!!nameErrorKey}
              className={`w-full rounded-btn border bg-surface p-3 text-sm text-ink focus:outline-none focus:ring-2 ${
                nameErrorKey ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
              }`}
            />
            <span className={`text-xs ${nameErrorKey ? 'text-accent-pink' : 'text-ink-soft'}`}>
              {nameErrorKey ? t(nameErrorKey) : t('dashboard.adminTeachers.nameHint')}
            </span>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">{t('dashboard.adminTeachers.emailLabel')}</span>
            <input
              type="email"
              dir="ltr"
              maxLength={150}
              value={form.email}
              onChange={patch('email')}
              onBlur={() => touch('email')}
              aria-invalid={!!emailErrorKey}
              className={`w-full rounded-btn border bg-surface p-3 text-sm text-ink focus:outline-none focus:ring-2 ${
                emailErrorKey ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
              }`}
            />
            {emailErrorKey && <span className="text-xs text-accent-pink">{t(emailErrorKey)}</span>}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">{t('dashboard.adminTeachers.phoneLabel')}</span>
            <input
              type="tel"
              dir="ltr"
              maxLength={25}
              inputMode="tel"
              autoComplete="tel"
              pattern="^\+?\d*$"
              value={form.phone}
              onKeyDown={handlePhoneKeyDown}
              onPaste={handlePhonePaste}
              onChange={handlePhoneChange}
              onBlur={() => touch('phone')}
              aria-invalid={!!phoneErrorKey}
              className={`w-full rounded-btn border bg-surface p-3 text-sm text-ink focus:outline-none focus:ring-2 ${
                phoneErrorKey ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
              }`}
            />
            <span className={`text-xs ${phoneErrorKey ? 'text-accent-pink' : 'text-ink-soft'}`}>
              {phoneErrorKey ? t(phoneErrorKey) : t('dashboard.adminTeachers.phoneHint')}
            </span>
          </label>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">{t('dashboard.adminTeachers.typeLabel')}</span>
            <SmoothSelect
              value={form.teacher_type}
              onChange={(v) => {
                setForm((prev) => ({ ...prev, teacher_type: v }));
                setTouched((prev) => ({ ...prev, teacher_type: true }));
              }}
              options={TEACHER_TYPE_OPTIONS}
              placeholder="—"
            />
            {teacherTypeErrorKey && <span className="text-xs text-accent-pink">{t(teacherTypeErrorKey)}</span>}
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">{t('dashboard.adminTeachers.passwordLabel')}</span>
            <input
              type="password"
              dir="ltr"
              maxLength={255}
              value={form.password}
              onChange={patch('password')}
              onBlur={() => touch('password')}
              aria-invalid={!!passwordErrorKey}
              className={`w-full rounded-btn border bg-surface p-3 text-sm text-ink focus:outline-none focus:ring-2 ${
                passwordErrorKey ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
              }`}
            />
            <span className={`text-xs ${passwordErrorKey ? 'text-accent-pink' : 'text-ink-soft'}`}>
              {passwordErrorKey ? t(passwordErrorKey) : t('dashboard.adminTeachers.passwordHint')}
            </span>
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
