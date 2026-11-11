import { X } from 'lucide-react';
import { PAYOUT_STATUS_STYLES } from '@/mocks/adminPayouts.mock';
import { formatPrice } from '@/lib/formatters';

/** أجزاء مشتركة بين صفحات الموظفين والرواتب والتقرير */

export const INPUT_CLASS =
  'w-full rounded-btn border border-line bg-white p-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

/** YYYY-MM بالتوقيت المحلي (toISOString بتوقيت UTC قد يعطي الشهر السابق/التالي على حدود الشهر) */
export function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/** عملات رواتب الموظفين (Employee::CURRENCIES بالباك) — التقارير كلها بالدرهم */
export const BASE_CURRENCY = 'AED';
export const PAYROLL_CURRENCIES = ['AED', 'USD', 'EGP'];

/**
 * طريقة إدخال سعر كل عملة أجنبية: الباك يخزّن دائماً "1 وحدة = X درهم"، لكن الجنيه أسهل إدخالاً
 * معكوساً ("1 درهم = 13.6 جنيه") لأن صيغته المباشرة رقم صغير (0.0735) يسهل الخطأ فيه.
 */
export const RATE_INPUTS = [
  { currency: 'USD', inverse: false },
  { currency: 'EGP', inverse: true },
];

/** القيمة المعروضة في خانة الإدخال ← rate_to_aed المخزّن، والعكس */
export function rateToInput(rate, inverse) {
  if (!rate) return '';
  return String(inverse ? +(1 / rate).toFixed(4) : +rate.toFixed(6));
}

export function inputToRate(value, inverse) {
  const n = Number(value);
  if (!value || !(n > 0)) return null;
  return inverse ? 1 / n : n;
}

/** نص سعر الصرف بنفس اتجاه إدخاله: "1 USD = 3.67 AED" و"1 AED = 13.6 EGP" */
export function formatRate(currency, rate) {
  const inverse = RATE_INPUTS.find((r) => r.currency === currency)?.inverse ?? false;
  const value = rateToInput(rate, inverse);
  return inverse ? `1 ${BASE_CURRENCY} = ${value} ${currency}` : `1 ${currency} = ${value} ${BASE_CURRENCY}`;
}

/** مبلغ بعملته الأصلية، ومقابله بالدرهم تحته إن كانت العملة أجنبية */
export function MoneyWithAed({ amount, currency, aed, className = '' }) {
  return (
    <div className={className}>
      <div>{formatPrice(amount, currency)}</div>
      {currency && currency !== BASE_CURRENCY && aed != null && (
        <div className="text-xs font-normal text-ink-soft">≈ {formatPrice(aed, BASE_CURRENCY)}</div>
      )}
    </div>
  );
}

/** نفس ألوان حالة كشوف المستحقات (مدفوع/غير مدفوع) */
export function SalaryStatusBadge({ status }) {
  const style = PAYOUT_STATUS_STYLES[status] ?? PAYOUT_STATUS_STYLES.pending;
  return (
    <span
      className="inline-flex items-center rounded-pill px-3 py-1 text-xs font-bold"
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {style.label}
    </span>
  );
}

export function StatCard({ icon: Icon, label, value, bg = '#EDF0F5', color = '#4B6898' }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#F2F2F7] bg-white p-4 shadow-card">
      <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-xl" style={{ background: bg }}>
        <Icon size={28} style={{ color }} />
      </div>
      <div className="text-right">
        <div className="text-sm font-bold text-[#2D2D2D]">{label}</div>
        <div className="text-2xl font-bold text-[#2D2D2D]">{value}</div>
      </div>
    </div>
  );
}

export function ModalShell({ title, onClose, closeLabel, size = 'max-w-md', children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className={`max-h-[90vh] w-full ${size} overflow-y-auto rounded-2xl bg-white p-6 shadow-lift`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-line/40 hover:text-ink"
          >
            <X size={18} />
          </button>
          <h3 className="flex-1 text-center text-lg font-bold text-ink">{title}</h3>
          <span className="w-8" />
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5 text-right">
      <span className="text-sm font-semibold text-ink">{label}</span>
      {children}
    </label>
  );
}

export function ModalActions({ onCancel, cancelLabel, submitLabel, disabled, danger = false }) {
  return (
    <div className="mt-2 flex gap-3">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 rounded-xl border border-line py-3 text-sm font-medium text-ink-soft hover:bg-line/30"
      >
        {cancelLabel}
      </button>
      <button
        type="submit"
        disabled={disabled}
        className={`flex-1 rounded-xl py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 ${
          danger ? 'bg-accent-pink' : 'bg-primary'
        }`}
      >
        {submitLabel}
      </button>
    </div>
  );
}
