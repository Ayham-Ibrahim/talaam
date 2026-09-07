import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from '@/components/layout/Logo';
import { ApiErrorList, Button } from '@/components/ui';
import {
  StudentAcademicProfileFields,
  STUDENT_ACADEMIC_INITIAL,
  buildStudentAcademicPayload,
  isStudentAcademicFormValid,
} from '@/components/dashboard/StudentAcademicProfileFields';
import { NAME_VALIDATION_PATTERN, EMAIL_PATTERN, PHONE_PATTERN } from '@/lib/accountFormValidation';
import { useAuth, useRegisterStudent } from '@/hooks/useAuth';
import { useT } from '@/hooks/useT';

/** يوازي حد كلمة المرور في الباك اند (Password::min(8)->mixedCase()->numbers()) — نفس النمط المستخدم في ResetPasswordPage */
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const REGISTER_FIELD_LABELS = {
  name: 'الاسم',
  email: 'البريد الإلكتروني',
  phone: 'رقم الهاتف',
  password: 'كلمة المرور',
  education_type: 'نوع التعليم',
  curriculum_id: 'المنهج',
  stage_id: 'المرحلة',
  university_id: 'الجامعة',
  major_id: 'التخصص',
  course_field_id: 'مجال الدورة',
  guardian_name: 'اسم ولي الأمر',
  guardian_phone: 'هاتف ولي الأمر',
};
const registerErrorLabel = (path) => REGISTER_FIELD_LABELS[path] ?? path;

/**
 * تسجيل ذاتي للطالب فقط (RULE-01: لا تسجيل ذاتي للمعلمين — TeacherService
 * تعليق invite()) — الباك اند (AuthController::registerStudent) موجود
 * وواضح، لكن لم تكن له شاشة فرونت إند إطلاقاً؛ هذه الصفحة أول ربط فعلي بها.
 * حقول الهوية (react-hook-form، بنفس نمط LoginPage/ResetPasswordPage) +
 * حقول الملف الأكاديمي (StudentAcademicProfileFields، بنفس نمط
 * CompleteStudentProfilePage — state يدوي منفصل لأن المكوّن غير مبني على
 * react-hook-form) تُدمَجان في حمولة واحدة عند الإرسال.
 */
export function RegisterPage() {
  const t = useT();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const registerStudent = useRegisterStudent();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [academicForm, setAcademicForm] = useState(STUDENT_ACADEMIC_INITIAL);
  const [academicTouched, setAcademicTouched] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { name: '', email: '', phone: '', password: '', password_confirmation: '' } });

  const password = watch('password');

  if (isAuthenticated) return <Navigate to="/dashboard/student" replace />;

  const onSubmit = (values) => {
    setAcademicTouched(true);
    if (!isStudentAcademicFormValid(academicForm, false)) return;

    registerStudent.mutate(
      {
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim() || undefined,
        password: values.password,
        password_confirmation: values.password_confirmation,
        ...buildStudentAcademicPayload(academicForm),
      },
      { onSuccess: () => navigate('/dashboard/student', { replace: true }) },
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
          <h1 className="mt-8 text-3xl font-bold">{t('auth.heroTitle')}</h1>
          <p className="mt-4 text-base leading-relaxed text-white/90">{t('auth.heroSubtitle')}</p>
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
            <h2 className="text-2xl font-bold text-ink">{t('auth.registerTitle')}</h2>
            <p className="mt-2 text-sm text-ink-soft">{t('auth.registerSubtitle')}</p>

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

              <div className="border-t border-line/60 pt-5">
                <StudentAcademicProfileFields
                  form={academicForm}
                  setForm={setAcademicForm}
                  touched={academicTouched}
                  requireGuardian={false}
                />
              </div>

              {registerStudent.isError && <ApiErrorList error={registerStudent.error} labelFor={registerErrorLabel} />}

              <Button type="submit" disabled={registerStudent.isPending} className="w-full justify-center py-3">
                {registerStudent.isPending ? t('auth.registerSubmitting') : t('auth.registerSubmit')}
              </Button>

              <p className="text-center text-sm text-ink-soft">
                {t('auth.alreadyHaveAccount')}{' '}
                <Link to="/login" className="font-medium text-primary hover:opacity-70">
                  {t('auth.goToLogin')}
                </Link>
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
