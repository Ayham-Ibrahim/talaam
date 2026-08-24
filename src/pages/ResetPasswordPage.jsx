import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from '@/components/layout/Logo';
import { ApiErrorList, Button } from '@/components/ui';
import { useResetPassword } from '@/hooks/useAuth';
import { useT } from '@/hooks/useT';

/** يوازي حد كلمة المرور في الباك اند (Password::min(8)->mixedCase()->numbers()) — راجع AppServiceProvider */
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export function ResetPasswordPage() {
  const t = useT();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const [showPassword, setShowPassword] = useState(false);
  const resetPassword = useResetPassword();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { password: '', passwordConfirmation: '' } });

  const password = watch('password');

  const onSubmit = (values) => {
    resetPassword.mutate({
      email,
      token,
      password: values.password,
      passwordConfirmation: values.passwordConfirmation,
    });
  };

  const missingLink = !token || !email;

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-primary"
          >
            {t('auth.backToLogin')}
            <ArrowRight size={15} />
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-card bg-surface p-8 shadow-card"
        >
          {missingLink ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="text-sm text-accent-pink">{t('auth.invalidResetLink')}</p>
              <Link to="/forgot-password" className="text-sm font-medium text-primary hover:opacity-70">
                {t('auth.forgotTitle')}
              </Link>
            </div>
          ) : resetPassword.isSuccess ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-light text-success">
                <CheckCircle2 size={26} />
              </div>
              <h2 className="text-lg font-bold text-ink">{t('auth.resetSuccessTitle')}</h2>
              <p className="text-sm text-ink-soft">{t('auth.resetSuccessHint')}</p>
              <Button className="mt-2" onClick={() => navigate('/login', { replace: true })}>
                {t('auth.goToLogin')}
              </Button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-ink">{t('auth.resetTitle')}</h2>
              <p className="mt-2 text-sm text-ink-soft">{t('auth.resetSubtitle')}</p>

              <form className="mt-6 flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
                <label className="flex flex-col gap-1.5 text-start">
                  <span className="text-sm font-semibold text-ink">{t('auth.newPasswordLabel')}</span>
                  <div className="relative">
                    <Lock size={17} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      dir="ltr"
                      maxLength={255}
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
                  {errors.password && <span className="text-xs text-accent-pink">{errors.password.message}</span>}
                </label>

                <label className="flex flex-col gap-1.5 text-start">
                  <span className="text-sm font-semibold text-ink">{t('auth.confirmPasswordLabel')}</span>
                  <div className="relative">
                    <Lock size={17} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      dir="ltr"
                      maxLength={255}
                      className={`w-full rounded-btn border bg-surface py-3 pl-3.5 pr-10 text-left text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 ${
                        errors.passwordConfirmation ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
                      }`}
                      {...register('passwordConfirmation', {
                        required: t('auth.confirmPasswordRequired'),
                        validate: (value) => value === password || t('auth.passwordMismatch'),
                      })}
                    />
                  </div>
                  {errors.passwordConfirmation && (
                    <span className="text-xs text-accent-pink">{errors.passwordConfirmation.message}</span>
                  )}
                </label>

                {resetPassword.isError && <ApiErrorList error={resetPassword.error} labelFor={() => null} />}

                <Button type="submit" disabled={resetPassword.isPending} className="w-full justify-center py-3">
                  {resetPassword.isPending ? t('auth.resetSubmitting') : t('auth.resetSubmit')}
                </Button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
