import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from '@/components/layout/Logo';
import { ApiErrorList, Button } from '@/components/ui';
import { SmoothSelect } from '@/components/dashboard/SmoothSelect';
import { NAME_VALIDATION_PATTERN, EMAIL_PATTERN, PHONE_PATTERN } from '@/lib/accountFormValidation';
import { useAuth, useRegisterTeacher } from '@/hooks/useAuth';
import { useT } from '@/hooks/useT';

/** يوازي حد كلمة المرور في الباك اند (Password::min(8)->mixedCase()->numbers()) — نفس PASSWORD_PATTERN في RegisterPage.jsx */
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const REGISTER_FIELD_LABELS = {
  name: 'الاسم',
  email: 'البريد الإلكتروني',
  phone: 'رقم الهاتف',
  password: 'كلمة المرور',
  teacher_type: 'نوع الحساب',
};
const registerErrorLabel = (path) => REGISTER_FIELD_LABELS[path] ?? path;

/**
 * تسجيل ذاتي للمعلم (يشمل مراكز التدريب كنوع حساب — راجع تعليق هجرة جدول
 * teachers: ليست كياناً منفصلاً) — باب ثانٍ إلى جانب تسجيل الأدمن (invite/
 * createAccount في TeacherController)، لا بديل عنه. نفس بنية RegisterPage.jsx
 * (الطالب) حرفياً، باستبدال حقول الملف الأكاديمي بحقل واحد لنوع الحساب —
 * teacher_type حالة منفصلة (SmoothSelect ليس مبنياً على react-hook-form،
 * نفس سبب فصل StudentAcademicProfileFields هناك).
 */
