import { GraduationCap } from 'lucide-react';
import { useT } from '@/hooks/useT';
import { useCurrencyStore } from '@/store';
import { convertPrice } from '@/lib/currency';

const CURRENCY_SYMBOL = { USD: '$', EUR: '€', GBP: '£', AED: 'د.إ' };

const TIER_GRADIENTS = {
  basic: 'linear-gradient(135deg, #5B8DEF 0%, #3D63C9 100%)',
  premium: 'linear-gradient(135deg, #8B7BEA 0%, #4E3FB0 100%)',
};

function priceLabel(amount, code) {
  const value = convertPrice(amount ?? 0, code).toLocaleString('en-US');
  return `${value} ${CURRENCY_SYMBOL[code] ?? code}`;
}

/**
 * الداعم الأكاديمي فقط — باقات دعم طلابي بسعر ثابت لكل مادة، بلا جلسات/جدول.
 * عرض فقط في هذه المرحلة — لا زر اشتراك/دفع بعد (يُضاف لاحقاً مع تكامل الدفع الفعلي).
 */
export function SupportPackagesSection({ supportPackages = [] }) {
  const t = useT();
  const currency = useCurrencyStore((s) => s.currency);

  if (!supportPackages.length) return null;

  return (
    <div className="mt-6 rounded-2xl bg-white p-5 shadow-card">
      <h3 className="mb-1 text-start font-bold text-ink">{t('teacher.supportPackages.title')}</h3>
      <p className="mb-4 text-start text-sm text-ink-soft">{t('teacher.supportPackages.hint')}</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {supportPackages.map((sp) => (
          <div key={sp.id} className="overflow-hidden rounded-2xl border border-line shadow-sm">
            <div className="p-4 text-white" style={{ background: TIER_GRADIENTS[sp.tier] ?? TIER_GRADIENTS.basic }}>
              <div className="flex items-center gap-2 text-sm font-semibold opacity-90">
                <GraduationCap size={16} />
                {t(`teacher.supportPackages.tier${sp.tier === 'premium' ? 'Premium' : 'Basic'}`)}
              </div>
              {sp.subject && <div className="mt-1 text-lg font-bold">{sp.subject}</div>}
            </div>
            <div className="flex flex-col gap-3 p-4 text-start">
              {sp.description && <p className="text-sm text-ink-soft">{sp.description}</p>}
              <div className="font-bold text-price">{priceLabel(sp.price, currency)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
