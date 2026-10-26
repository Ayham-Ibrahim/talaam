import { useMemo, useState } from 'react';
import { X, Plus, Trash2, Copy, Check, Pencil, Search } from 'lucide-react';
import { SmoothSelect } from '@/components/dashboard/SmoothSelect';
import { EmptyState, ErrorState, Skeleton, ApiErrorList } from '@/components/ui';
import {
  useMultiPackageCoupons,
  useMultiCouponPackageOptions,
  useCreateMultiPackageCoupon,
  useUpdateMultiPackageCoupon,
  useDeleteMultiPackageCoupon,
} from '@/hooks/useCoupons';
import { formatDate } from '@/lib/formatters';
import { useT } from '@/hooks/useT';

const inputClass =
  'rounded-btn border border-line bg-surface p-2.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

/**
 * اختيار الباقات المشمولة — options: الباقات المعتمدة حالياً، extra: باقات مربوطة
 * بالكوبون مسبقاً لكنها لم تعد active (مكتملة/معطَّلة) كي تبقى ظاهرة عند التعديل.
 */
function uniqueOptions(items, key, allLabel) {
  const values = [...new Set(items.map((p) => p[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'ar'));
  return [{ value: '', label: allLabel }, ...values.map((v) => ({ value: v, label: v }))];
}

function PackagePicker({ options, extra = [], selectedIds, onChange }) {
  const t = useT();
  const [q, setQ] = useState('');
  const [teacher, setTeacher] = useState('');
  const [subject, setSubject] = useState('');
  const [format, setFormat] = useState('');
  const [onlySelected, setOnlySelected] = useState(false);

  const all = useMemo(() => {
    const keys = new Set(options.map((p) => p.key));
    return [...options, ...extra.filter((p) => !keys.has(p.key))];
  }, [options, extra]);

  const teacherOptions = useMemo(() => uniqueOptions(all, 'teacherName', t('dashboard.multiCoupons.allTeachers')), [all, t]);
  const subjectOptions = useMemo(() => uniqueOptions(all, 'subjectName', t('dashboard.multiCoupons.allSubjects')), [all, t]);
  const formatOptions = [
    { value: '', label: t('dashboard.multiCoupons.allFormats') },
    { value: 'individual', label: t('dashboard.multiCoupons.format.individual') },
    { value: 'group', label: t('dashboard.multiCoupons.format.group') },
    { value: 'course', label: t('dashboard.multiCoupons.format.course') },
  ];

  const needle = q.trim().toLowerCase();
  const visible = all.filter(
    (p) =>
      (!needle || [p.title, p.teacherName, p.subjectName].some((v) => v?.toLowerCase().includes(needle))) &&
      (!teacher || p.teacherName === teacher) &&
      (!subject || p.subjectName === subject) &&
      (!format || p.type === format) &&
      (!onlySelected || selectedIds.includes(p.key)),
  );

  const toggle = (key) =>
    onChange(selectedIds.includes(key) ? selectedIds.filter((x) => x !== key) : [...selectedIds, key]);
  const selectAllShown = () => onChange([...new Set([...selectedIds, ...visible.map((p) => p.key)])]);
  const allShownSelected = visible.length > 0 && visible.every((p) => selectedIds.includes(p.key));

  return (
    <div className="flex flex-col gap-3 text-start">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-bold text-ink">
          {t('dashboard.multiCoupons.packagesLabel')}
          <span className="ms-2 rounded-pill bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
            {selectedIds.length} {t('dashboard.multiCoupons.packagesSelected')}
          </span>
        </span>
        <div className="flex items-center gap-3 text-xs">
          <label className="flex cursor-pointer items-center gap-1.5 text-ink-soft">
            <input type="checkbox" checked={onlySelected} onChange={(e) => setOnlySelected(e.target.checked)} className="accent-primary" />
            {t('dashboard.multiCoupons.onlySelected')}
          </label>
          <button type="button" onClick={selectAllShown} disabled={visible.length === 0} className="font-medium text-primary hover:underline disabled:opacity-40">
            {t('dashboard.multiCoupons.selectAllShown')}
          </button>
          <button type="button" onClick={() => onChange([])} disabled={selectedIds.length === 0} className="font-medium text-[#FF383C] hover:underline disabled:opacity-40">
            {t('dashboard.multiCoupons.clearSelection')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
        <div className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 md:col-span-1">
          <Search size={14} className="shrink-0 text-ink-soft" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('dashboard.multiCoupons.packagesSearch')}
            className="w-full bg-transparent py-3 text-sm text-ink outline-none placeholder:text-ink-soft"
          />
        </div>
        <SmoothSelect value={teacher} onChange={setTeacher} options={teacherOptions} placeholder={t('dashboard.multiCoupons.allTeachers')} />
        <SmoothSelect value={subject} onChange={setSubject} options={subjectOptions} placeholder={t('dashboard.multiCoupons.allSubjects')} />
        <SmoothSelect value={format} onChange={setFormat} options={formatOptions} placeholder={t('dashboard.multiCoupons.allFormats')} />
      </div>

      <div className="max-h-[340px] overflow-auto rounded-xl border border-line bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="sticky top-0 z-10 bg-canvas">
            <tr className="border-b border-line">
              <th className="w-10 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={allShownSelected}
                  onChange={() =>
                    allShownSelected
                      ? onChange(selectedIds.filter((key) => !visible.some((p) => p.key === key)))
                      : selectAllShown()
                  }
                  className="accent-primary"
                />
              </th>
              <th className="px-3 py-2.5 text-start font-bold text-ink">{t('dashboard.multiCoupons.colTitle')}</th>
              <th className="px-3 py-2.5 text-start font-bold text-ink">{t('dashboard.multiCoupons.colTeacher')}</th>
              <th className="px-3 py-2.5 text-start font-bold text-ink">{t('dashboard.multiCoupons.colSubject')}</th>
              <th className="px-3 py-2.5 text-center font-bold text-ink">{t('dashboard.multiCoupons.colFormat')}</th>
              <th className="px-3 py-2.5 text-center font-bold text-ink">{t('dashboard.multiCoupons.colPrice')}</th>
              <th className="px-3 py-2.5 text-center font-bold text-ink">{t('dashboard.multiCoupons.colMargin')}</th>
              <th className="px-3 py-2.5 text-center font-bold text-ink">{t('dashboard.multiCoupons.colPlatformShare')}</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-xs text-ink-soft">
                  {t('dashboard.multiCoupons.packagesEmpty')}
                </td>
              </tr>
            ) : (
              visible.map((p) => {
                const checked = selectedIds.includes(p.key);
                return (
                  <tr
                    key={p.key}
                    onClick={() => toggle(p.key)}
                    className={`cursor-pointer border-b border-line last:border-0 ${checked ? 'bg-primary/5' : 'hover:bg-canvas'}`}
                  >
                    <td className="px-3 py-2.5 text-center">
                      <input type="checkbox" checked={checked} readOnly className="pointer-events-none accent-primary" />
                    </td>
                    <td className="px-3 py-2.5 font-medium text-ink">{p.title}</td>
                    <td className="px-3 py-2.5 text-ink-soft">{p.teacherName ?? '—'}</td>
                    <td className="px-3 py-2.5 text-ink-soft">{p.subjectName ?? '—'}</td>
                    <td className="px-3 py-2.5 text-center text-ink-soft">
                      {p.type ? t(`dashboard.multiCoupons.format.${p.type}`) : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-center text-ink-soft" dir="ltr">
                      {p.studentPrice != null ? `${p.studentPrice} د.إ` : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-center text-ink-soft" dir="ltr">
                      {p.marginPercent != null ? `${p.marginPercent}%` : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-center text-ink-soft" dir="ltr">
                      {p.platformRevenue != null ? `${p.platformRevenue} د.إ` : '—'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** باقات ودورات الكوبون الحالية بنفس شكل خيارات الاختيار (key/kind) */
function attachedItems(coupon) {
  if (!coupon) return [];
  return [
    ...(coupon.packages ?? []).map((p) => ({ key: `package:${p.id}`, kind: 'package', id: p.id, title: p.title })),
    ...(coupon.courses ?? []).map((c) => ({ key: `course:${c.id}`, kind: 'course', id: c.id, title: c.title })),
  ];
}

/** أقصى خصم مسموح = أدنى هامش منصة بين الباقات المختارة (نفس سقف الباك تماماً) */
function maxAllowed(options, selectedIds, discountType) {
  const selected = options.filter((p) => selectedIds.includes(p.key));
  const values = selected
    .map((p) => (discountType === 'percent' ? p.marginPercent : p.platformRevenue))
    .filter((v) => v != null);
  return values.length ? Math.min(...values) : null;
}

function CouponForm({ coupon, options, onDone }) {
  const t = useT();
  const createCoupon = useCreateMultiPackageCoupon();
  const updateCoupon = useUpdateMultiPackageCoupon();
  const mutation = coupon ? updateCoupon : createCoupon;

  const [code, setCode] = useState('');
  // مفاتيح موحّدة "package:ID" / "course:ID" — تُفصل إلى packageIds/courseIds عند الإرسال
  const [selectedKeys, setSelectedKeys] = useState(() => attachedItems(coupon).map((p) => p.key));
  const [discountType, setDiscountType] = useState(coupon?.discountType ?? 'percent');
  const [discountValue, setDiscountValue] = useState(coupon ? String(coupon.discountValue) : '');
  const [maxRedemptions, setMaxRedemptions] = useState(coupon?.maxRedemptions ? String(coupon.maxRedemptions) : '');
  const [expiresAt, setExpiresAt] = useState(coupon?.expiresAt ? coupon.expiresAt.slice(0, 10) : '');

  const cap = maxAllowed(options, selectedKeys, discountType);
  const isValid =
    selectedKeys.length > 0 &&
    discountValue !== '' &&
    Number(discountValue) > 0 &&
    (discountType !== 'percent' || Number(discountValue) <= 100) &&
    (cap == null || Number(discountValue) <= cap);

  const handleSubmit = () => {
    if (!isValid) return;
    const idsOf = (kind) => selectedKeys.filter((k) => k.startsWith(`${kind}:`)).map((k) => Number(k.split(':')[1]));
    const payload = {
      packageIds: idsOf('package'),
      courseIds: idsOf('course'),
      discountType,
      discountValue: Number(discountValue),
      maxRedemptions: maxRedemptions ? Number(maxRedemptions) : coupon ? null : undefined,
      expiresAt: expiresAt || (coupon ? null : undefined),
    };
    mutation.mutate(coupon ? { id: coupon.id, ...payload } : { code: code.trim() || undefined, ...payload }, {
      onSuccess: onDone,
    });
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-line bg-canvas p-4 sm:p-5">
      {mutation.isError && <ApiErrorList error={mutation.error} labelFor={() => null} />}
      <PackagePicker
        options={options}
        extra={attachedItems(coupon)}
        selectedIds={selectedKeys}
        onChange={setSelectedKeys}
      />
      <div className="grid grid-cols-1 gap-3 border-t border-line pt-4 sm:grid-cols-2 lg:grid-cols-5">
        {!coupon && (
          <label className="flex flex-col gap-1.5 text-start">
            <span className="text-xs font-bold text-ink">{t('dashboard.coupons.codeLabel')}</span>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder={t('dashboard.coupons.codeAutoHint')}
              dir="ltr"
              className={inputClass}
            />
          </label>
        )}
        <label className="flex flex-col gap-1.5 text-start">
          <span className="text-xs font-bold text-ink">{t('dashboard.coupons.maxRedemptionsLabel')}</span>
          <input
            type="number"
            min="1"
            value={maxRedemptions}
            onChange={(e) => setMaxRedemptions(e.target.value)}
            placeholder={t('dashboard.coupons.unlimitedHint')}
            dir="ltr"
            className={inputClass}
          />
        </label>
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
            {discountType === 'percent'
              ? t('dashboard.coupons.discountValuePercentLabel')
              : t('dashboard.coupons.discountValueFixedLabel')}
          </span>
          <input
            type="number"
            min="0.01"
            max={cap ?? (discountType === 'percent' ? '100' : undefined)}
            step="0.01"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            dir="ltr"
            className={inputClass}
          />
          {cap != null && (
            <span className="text-[11px] text-ink-soft">
              {discountType === 'percent'
                ? `${t('dashboard.multiCoupons.maxAllowedPercent')}: ${cap}%`
                : `${t('dashboard.multiCoupons.maxAllowedFixed')}: ${cap} د.إ`}
            </span>
          )}
        </label>
        <label className="flex flex-col gap-1.5 text-start">
          <span className="text-xs font-bold text-ink">{t('dashboard.coupons.expiresAtLabel')}</span>
          <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className={inputClass} />
        </label>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={!isValid || mutation.isPending}
          onClick={handleSubmit}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
        >
          {coupon
            ? mutation.isPending
              ? t('dashboard.coupons.saving')
              : t('dashboard.coupons.save')
            : mutation.isPending
              ? t('dashboard.coupons.creating')
              : t('dashboard.coupons.create')}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-xl border border-line px-5 py-2.5 text-sm font-medium text-ink-soft hover:bg-line/30"
        >
          {t('dashboard.coupons.cancel')}
        </button>
      </div>
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
      // الحافظة غير متاحة — الكود ظاهر أصلاً للنسخ يدوياً
    }
  };
  return (
    <button type="button" onClick={handleCopy} aria-label={t('dashboard.coupons.copyCode')} className="text-ink-soft hover:text-primary">
      {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
    </button>
  );
}

function CouponCard({ coupon, onEdit }) {
  const t = useT();
  const updateCoupon = useUpdateMultiPackageCoupon();
  const deleteCoupon = useDeleteMultiPackageCoupon();
  const discount = coupon.discountType === 'percent' ? `${coupon.discountValue}%` : `${coupon.discountValue} د.إ`;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5" dir="ltr">
          <span className="font-mono text-sm font-bold text-ink">{coupon.code}</span>
          <CopyCodeButton code={coupon.code} />
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="font-bold text-ink">{discount}</span>
          <span className="text-ink-soft">
            {coupon.redeemedCount}
            {coupon.maxRedemptions ? ` / ${coupon.maxRedemptions}` : ''}
          </span>
          <span className="text-ink-soft">
            {coupon.expiresAt ? formatDate(coupon.expiresAt) : t('dashboard.coupons.noExpiry')}
          </span>
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
          <button
            type="button"
            onClick={onEdit}
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
      </div>
      <div className="flex flex-wrap gap-1.5">
        {attachedItems(coupon).map((p) => (
          <span
            key={p.key}
            className={`rounded-pill px-2.5 py-1 text-xs ${p.kind === 'course' ? 'bg-accent-purple/10 text-accent-purple' : 'bg-primary/5 text-primary'}`}
          >
            {p.title}
          </span>
        ))}
      </div>
    </div>
  );
}

export function MultiPackageCouponsModal({ onClose }) {
  const t = useT();
  // null = لا فورم، 'new' = إنشاء، كائن = تعديل ذلك الكوبون
  const [editing, setEditing] = useState(null);
  const { data: coupons, isLoading, isError, refetch } = useMultiPackageCoupons();
  const { data: options = [] } = useMultiCouponPackageOptions();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="relative max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-white p-6 shadow-lift sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t('dashboard.teacherPackages.close')}
          className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-line/40 hover:text-ink"
        >
          <X size={18} />
        </button>

        <div className="text-start">
          <h2 className="text-lg font-bold text-ink">{t('dashboard.multiCoupons.title')}</h2>
          <p className="mt-1 text-sm text-ink-soft">{t('dashboard.multiCoupons.subtitle')}</p>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          {editing ? (
            <CouponForm
              key={editing === 'new' ? 'new' : editing.id}
              coupon={editing === 'new' ? null : editing}
              options={options}
              onDone={() => setEditing(null)}
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditing('new')}
              className="flex items-center gap-1.5 self-start rounded-xl border border-primary px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/5"
            >
              <Plus size={16} />
              {t('dashboard.coupons.create')}
            </button>
          )}

          {/* أثناء الإنشاء/التعديل تُخفى قائمة الكوبونات — الفورم وحده يملأ النافذة */}
          {editing ? null : isError ? (
            <ErrorState onRetry={refetch} />
          ) : isLoading ? (
            <Skeleton className="h-32 rounded-2xl" />
          ) : !coupons || coupons.length === 0 ? (
            <EmptyState title={t('dashboard.multiCoupons.empty')} />
          ) : (
            coupons.map((coupon) => <CouponCard key={coupon.id} coupon={coupon} onEdit={() => setEditing(coupon)} />)
          )}
        </div>
      </div>
    </div>
  );
}
