import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle2, Clock, Gift, Layers, Sparkles, UserCheck } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { ApiErrorList, Avatar, Button, EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { Drawer } from '@/components/ui/Drawer';
import { BookingWidget } from '@/components/teacher/BookingWidget';
import { useAuth } from '@/hooks/useAuth';
import { useCampaignPackages, useConvertAccount } from '@/hooks/useCampaign';
import { useT } from '@/hooks/useT';
import { useCurrencyStore } from '@/store';
import { formatPrice } from '@/lib/currency';
import { mapStudentPackage } from '@/services';

/**
 * عروض الحملة (/campaign-offers): باقات مخفضة لمعلمين محددين، تظهر لحسابات الحملة فقط
 * ويحق للحساب حجز واحدة منها. الحجز من هنا مباشرة (نفس BookingWidget) — طلب بانتظار
 * موافقة المعلم ثم الدفع من لوحة الطالب. وتحويل حساب الحملة لحساب طبيعي من هنا أيضاً.
 */
export function CampaignOffersPage() {
  const t = useT();
  const { user } = useAuth();
  const currency = useCurrencyStore((s) => s.currency);
  const isFromCampaign = !!user?.is_from_campaign;
  const { data, isLoading, isError, refetch } = useCampaignPackages({ enabled: isFromCampaign });
  const convert = useConvertAccount();
  const [selected, setSelected] = useState(null);

  const packages = (data?.packages ?? []).map((raw) => ({ ...mapStudentPackage(raw), teacher: raw.teacher }));
  const rightUsed = !!data?.right_used;
  const isUnconverted = user?.account_type === 'campaign';

  return (
    <PageContainer>
      <div className="container-app py-10">
        <div className="text-start">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
            <Sparkles size={13} />
            {t('campaign.offerRibbon')}
          </span>
          <h1 className="mt-3 text-2xl font-bold text-ink">{t('campaign.offersTitle')}</h1>
          <p className="mt-1 text-sm text-ink-soft">{t('campaign.offersSubtitle')}</p>
        </div>

        {!isFromCampaign ? (
          <div className="mt-8">
            <EmptyState title={t('campaign.notCampaignAccount')} />
          </div>
        ) : (
          <>
            {rightUsed && (
              <div className="mt-6 flex items-center gap-2 rounded-2xl border border-success/30 bg-success-light px-4 py-3 text-sm font-semibold text-success">
                <CheckCircle2 size={16} />
                <span>
                  {t('campaign.rightUsed')}{' '}
                  <Link to="/dashboard/student/packages" className="underline">
                    {t('campaign.myBookings')}
                  </Link>
                </span>
              </div>
            )}

            {isError ? (
              <div className="mt-8">
                <ErrorState onRetry={refetch} />
              </div>
            ) : isLoading ? (
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-2xl" />
                ))}
              </div>
            ) : packages.length === 0 ? (
              <div className="mt-8">
                <EmptyState title={t('campaign.noOffers')} />
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="flex flex-col gap-4 rounded-2xl p-5 text-start text-white shadow-[0_6px_20px_rgba(0,0,0,0.15)]"
                    style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)' }}
                  >
                    <Link to={`/teacher/${pkg.teacher?.id}`} className="flex items-center gap-3 hover:opacity-90">
                      <Avatar src={pkg.teacher?.avatar_path} name={pkg.teacher?.name} size="md" />
                      <span className="font-bold">{pkg.teacher?.name}</span>
                    </Link>
                    <div>
                      <h3 className="text-lg font-bold leading-snug">{pkg.title}</h3>
                      {pkg.subject && <p className="text-sm text-white/80">{pkg.subject}</p>}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-white/90">
                      <span className="inline-flex items-center gap-1.5">
                        <BookOpen size={15} />
                        {t('teacher.packageBadge.individual')}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Layers size={15} />
                        {pkg.sessionsCount} {t('teacher.sessionsCountLabel')}
                      </span>
                      {pkg.durationPerSession != null && (
                        <span className="inline-flex items-center gap-1.5">
                          <Clock size={15} />
                          {pkg.durationPerSession} {t('teacher.sessionMinutes')}
                        </span>
                      )}
                    </div>
                    {pkg.description && <p className="line-clamp-3 text-sm text-white/85">{pkg.description}</p>}
                    <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                      <span dir="ltr" className="text-2xl font-bold">
                        {formatPrice(pkg.price, currency)}
                      </span>
                      <button
                        type="button"
                        disabled={rightUsed}
                        onClick={() => setSelected(pkg)}
                        className="rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-[#1E1E1E] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {t('campaign.bookOffer')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isUnconverted && (
              <div className="mt-10 flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-5 text-start">
                <div className="flex items-center gap-2">
                  <UserCheck size={18} className="text-primary" />
                  <h2 className="font-bold text-ink">{t('campaign.convertTitle')}</h2>
                </div>
                <p className="text-sm text-ink-soft">{t('campaign.convertDescription')}</p>
                {convert.isError && <ApiErrorList error={convert.error} labelFor={() => null} />}
                <Button className="self-start" disabled={convert.isPending} onClick={() => convert.mutate()}>
                  {convert.isPending ? t('campaign.converting') : t('campaign.convertCta')}
                </Button>
              </div>
            )}

            {!isUnconverted && convert.isSuccess && (
              <div className="mt-10 flex flex-col gap-2 rounded-2xl border border-success/30 bg-success-light p-5 text-start text-sm text-success">
                <span className="flex items-center gap-2 font-bold">
                  <Gift size={16} />
                  {t('campaign.convertedTitle')}
                </span>
                <span>{t('campaign.convertedDescription')}</span>
                <Link to="/complete-profile" className="font-bold underline">
                  {t('campaign.completeProfile')}
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      <Drawer open={Boolean(selected)} onClose={() => setSelected(null)} title={t('booking.title')}>
        <BookingWidget selectedPackage={selected} bare />
      </Drawer>
    </PageContainer>
  );
}
