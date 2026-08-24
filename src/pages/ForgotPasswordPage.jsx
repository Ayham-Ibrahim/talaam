import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail, MailCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from '@/components/layout/Logo';
import { ApiErrorList, Button } from '@/components/ui';
import { useForgotPassword } from '@/hooks/useAuth';
import { useT } from '@/hooks/useT';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * لا نُظهر أي فرق بين "الحساب موجود" و"غير موجود" — الباك اند يعيد نفس
 * الرسالة العامة دوماً (راجع AuthController::forgotPassword)، والواجهة هنا
 * تعرض نفس شاشة النجاح فور نجاح الطلب بصرف النظر عن ذلك تماماً.
 */
export function ForgotPasswordPage() {
  const t = useT();
  const forgotPassword = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { email: '' } });

  const onSubmit = (values) => {
    forgotPassword.mutate(values.email);
  };

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
          {forgotPassword.isSuccess ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-light text-success">
                <MailCheck size={26} />
              </div>
              <h2 className="text-lg font-bold text-ink">{t('auth.forgotSuccessTitle')}</h2>
              <p className="text-sm text-ink-soft">{forgotPassword.data?.message}</p>
              <Link to="/login" className="mt-2 text-sm font-medium text-primary hover:opacity-70">
                {t('auth.backToLogin')}
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-ink">{t('auth.forgotTitle')}</h2>
              <p className="mt-2 text-sm text-ink-soft">{t('auth.forgotSubtitle')}</p>

              <form className="mt-6 flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
                <label className="flex flex-col gap-1.5 text-start">
                  <span className="text-sm font-semibold text-ink">{t('auth.emailLabel')}</span>
                  <div className="relative">
                    <Mail size={17} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
                    <input
                      type="email"
                      dir="ltr"
                      maxLength={255}
                      placeholder={t('auth.emailPlaceholder')}
                      className={`w-full rounded-btn border bg-surface py-3 pl-3.5 pr-10 text-left text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 ${
                        errors.email ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
                      }`}
                      {...register('email', {
                        required: t('auth.emailRequired'),
                        pattern: { value: EMAIL_PATTERN, message: t('auth.emailInvalid') },
                        maxLength: { value: 255, message: t('auth.emailTooLong') },
                      })}
                    />
                  </div>
                  {errors.email && <span className="text-xs text-accent-pink">{errors.email.message}</span>}
                </label>

                {forgotPassword.isError && <ApiErrorList error={forgotPassword.error} labelFor={() => null} />}

                <Button type="submit" disabled={forgotPassword.isPending} className="w-full justify-center py-3">
                  {forgotPassword.isPending ? t('auth.forgotSubmitting') : t('auth.forgotSubmit')}
                </Button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
