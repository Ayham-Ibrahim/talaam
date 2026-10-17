import { Check, GraduationCap } from 'lucide-react';
import { ApiErrorList } from '@/components/ui';
import { useT } from '@/hooks/useT';
import { useCurrencyStore } from '@/store';
import { convertPrice } from '@/lib/currency';

const CURRENCY_SYMBOL = { USD: '$', EUR: '€', GBP: '£', AED: 'د.إ' };

/** نفس تدرّجات بطاقات باقات المعلم (PackagesSection.jsx) بالضبط — دورية حسب ترتيب البطاقة لا حسب الفئة. */
const CARD_GRADIENTS = [
  'linear-gradient(135deg, #5B8DEF 0%, #3D63C9 100%)',
  'linear-gradient(135deg, #8B7BEA 0%, #4E3FB0 100%)',
  'linear-gradient(135deg, #EA7BA0 0%, #F0A868 100%)',
  'linear-gradient(135deg, #34C3B8 0%, #2E8FC0 100%)',
  'linear-gradient(135deg, #E0607A 0%, #B33B63 100%)',
  'linear-gradient(135deg, #6DC0E0 0%, #4A6FE0 100%)',
];

function priceLabel(amount, code) {
  const value = convertPrice(amount ?? 0, code).toLocaleString('en-US');
  return `${value} ${CURRENCY_SYMBOL[code] ?? code}`;
}

function SupportPackageCard({ pkg, index, onPurchase, isPurchasing }) {
  const t = useT();
  const currency = useCurrencyStore((s) => s.currency);
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];

  return (
    <div
      style={{ background: gradient }}
      className="relative flex min-h-[290px] flex-col rounded-2xl p-5 text-start shadow-[0_6px_20px_rgba(0,0,0,0.15)] transition"
    >
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/30 backdrop-blur-sm">
        <GraduationCap size={13} />
        {t(`academicSupporter.supportPackages.tier${pkg.tier === 'premium' ? 'Premium' : 'Basic'}`)}
      </span>

      <div className="mt-4">
        {pkg.subject?.name && <h4 className="text-lg font-bold leading-snug text-white">{pkg.subject.name}</h4>}
      </div>

      {pkg.description && <p className="mt-3 text-sm font-medium leading-relaxed text-white/90">{pkg.description}</p>}

      <div className="mt-auto flex flex-col gap-3 pt-4">
        <span dir="ltr" className="text-2xl font-bold leading-none text-white">
          {priceLabel(pkg.price, currency)}
        </span>

        {onPurchase && (
          <button
            type="button"
            disabled={isPurchasing}
            onClick={() => onPurchase(pkg.id)}
            className="flex items-center justify-center gap-1.5 rounded-2xl bg-white py-3 text-sm font-semibold text-[#1E1E1E] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isPurchasing ? (
              t('academicSupporter.supportPackages.subscribing')
            ) : (
              <>
                <Check size={15} strokeWidth={3} />
                {t('academicSupporter.supportPackages.subscribeNow')}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * باقات دعم طلابي بسعر ثابت لكل مادة، بلا جلسات/جدول — نفس تصميم بطاقات باقات
 * المعلم (PackagesSection.jsx) حرفياً: بطاقة تدرّج ملوّن كامل، شارة نوع الباقة،
 * السعر مثبّت بالأسفل، زر أبيض صلب. الدفع مباشر عبر Stripe (100% للمنصة).
 */
export function SupportPackagesSection({ supportPackages = [], onPurchase, purchasingId = null, purchaseError = null }) {
  const t = useT();

  if (!supportPackages.length) return null;

  return (
    <div className="mt-6">
      <h3 className="mb-1 text-start font-bold text-ink">{t('academicSupporter.supportPackages.title')}</h3>
      <p className="mb-4 text-start text-sm text-ink-soft">{t('academicSupporter.supportPackages.hint')}</p>

      {purchaseError && <ApiErrorList error={purchaseError} labelFor={() => null} className="mb-4" />}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {supportPackages.map((sp, i) => (
          <SupportPackageCard
            key={sp.id}
            pkg={sp}
            index={i}
            onPurchase={onPurchase}
            isPurchasing={purchasingId === sp.id}
          />
        ))}
      </div>
    </div>
  );
}
