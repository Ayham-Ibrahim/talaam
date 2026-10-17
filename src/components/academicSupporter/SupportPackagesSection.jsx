import { GraduationCap } from 'lucide-react';
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

function SupportPackageCard({ pkg, index, onSelect }) {
  const t = useT();
  const currency = useCurrencyStore((s) => s.currency);
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
  const subjects = pkg.subjects ?? [];

  return (
    <button
      type="button"
      onClick={() => onSelect?.(pkg)}
      style={{ background: gradient }}
      className="relative flex min-h-[290px] flex-col rounded-2xl p-5 text-start shadow-[0_6px_20px_rgba(0,0,0,0.15)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(0,0,0,0.2)]"
    >
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/30 backdrop-blur-sm">
        <GraduationCap size={13} />
        {t(`academicSupporter.supportPackages.tier${pkg.tier === 'premium' ? 'Premium' : 'Basic'}`)}
      </span>

      <h4 className="mt-4 text-lg font-bold leading-snug text-white">{pkg.title}</h4>

      {subjects.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {subjects.slice(0, 3).map((s) => (
            <span key={s.id} className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-white/85">
              {s.name}
            </span>
          ))}
          {subjects.length > 3 && (
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-white/85">+{subjects.length - 3}</span>
          )}
        </div>
      )}

      <p className="mt-2 text-xs font-semibold text-white/75">
        {subjects.length} {t('academicSupporter.supportPackages.subjectsUnit')}
      </p>

      {pkg.description && <p className="mt-3 line-clamp-2 text-sm font-medium leading-relaxed text-white/90">{pkg.description}</p>}

      <div className="mt-auto flex items-center justify-between pt-4">
        <span dir="ltr" className="text-2xl font-bold leading-none text-white">
          {priceLabel(pkg.price, currency)}
        </span>
        <span className="rounded-xl bg-white px-4 py-2 text-xs font-semibold text-[#1E1E1E]">
          {t('academicSupporter.supportPackages.viewDetails')}
        </span>
      </div>
    </button>
  );
}

/**
 * باقات دعم طلابي — نفس تصميم بطاقات باقات المعلم (PackagesSection.jsx) حرفياً:
 * بطاقة تدرّج ملوّن كامل، شارة نوع الباقة، السعر مثبّت بالأسفل. الضغط على
 * البطاقة يفتح درج التفاصيل (SupportPackageDetailsDrawer) بدل دفع مباشر من هنا.
 */
export function SupportPackagesSection({ supportPackages = [], onSelect }) {
  const t = useT();

  if (!supportPackages.length) return null;

  return (
    <div className="mt-6">
      <h3 className="mb-1 text-start font-bold text-ink">{t('academicSupporter.supportPackages.title')}</h3>
      <p className="mb-4 text-start text-sm text-ink-soft">{t('academicSupporter.supportPackages.hint')}</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {supportPackages.map((sp, i) => (
          <SupportPackageCard key={sp.id} pkg={sp} index={i} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
