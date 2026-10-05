import { useState } from 'react';
import { X, Plus, Trash2, Copy, Check } from 'lucide-react';
import { EmptyState, ErrorState, Skeleton, ApiErrorList } from '@/components/ui';
import { usePackageCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon } from '@/hooks/useCoupons';
import { formatDate } from '@/lib/formatters';
import { useT } from '@/hooks/useT';

function CreateCouponForm({ packageId, onDone }) {
  const t = useT();
  const createCoupon = useCreateCoupon(packageId);
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [maxRedemptions, setMaxRedemptions] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  const isValid = discountPercent !== '' && Number(discountPercent) > 0 && Number(discountPercent) <= 100;

  const handleSubmit = () => {
    if (!isValid) return;
    createCoupon.mutate(
      {
        code: code.trim() || undefined,
        discountPercent: Number(discountPercent),
        maxRedemptions: maxRedemptions ? Number(maxRedemptions) : undefined,
        expiresAt: expiresAt || undefined,
      },
      {
        onSuccess: () => {
          setCode('');
          setDiscountPercent('');
          setMaxRedemptions('');
          setExpiresAt('');
          onDone?.();
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line bg-canvas p-4">
      {createCoupon.isError && <ApiErrorList error={createCoupon.error} labelFor={() => null} />}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-start">
          <span className="text-xs font-bold text-ink">{t('dashboard.coupons.codeLabel')}</span>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder={t('dashboard.coupons.codeAutoHint')}
            dir="ltr"
            className="rounded-btn border border-line bg-surface p-2.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-start">
          <span className="text-xs font-bold text-ink">{t('dashboard.coupons.discountLabel')}</span>
          <input
            type="number"
            min="0.01"
            max="100"
            step="0.01"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(e.target.value)}
            dir="ltr"
            className="rounded-btn border border-line bg-surface p-2.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-start">
          <span className="text-xs font-bold text-ink">{t('dashboard.coupons.maxRedemptionsLabel')}</span>
          <input
            type="number"
            min="1"
            value={maxRedemptions}
            onChange={(e) => setMaxRedemptions(e.target.value)}
            placeholder={t('dashboard.coupons.unlimitedHint')}
            dir="ltr"
            className="rounded-btn border border-line bg-surface p-2.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-start">
          <span className="text-xs font-bold text-ink">{t('dashboard.coupons.expiresAtLabel')}</span>
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="rounded-btn border border-line bg-surface p-2.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>
      </div>
      <button
        type="button"
        disabled={!isValid || createCoupon.isPending}
        onClick={handleSubmit}
        className="self-start rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
      >
        {createCoupon.isPending ? t('dashboard.coupons.creating') : t('dashboard.coupons.create')}
      </button>
    </div>
  );
}

function CopyCodeButton({ code }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // الحافظة غير متاحة (سياق غير آمن مثلاً) — لا داعي لإزعاج المعلم، الكود ظاهر أصلاً للنسخ يدوياً
    }
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={t('dashboard.coupons.copyCode')}
      className="text-ink-soft hover:text-primary"
    >
      {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
    </button>
  );
}

function CouponRow({ packageId, coupon }) {
  const t = useT();
  const updateCoupon = useUpdateCoupon(packageId);
  const deleteCoupon = useDeleteCoupon(packageId);

  return (
    <tr className="border-b border-line last:border-0">
      <td className="px-3 py-3">
        <div className="flex items-center gap-1.5" dir="ltr">
          <span className="font-mono text-sm font-bold text-ink">{coupon.code}</span>
          <CopyCodeButton code={coupon.code} />
        </div>
      </td>
      <td className="px-3 py-3 text-center text-sm text-ink">{coupon.discountPercent}%</td>
      <td className="px-3 py-3 text-center text-sm text-ink-soft">
        {coupon.redeemedCount}
        {coupon.maxRedemptions ? ` / ${coupon.maxRedemptions}` : ''}
      </td>
      <td className="px-3 py-3 text-center text-sm text-ink-soft">
        {coupon.expiresAt ? formatDate(coupon.expiresAt) : t('dashboard.coupons.noExpiry')}
      </td>
      <td className="px-3 py-3 text-center">
        <button
          type="button"
          disabled={updateCoupon.isPending}
          onClick={() => updateCoupon.mutate({ id: coupon.id, isActive: !coupon.isActive })}
          className={`rounded-pill px-3 py-1 text-xs font-bold ${
            coupon.isActive ? 'bg-success-light text-success' : 'bg-line/50 text-ink-soft'
          }`}
        >
          {coupon.isActive ? t('dashboard.coupons.active') : t('dashboard.coupons.inactive')}
        </button>
      </td>
      <td className="px-3 py-3 text-center">
        <button
          type="button"
          disabled={deleteCoupon.isPending}
          onClick={() => {
            if (window.confirm(t('dashboard.coupons.confirmDelete'))) deleteCoupon.mutate(coupon.id);
          }}
          className="text-[#FF383C] hover:opacity-70 disabled:opacity-40"
          aria-label={t('dashboard.coupons.delete')}
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
}

export function PackageCouponsModal({ packageId, packageTitle, onClose }) {
  const t = useT();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { data: coupons, isLoading, isError, refetch } = usePackageCoupons(packageId);

  return (
    <div className="relative rounded-2xl bg-white p-6 shadow-card sm:p-8">
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label={t('dashboard.teacherPackages.close')}
          className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-line/40 hover:text-ink"
        >
          <X size={18} />
        </button>
      )}

      <div className="text-start">
        <h2 className="text-lg font-bold text-ink">{t('dashboard.coupons.title')}</h2>
        {packageTitle && <p className="mt-1 text-sm text-ink-soft">{packageTitle}</p>}
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {showCreateForm ? (
          <CreateCouponForm packageId={packageId} onDone={() => setShowCreateForm(false)} />
        ) : (
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-1.5 self-start rounded-xl border border-primary px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/5"
          >
            <Plus size={16} />
            {t('dashboard.coupons.create')}
          </button>
        )}

        {isError ? (
          <ErrorState onRetry={refetch} />
        ) : isLoading ? (
          <Skeleton className="h-32 rounded-2xl" />
        ) : !coupons || coupons.length === 0 ? (
          <EmptyState title={t('dashboard.coupons.empty')} />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-line bg-canvas">
                  <th className="px-3 py-3 text-start font-bold text-ink">{t('dashboard.coupons.colCode')}</th>
                  <th className="px-3 py-3 text-center font-bold text-ink">{t('dashboard.coupons.colDiscount')}</th>
                  <th className="px-3 py-3 text-center font-bold text-ink">{t('dashboard.coupons.colUsage')}</th>
                  <th className="px-3 py-3 text-center font-bold text-ink">{t('dashboard.coupons.colExpires')}</th>
                  <th className="px-3 py-3 text-center font-bold text-ink">{t('dashboard.coupons.colStatus')}</th>
                  <th className="px-3 py-3 text-center font-bold text-ink">{t('dashboard.coupons.colActions')}</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <CouponRow key={coupon.id} packageId={packageId} coupon={coupon} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
