import { useState } from 'react';
import { GraduationCap } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { ApiErrorList } from '@/components/ui';
import { useCurrencyStore } from '@/store';
import { convertPrice } from '@/lib/currency';
import { usePurchaseSupportPackage } from '@/hooks/useAcademicSupporterBrowse';
import { useT } from '@/hooks/useT';

const CURRENCY_SYMBOL = { USD: '$', EUR: '€', GBP: '£', AED: 'د.إ' };

function priceLabel(amount, code) {
  const value = convertPrice(amount ?? 0, code).toLocaleString('en-US');
  return `${value} ${CURRENCY_SYMBOL[code] ?? code}`;
}

/**
 * تفاصيل باقة الدعم + حقل كوبون خصم اختياري قبل الدفع — يوازي PackageDetailsDrawer
 * (teacher/PackagesSection.jsx) + نمط كوبون BookingWidget.jsx تماماً (بلا خطوة
 * "تطبيق"/معاينة منفصلة، الكود يُرسَل خاماً مع طلب الشراء، الباك اند يتحقق منه).
 */
export function SupportPackageDetailsDrawer({ supportPackage, onClose }) {
  const t = useT();
  const currency = useCurrencyStore((s) => s.currency);
  const [couponCode, setCouponCode] = useState('');
  const purchase = usePurchaseSupportPackage();

  const handlePay = () => {
    if (!supportPackage) return;
    purchase.mutate(
      { supportPackageId: supportPackage.id, couponCode: couponCode.trim() || undefined },
      {
        onSuccess: (data) => {
          if (data?.checkout_url) window.location.href = data.checkout_url;
        },
      },
    );
  };

  return (
    <Drawer open={Boolean(supportPackage)} onClose={onClose} title={supportPackage?.title}>
      {supportPackage && (
        <div className="flex flex-col gap-5 text-start">
          <span className="w-fit rounded-pill bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
            {t(`academicSupporter.supportPackages.tier${supportPackage.tier === 'premium' ? 'Premium' : 'Basic'}`)}
          </span>

          {supportPackage.subjects?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {supportPackage.subjects.map((s) => (
                <span key={s.id} className="flex items-center gap-1 rounded-pill bg-line/40 px-3 py-1 text-xs font-medium text-ink-soft">
                  <GraduationCap size={13} />
                  {s.name}
                </span>
              ))}
            </div>
          )}

          {supportPackage.description && <p className="text-sm leading-relaxed text-ink-soft">{supportPackage.description}</p>}

          <div className="rounded-2xl bg-primary-light p-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-primary" dir="ltr">
                {priceLabel(supportPackage.price, currency)}
              </span>
              <span className="text-sm text-ink-soft">{t('academicSupporter.supportPackages.priceLabel')}</span>
            </div>
          </div>

          <label className="flex flex-col gap-1.5 text-start">
            <span className="text-sm font-bold text-ink">{t('booking.couponLabel')}</span>
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder={t('booking.couponPlaceholder')}
              dir="ltr"
              className="w-full rounded-xl border border-line bg-surface p-3 text-sm text-ink placeholder:text-ink-soft/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>

          {purchase.isError && <ApiErrorList error={purchase.error} labelFor={() => null} />}

          <button
            type="button"
            disabled={purchase.isPending}
            onClick={handlePay}
            className="rounded-2xl bg-primary py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {purchase.isPending ? t('academicSupporter.supportPackages.subscribing') : t('academicSupporter.supportPackages.payNow')}
          </button>
        </div>
      )}
    </Drawer>
  );
}