export function RegisterTeacherPage() {
  const t = useT();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const registerTeacher = useRegisterTeacher();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [teacherType, setTeacherType] = useState('');
  const [teacherTypeTouched, setTeacherTypeTouched] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { name: '', email: '', phone: '', password: '', password_confirmation: '' } });

  const password = watch('password');

  const TEACHER_TYPE_OPTIONS = [
    { value: 'school', label: t('auth.registerTeacher.typeSchool') },
    { value: 'university', label: t('auth.registerTeacher.typeUniversity') },
    { value: 'training_center', label: t('auth.registerTeacher.typeTrainingCenter') },
  ];

  if (isAuthenticated) return <Navigate to="/" replace />;

  const onSubmit = (values) => {
    setTeacherTypeTouched(true);
    if (!teacherType) return;

    registerTeacher.mutate(
      {
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim() || undefined,
        teacher_type: teacherType,
        password: values.password,
        password_confirmation: values.password_confirmation,
      },
      { onSuccess: () => navigate('/dashboard/teacher', { replace: true }) },
    );
  };

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Brand panel — right side in RTL */}
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-hero-gradient p-12 lg:flex">
        <div className="pointer-events-none absolute -top-10 right-1/4 h-72 w-3/5 rounded-full bg-white/20 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-black/10 blur-[100px]" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-md text-center text-white"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
            <GraduationCap size={40} />
          </div>
          <h1 className="mt-8 text-3xl font-bold">{t('auth.registerTeacher.heroTitle')}</h1>
          <p className="mt-4 text-base leading-relaxed text-white/90">{t('auth.registerTeacher.heroSubtitle')}</p>
        </motion.div>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-1 flex-col justify-center px-6 py-12 sm:px-10 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 flex items-center justify-between">
            <Link to="/">
              <Logo />
            </Link>
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-primary"
            >
              {t('auth.backHome')}
              <ArrowRight size={15} />
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="text-2xl font-bold text-ink">{t('auth.registerTeacher.title')}</h2>
            <p className="mt-2 text-sm text-ink-soft">{t('auth.registerTeacher.subtitle')}</p>

            <form className="mt-6 flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
              <label className="flex flex-col gap-1.5 text-start">
                <span className="text-sm font-semibold text-ink">{t('auth.nameLabel')}</span>
                <div className="relative">
                  <User size={17} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
                  <input
                    type="text"
                    maxLength={150}
                    placeholder={t('auth.namePlaceholder')}
                    className={`w-full rounded-btn border bg-surface py-3 pr-10 pl-3.5 text-sm text-ink focus:outline-none focus:ring-2 ${
                      errors.name ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
                    }`}
                    {...register('name', {
                      required: t('auth.nameRequired'),
                      pattern: { value: NAME_VALIDATION_PATTERN, message: t('auth.nameInvalid') },
                      maxLength: { value: 150, message: t('auth.nameTooLong') },
                    })}
                  />
                </div>
                {errors.name && <span className="text-xs text-accent-pink">{errors.name.message}</span>}
              </label>

              <label className="flex flex-col gap-1.5 text-start">
                <span className="text-sm font-semibold text-ink">{t('auth.emailLabel')}</span>
                <div className="relative">
                  <Mail size={17} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
                  <input
                    type="email"
                    dir="ltr"
                    maxLength={150}
                    placeholder={t('auth.emailPlaceholder')}
                    className={`w-full rounded-btn border bg-surface py-3 pl-3.5 pr-10 text-left text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 ${
                      errors.email ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
                    }`}
                    {...register('email', {
                      required: t('auth.emailRequired'),
                      pattern: { value: EMAIL_PATTERN, message: t('auth.emailInvalid') },
                      maxLength: { value: 150, message: t('auth.emailTooLong') },
                    })}
                  />
                </div>
                {errors.email && <span className="text-xs text-accent-pink">{errors.email.message}</span>}
              </label>

              <label className="flex flex-col gap-1.5 text-start">
                <span className="text-sm font-semibold text-ink">
                  {t('auth.phoneLabel')} <span className="text-ink-soft">({t('completeProfile.optional')})</span>
                </span>
                <div className="relative">
                  <Phone size={17} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
                  <input
                    type="tel"
                    dir="ltr"
                    maxLength={25}
                    placeholder={t('auth.phonePlaceholder')}
                    className={`w-full rounded-btn border bg-surface py-3 pl-3.5 pr-10 text-left text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 ${
                      errors.phone ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
                    }`}
                    {...register('phone', {
                      pattern: { value: PHONE_PATTERN, message: t('auth.phoneInvalid') },
                      maxLength: { value: 25, message: t('auth.phoneTooLong') },
                    })}
                  />
                </div>
                {errors.phone && <span className="text-xs text-accent-pink">{errors.phone.message}</span>}
              </label>

              <div className="flex flex-col gap-1.5 text-start">
                <span className="text-sm font-semibold text-ink">{t('auth.registerTeacher.typeLabel')}</span>
                <SmoothSelect
                  value={teacherType}
                  onChange={(v) => {
                    setTeacherType(v);
                    setTeacherTypeTouched(true);
                  }}
                  options={TEACHER_TYPE_OPTIONS}
                  placeholder={t('auth.registerTeacher.typePlaceholder')}
                  error={teacherTypeTouched && !teacherType}
                />
                {teacherTypeTouched && !teacherType && (
                  <span className="text-xs text-accent-pink">{t('auth.registerTeacher.typeRequired')}</span>
                )}
              </div>

              <label className="flex flex-col gap-1.5 text-start">
                <span className="text-sm font-semibold text-ink">{t('auth.passwordLabel')}</span>
                <div className="relative">
                  <Lock size={17} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    dir="ltr"
                    maxLength={255}
                    placeholder={t('auth.passwordPlaceholder')}
                    className={`w-full rounded-btn border bg-surface py-3 pl-10 pr-10 text-left text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 ${
                      errors.password ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
                    }`}
                    {...register('password', {
                      required: t('auth.passwordRequired'),
                      pattern: { value: PASSWORD_PATTERN, message: t('auth.passwordComplexity') },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft transition-colors hover:text-ink"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {errors.password ? (
                  <span className="text-xs text-accent-pink">{errors.password.message}</span>
                ) : (
                  <span className="text-xs text-ink-soft">{t('auth.passwordComplexity')}</span>
                )}
              </label>

              <label className="flex flex-col gap-1.5 text-start">
                <span className="text-sm font-semibold text-ink">{t('auth.confirmPasswordLabel')}</span>
                <div className="relative">
                  <Lock size={17} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
                  <input
                    type={showPasswordConfirmation ? 'text' : 'password'}
                    dir="ltr"
                    maxLength={255}
                    className={`w-full rounded-btn border bg-surface py-3 pl-10 pr-10 text-left text-sm text-ink focus:outline-none focus:ring-2 ${
                      errors.password_confirmation ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
                    }`}
                    {...register('password_confirmation', {
                      required: t('auth.confirmPasswordRequired'),
                      validate: (value) => value === password || t('auth.passwordMismatch'),
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirmation((v) => !v)}
                    aria-label={showPasswordConfirmation ? t('auth.hidePassword') : t('auth.showPassword')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft transition-colors hover:text-ink"
                  >
                    {showPasswordConfirmation ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {errors.password_confirmation && (
                  <span className="text-xs text-accent-pink">{errors.password_confirmation.message}</span>
                )}
              </label>

              {registerTeacher.isError && <ApiErrorList error={registerTeacher.error} labelFor={registerErrorLabel} />}

              <Button type="submit" disabled={registerTeacher.isPending} className="w-full justify-center py-3">
                {registerTeacher.isPending ? t('auth.registerTeacher.submitting') : t('auth.registerTeacher.submit')}
              </Button>

              <p className="text-center text-sm text-ink-soft">
                {t('auth.alreadyHaveAccount')}{' '}
                <Link to="/login" className="font-medium text-primary hover:opacity-70">
                  {t('auth.goToLogin')}
                </Link>
              </p>
              <p className="text-center text-sm text-ink-soft">
                {t('auth.areYouAStudent')}{' '}
                <Link to="/register" className="font-medium text-primary hover:opacity-70">
                  {t('auth.registerAsStudent')}
                </Link>
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
