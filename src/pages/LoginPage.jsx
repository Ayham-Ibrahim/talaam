import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap, Mail, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui';
import { useAuth, useLogin } from '@/hooks/useAuth';
import { useT } from '@/hooks/useT';
import { mockAccounts } from '@/mocks/auth.mock';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function roleHome(role) {
  return role === 'teacher' ? '/dashboard/teacher' : '/dashboard/student';
}

export function LoginPage() {
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: { email: '', password: '', rememberMe: true } });

  if (isAuthenticated) {
    const redirectTo = location.state?.from?.pathname || roleHome(user.role);
    return <Navigate to={redirectTo} replace />;
  }

  const onSubmit = (values) => {
    login.mutate(
      { email: values.email, password: values.password, rememberMe: values.rememberMe },
      {
        onSuccess: (data) => {
          const redirectTo = location.state?.from?.pathname || roleHome(data.user.role);
          navigate(redirectTo, { replace: true });
        },
      }
    );
  };

  const fillDemo = (email, password) => {
    setValue('email', email);
    setValue('password', password);
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
            <h2 className="text-2xl font-bold text-ink">{t('auth.title')}</h2>
            <p className="mt-2 text-sm text-ink-soft">{t('auth.subtitle')}</p>

            {/* Demo credentials — backend isn't connected yet */}
            <div className="mt-6 rounded-card border border-dashed border-primary/30 bg-primary-light/60 p-4">
              <p className="text-xs font-semibold text-primary">{t('auth.demoTitle')}</p>
              <p className="mt-1 text-xs text-ink-soft">{t('auth.demoHint')}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fillDemo(mockAccounts[0].email, mockAccounts[0].password)}
                  className="rounded-pill bg-white px-3 py-1.5 text-xs font-medium text-primary shadow-sm transition-colors hover:bg-primary hover:text-white"
                >
                  {t('auth.demoStudent')}
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo(mockAccounts[1].email, mockAccounts[1].password)}
                  className="rounded-pill bg-white px-3 py-1.5 text-xs font-medium text-accent-purple shadow-sm transition-colors hover:bg-accent-purple hover:text-white"
                >
                  {t('auth.demoTeacher')}
                </button>
              </div>
            </div>

            <form className="mt-6 flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Email */}
              <label className="flex flex-col gap-1.5 text-right">
                <span className="text-sm font-semibold text-ink">{t('auth.emailLabel')}</span>
                <div className="relative">
                  <Mail size={17} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
                  <input
                    type="email"
                    dir="ltr"
                    placeholder={t('auth.emailPlaceholder')}
                    className={`w-full rounded-btn border bg-surface py-3 pl-3.5 pr-10 text-left text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 ${
                      errors.email ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
                    }`}
                    {...register('email', {
                      required: t('auth.emailRequired'),
                      pattern: { value: EMAIL_PATTERN, message: t('auth.emailInvalid') },
                    })}
                  />
                </div>
                {errors.email && <span className="text-xs text-accent-pink">{errors.email.message}</span>}
              </label>

              {/* Password */}
              <label className="flex flex-col gap-1.5 text-right">
                <span className="text-sm font-semibold text-ink">{t('auth.passwordLabel')}</span>
                <div className="relative">
                  <Lock size={17} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    dir="ltr"
                    placeholder={t('auth.passwordPlaceholder')}
                    className={`w-full rounded-btn border bg-surface py-3 pl-10 pr-10 text-left text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 ${
                      errors.password ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
                    }`}
                    {...register('password', {
                      required: t('auth.passwordRequired'),
                      minLength: { value: 6, message: t('auth.passwordMin') },
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

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-ink-soft">
                  <input
                    type="checkbox"
                    defaultChecked
                    {...register('rememberMe')}
                    className="h-4 w-4 rounded border-line text-primary focus:ring-primary/30"
                  />
                  {t('auth.rememberMe')}
                </label>
                <span
                  title={t('auth.comingSoon')}
                  className="cursor-not-allowed text-sm font-medium text-ink-soft/60"
                >
                  {t('auth.forgotPassword')}
                </span>
              </div>

              {login.isError && (
                <div className="rounded-btn bg-accent-pink/10 px-4 py-3 text-sm text-accent-pink">
                  {login.error?.message || t('auth.invalidCredentials')}
                </div>
              )}

              <Button type="submit" disabled={login.isPending} className="w-full justify-center py-3">
                {login.isPending ? t('auth.submitting') : t('auth.submit')}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
