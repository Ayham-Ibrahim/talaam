import { useState } from 'react';
import { X, Plus, Trash2, Copy, Check, Pencil } from 'lucide-react';
import { EmptyState, ErrorState, Skeleton, ApiErrorList } from '@/components/ui';
import { usePackageCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon } from '@/hooks/useCoupons';
import { formatDate } from '@/lib/formatters';
import { useT } from '@/hooks/useT';

/** نسبة أو مبلغ ثابت — مشترك بين فورم الإنشاء ووضع التعديل، كي لا يتكرر نفس الحقلين مرتين */
function DiscountFields({ discountType, setDiscountType, discountValue, setDiscountValue }) {
  const t = useT();
  return (
    <>
      <label className="flex flex-col gap-1.5 text-start">
        <span className="text-xs font-bold text-ink">{t('dashboard.coupons.discountTypeLabel')}</span>
        <div className="flex gap-1.5">
          {['percent', 'fixed'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setDiscountType(type)}
              className={`flex-1 rounded-btn border px-2.5 py-2.5 text-sm font-medium ${
                discountType === type ? 'border-primary bg-primary/5 text-primary' : 'border-line text-ink-soft'
              }`}
            >
              {t(`dashboard.coupons.discountType.${type}`)}
            </button>
          ))}
        </div>
      </label>
      <label className="flex flex-col gap-1.5 text-start">
        <span className="text-xs font-bold text-ink">
          {discountType === 'percent' ? t('dashboard.coupons.discountValuePercentLabel') : t('dashboard.coupons.discountValueFixedLabel')}
        </span>
        <input
          type="number"
          min="0.01"
          max={discountType === 'percent' ? '100' : undefined}
          step="0.01"
          value={discountValue}
          onChange={(e) => setDiscountValue(e.target.value)}
          dir="ltr"
          className="rounded-btn border border-line bg-surface p-2.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </label>
    </>
  );
}

function CreateCouponForm({ packageId, onDone }) {
  const t = useT();
  const createCoupon = useCreateCoupon(packageId);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percent');
  const [discountValue, setDiscountValue] = useState('');
  const [maxRedemptions, setMaxRedemptions] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  const isValid =
    discountValue !== '' && Number(discountValue) > 0 && (discountType !== 'percent' || Number(discountValue) <= 100);

  const handleSubmit = () => {
    if (!isValid) return;
    createCoupon.mutate(
      {
        code: code.trim() || undefined,
        discountType,
        discountValue: Number(discountValue),
        maxRedemptions: maxRedemptions ? Number(maxRedemptions) : undefined,
        expiresAt: expiresAt || undefined,
      },
      {
        onSuccess: () => {
          setCode('');
          setDiscountType('percent');
          setDiscountValue('');
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
        <DiscountFields
          discountType={discountType}
          setDiscountType={setDiscountType}
          discountValue={discountValue}
          setDiscountValue={setDiscountValue}
        />
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

function EditCouponForm({ packageId, coupon, onDone }) {
  const t = useT();
  const updateCoupon = useUpdateCoupon(packageId);
  const [discountType, setDiscountType] = useState(coupon.discountType);
  const [discountValue, setDiscountValue] = useState(String(coupon.discountValue));
  const [maxRedemptions, setMaxRedemptions] = useState(coupon.maxRedemptions ? String(coupon.maxRedemptions) : '');
  const [expiresAt, setExpiresAt] = useState(coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : '');

  const isValid =
    discountValue !== '' && Number(discountValue) > 0 && (discountType !== 'percent' || Number(discountValue) <= 100);

  const handleSave = () => {
    if (!isValid) return;
    updateCoupon.mutate(
      {
        id: coupon.id,
        discountType,
        discountValue: Number(discountValue),
        maxRedemptions: maxRedemptions ? Number(maxRedemptions) : null,
        expiresAt: expiresAt || null,
      },
      { onSuccess: onDone },
    );
  };

  return (
    <tr className="border-b border-line bg-primary/[0.03] last:border-0">
      <td colSpan={6} className="px-3 py-4">
        {updateCoupon.isError && <ApiErrorList error={updateCoupon.error} labelFor={() => null} className="mb-3" />}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <DiscountFields
            discountType={discountType}
            setDiscountType={setDiscountType}
            discountValue={discountValue}
            setDiscountValue={setDiscountValue}
          />
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
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            disabled={!isValid || updateCoupon.isPending}
            onClick={handleSave}
            className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {updateCoupon.isPending ? t('dashboard.coupons.saving') : t('dashboard.coupons.save')}
          </button>
          <button
            type="button"
            onClick={onDone}
            className="rounded-xl border border-line px-5 py-2 text-sm font-medium text-ink-soft hover:bg-line/30"
          >
            {t('dashboard.coupons.cancel')}
          </button>
        </div>
      </td>
    </tr>
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

function discountLabel(coupon) {
  return coupon.discountType === 'percent' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`;
}

function CouponRow({ packageId, coupon }) {
  const t = useT();
  const updateCoupon = useUpdateCoupon(packageId);
  const deleteCoupon = useDeleteCoupon(packageId);
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return <EditCouponForm packageId={packageId} coupon={coupon} onDone={() => setIsEditing(false)} />;
  }

  return (
    <tr className="border-b border-line last:border-0">
      <td className="px-3 py-3">
        <div className="flex items-center gap-1.5" dir="ltr">
          <span className="font-mono text-sm font-bold text-ink">{coupon.code}</span>
          <CopyCodeButton code={coupon.code} />
        </div>
      </td>
      <td className="px-3 py-3 text-center text-sm text-ink">{discountLabel(coupon)}</td>
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
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-primary hover:opacity-70"
            aria-label={t('dashboard.coupons.edit')}
            title={t('dashboard.coupons.edit')}
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            disabled={deleteCoupon.isPending}
            onClick={() => {
              if (window.confirm(t('dashboard.coupons.confirmDelete'))) deleteCoupon.mutate(coupon.id);
            }}
            className="text-[#FF383C] hover:opacity-70 disabled:opacity-40"
            aria-label={t('dashboard.coupons.delete')}
            title={t('dashboard.coupons.delete')}
          >
            <Trash2 size={16} />
          </button>
        </div>
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
