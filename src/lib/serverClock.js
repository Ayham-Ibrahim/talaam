/**
 * ساعة السيرفر كما يراها المتصفح: Date.now() + فرق ساعة الجهاز عن السيرفر، محسوباً من
 * ترويسة Date في ردود الـ API (client.js). كل قرار مرتبط بموعد جلسة (ظهور زر "انضم"،
 * حالة الجلسة، الحضور) يُحسم بها بدل ساعة الجهاز — جهاز ساعته متأخرة 10 دقائق كان لا يرى
 * الزر إلا بعد بدء الجلسة بـ 5 دقائق، ومنطقة زمنية خاطئة مع ساعة مضبوطة يدوياً تُزيحه ساعات.
 *
 * ترويسة Date بدقة ثانية فقط، فأي فرق دون SKEW_THRESHOLD_MS يُعتبر صفراً (جهاز مضبوط)
 * كي لا يتذبذب التصحيح بين الطلبات.
 */
const SKEW_THRESHOLD_MS = 5_000;

let offsetMs = 0;
const listeners = new Set();

export function serverNow() {
  return Date.now() + offsetMs;
}

/** يُستدعى من client.js مع كل رد: requestStartedAt/responseReceivedAt بساعة الجهاز */
export function syncServerClock(dateHeader, requestStartedAt, responseReceivedAt) {
  const serverMs = Date.parse(dateHeader ?? '');
  if (!Number.isFinite(serverMs) || !Number.isFinite(requestStartedAt)) return;

  // الترويسة مقطوعة للثانية (+500ms وسطياً) وتمثّل لحظة ما بين الإرسال والاستلام
  const sample = serverMs + 500 - (requestStartedAt + responseReceivedAt) / 2;
  const next = Math.abs(sample) < SKEW_THRESHOLD_MS ? 0 : sample;

  if (Math.abs(next - offsetMs) < SKEW_THRESHOLD_MS) return;

  offsetMs = next;
  listeners.forEach((listener) => listener());
}

export function onServerClockChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
