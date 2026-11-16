/** أقل من هذا قبل انتهاء مهلة الرد يُعرض العدّاد بالأحمر بدل البرتقالي */
export const URGENT_DEADLINE_MS = 3 * 60 * 60 * 1000;

/** أقرب مهلة رد بين الطلبات المنتظرة (ISO) — للشريط أعلى اللوحة */
export function nearestDeadline(pendingActions) {
  const deadlines = (pendingActions?.awaiting_response ?? [])
    .map((item) => item.counterparty_deadline)
    .filter(Boolean)
    .sort();
  return deadlines[0] ?? null;
}

/**
 * الوقت المتبقي حتى المهلة: { text, urgent }. النص من مفاتيح dashboard.pendingActions.timeLeft
 * ({n} ساعة/دقيقة) — يُمرَّر t من المكوّن.
 */
export function timeLeft(t, deadlineIso, nowMs) {
  const remaining = new Date(deadlineIso).getTime() - nowMs;
  if (!Number.isFinite(remaining) || remaining <= 0) {
    return { text: t('dashboard.pendingActions.timeLeft.expired'), urgent: true };
  }
  const hours = Math.floor(remaining / 3_600_000);
  const text = hours >= 1
    ? t('dashboard.pendingActions.timeLeft.hours').replace('{n}', hours)
    : t('dashboard.pendingActions.timeLeft.minutes').replace('{n}', Math.max(1, Math.ceil(remaining / 60_000)));
  return { text, urgent: remaining < URGENT_DEADLINE_MS };
}
