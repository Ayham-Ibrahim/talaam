import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Eye, EyeOff, Gift, Lock, Mail, Phone, User, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from '@/components/layout/Logo';
import { ApiErrorList, Button, ErrorState, Skeleton } from '@/components/ui';
import { PolicyAcceptanceCheckbox } from '@/components/auth/PolicyAcceptanceCheckbox';
import { NAME_VALIDATION_PATTERN, EMAIL_PATTERN, PHONE_PATTERN } from '@/lib/accountFormValidation';
import { useAuth } from '@/hooks/useAuth';
import { useCampaign, useRegisterCampaign } from '@/hooks/useCampaign';
import { useT } from '@/hooks/useT';

/** يوازي حد كلمة المرور في الباك اند — نفس RegisterPage */
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const FIELD_LABELS = {
  name: 'الاسم',
  email: 'البريد الإلكتروني',
  phone: 'رقم الهاتف',
  password: 'كلمة المرور',
  accept_policy: 'الموافقة على السياسة',
  campaign: 'الحملة',
};

function inputClass(hasError) {
  return `w-full rounded-btn border bg-surface py-3 pr-10 pl-3.5 text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 ${
    hasError ? 'border-accent-pink focus:ring-accent-pink/30' : 'border-line focus:border-primary focus:ring-primary/20'
  }`;
}

/**
 * صفحة هبوط الحملة الإعلانية (/campaign/:slug): تسجيل بالاسم والبريد والهاتف وكلمة المرور فقط.
 * الحساب الناتج "حساب حملة" — يرى عروض الحملة المخفضة ويحجز واحداً منها، ويحوّل حسابه لاحقاً.
 */
export function CampaignRegisterPage() {
  const t = useT();
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: campaign, isLoading, isError } = useCampaign(slug);
  const registerCampaign = useRegisterCampaign(slug);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { name: '', email: '', phone: '', password: '', password_confirmation: '', accept_policy: false } });
  const password = watch('password');

  if (isAuthenticated && !registerCampaign.isSuccess) return <Navigate to="/campaign-offers" replace />;

  const onSubmit = (values) => {
    registerCampaign.mutate(
      {
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        password: values.password,
        password_confirmation: values.password_confirmation,
        accept_policy: values.accept_policy,
      },
      { onSuccess: () => navigate('/campaign-offers', { replace: true }) },
    );
  };

  return (
    <div className="flex min-h-screen bg-canvas">
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden p-12 lg:flex" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)' }}>
        <div className="pointer-events-none absolute -top-10 right-1/4 h-72 w-3/5 rounded-full bg-white/20 blur-[120px]" />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-md text-center text-white"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
            <Gift size={40} />
          </div>
          <h1 className="mt-8 text-3xl font-bold">{campaign?.name ?? t('campaign.heroTitle')}</h1>
          <p className="mt-4 text-base leading-relaxed text-white/90">{t('campaign.heroSubtitle')}</p>
        </motion.div>
      </div>

      <div className="flex w-full flex-1 flex-col justify-center px-6 py-12 sm:px-10 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 flex items-center justify-between">
            <Link to="/">
              <Logo />
            </Link>
            <Link to="/" className="flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-primary">
              {t('auth.backHome')}
              <ArrowRight size={15} />
            </Link>
          </div>

          {isLoading ? (
            <Skeleton className="h-96 rounded-card" />
          ) : isError || !campaign ? (
            <ErrorState message={t('campaign.notFound')} />
          ) : !campaign.is_open ? (
            <div className="rounded-2xl bg-white p-6 text-center shadow-card">
              <h2 className="text-lg font-bold text-ink">{t('campaign.closedTitle')}</h2>
              <p className="mt-2 text-sm text-ink-soft">{t('campaign.closedSubtitle')}</p>
              <Link to="/register" className="mt-4 inline-block text-sm font-medium text-primary hover:opacity-70">
                {t('campaign.regularRegister')}
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-ink">{t('campaign.registerTitle')}</h2>
              <p className="mt-2 text-sm text-ink-soft">{t('campaign.registerSubtitle')}</p>

              <form className="mt-6 flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
                <label className="flex flex-col gap-1.5 text-start">
                  <span className="text-sm font-semibold text-ink">{t('auth.nameLabel')}</span>
                  <div className="relative">
                    <User size={17} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
                    <input
                      type="text"
                      maxLength={150}
                      placeholder={t('auth.namePlaceholder')}
                      className={inputClass(errors.name)}
                      {...register('name', {
                        required: t('auth.nameRequired'),
                        pattern: { value: NAME_VALIDATION_PATTERN, message: t('auth.nameInvalid') },
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
                      className={`${inputClass(errors.email)} text-left`}
                      {...register('email', {
                        required: t('auth.emailRequired'),
                        pattern: { value: EMAIL_PATTERN, message: t('auth.emailInvalid') },
                      })}
                    />
                  </div>
                  {errors.email && <span className="text-xs text-accent-pink">{errors.email.message}</span>}
                </label>

                <label className="flex flex-col gap-1.5 text-start">
                  <span className="text-sm font-semibold text-ink">{t('auth.phoneLabel')}</span>
                  <div className="relative">
                    <Phone size={17} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
                    <input
                      type="tel"
                      dir="ltr"
                      maxLength={25}
                      placeholder={t('auth.phonePlaceholder')}
                      className={`${inputClass(errors.phone)} text-left`}
                      {...register('phone', {
                        required: t('campaign.phoneRequired'),
                        pattern: { value: PHONE_PATTERN, message: t('auth.phoneInvalid') },
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
                      className={`${inputClass(errors.password)} pl-10 text-left`}
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
                      type={showPassword ? 'text' : 'password'}
                      dir="ltr"
                      maxLength={255}
                      className={`${inputClass(errors.password_confirmation)} text-left`}
                      {...register('password_confirmation', {
                        required: t('auth.confirmPasswordRequired'),
                        validate: (value) => value === password || t('auth.passwordMismatch'),
                      })}
                    />
                  </div>
                  {errors.password_confirmation && (
                    <span className="text-xs text-accent-pink">{errors.password_confirmation.message}</span>
                  )}
                </label>

                <PolicyAcceptanceCheckbox
                  policySlug="student-policy"
                  registration={register('accept_policy', { required: t('auth.policyAgreeRequired') })}
                  error={errors.accept_policy}
                />

                {registerCampaign.isError && (
                  <ApiErrorList error={registerCampaign.error} labelFor={(path) => FIELD_LABELS[path] ?? path} />
                )}

                <Button type="submit" disabled={registerCampaign.isPending} className="w-full justify-center py-3">
                  {registerCampaign.isPending ? t('auth.registerSubmitting') : t('campaign.registerSubmit')}
                </Button>

                <p className="text-center text-sm text-ink-soft">
                  {t('auth.alreadyHaveAccount')}{' '}
                  <Link to="/login" className="font-medium text-primary hover:opacity-70">
                    {t('auth.goToLogin')}
                  </Link>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
