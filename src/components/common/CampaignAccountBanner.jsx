import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { ApiErrorList } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useConvertAccount } from '@/hooks/useCampaign';
import { useT } from '@/hooks/useT';

/**
 * تنبيه دائم (بلا إغلاق) لحساب الحملة قبل تحويله، في كل صفحات لوحته (DashboardLayout): يحجز
 * عروض الحملة فقط حتى يكمل ملفه. الزر يحوّل الحساب لطبيعي ثم يفتح إكمال البيانات الدراسية،
 * ويختفي التنبيه تلقائياً بعد التحويل (account_type ≠ campaign).
 */
export function CampaignAccountBanner() {
  const t = useT();
  const navigate = useNavigate();
  const { user } = useAuth();
  const convert = useConvertAccount();

  if (user?.role !== 'student' || user?.account_type !== 'campaign') {
    return null;
  }

  return (
    <div
      dir="rtl"
      className="relative mb-6 overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-l from-amber-50 via-orange-50 to-white p-4 shadow-card sm:p-5"
    >
      {/* شريط جانبي بلون العروض */}
      <span className="absolute inset-y-0 right-0 w-1.5 bg-gradient-to-b from-[#F59E0B] to-[#B45309]" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F59E0B] to-[#B45309] text-white shadow-[0_4px_12px_rgba(180,83,9,0.35)]">
            <Sparkles size={20} />
          </span>
          <div className="text-start">
            <h3 className="text-base font-bold text-[#92400E]">{t('campaign.bannerTitle')}</h3>
            <p className="mt-1 text-sm leading-relaxed text-[#78350F]/80">{t('campaign.bannerText')}</p>
          </div>
        </div>

        <button
          type="button"
          disabled={convert.isPending}
          onClick={() => convert.mutate(undefined, { onSuccess: () => navigate('/complete-profile') })}
          className="group flex shrink-0 items-center justify-center gap-2 self-stretch rounded-xl bg-gradient-to-l from-[#F59E0B] to-[#B45309] px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_12px_rgba(180,83,9,0.3)] transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 sm:self-center"
        >
          {convert.isPending ? t('campaign.converting') : t('campaign.convertCta')}
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
        </button>
      </div>

      {convert.isError && (
        <div className="mt-3">
          <ApiErrorList error={convert.error} labelFor={() => null} />
        </div>
      )}
    </div>
  );
}
