/** أقل من هذا قبل انتهاء مهلة الرد يُعرض العدّاد بالأحمر بدل البرتقالي */
export const URGENT_DEADLINE_MS = 3 * 60 * 60 * 1000;

/**
 * كل ما ينتظر المستخدم في قائمة واحدة "مطلوب منك" — الأقرب انتهاءً أولاً، وما بلا مهلة
 * (جلسة قابلة للتعويض، باقة بلا مهلة دفع) في الآخر:
 * { type: 'payment' | 'response' | 'makeup', key, deadline, item }
 */
export function pendingActionItems(pendingActions) {
  const items = [
    ...(pendingActions?.awaiting_payment ?? []).map((item) => ({
      type: 'payment',
      key: `p-${item.id}`,
      deadline: item.holdExpiresAt ?? null,
      item,
    })),
    ...(pendingActions?.awaiting_response ?? []).map((item) => ({
      type: 'response',
      key: `r-${item.id}`,
      deadline: item.counterparty_deadline ?? null,
      item,
    })),
    ...(pendingActions?.makeup_eligible ?? []).map((item) => ({ type: 'makeup', key: `m-${item.id}`, deadline: null, item })),
  ];
  const at = (deadline) => (deadline ? new Date(deadline).getTime() : Infinity);
  return items.sort((a, b) => at(a.deadline) - at(b.deadline));
}

/** أقرب مهلة (ISO) بين كل ما ينتظر — رد على طلب أو دفع — للشريط أعلى اللوحة وللون الرقم في القائمة */
export function nearestDeadline(pendingActions) {
  return pendingActionItems(pendingActions).find((entry) => entry.deadline)?.deadline ?? null;
}

/** مهلة تنتهي خلال URGENT_DEADLINE_MS — الرقم في القائمة الجانبية والشريط بالأحمر */
export function hasUrgentDeadline(pendingActions, nowMs) {
  const deadline = nearestDeadline(pendingActions);
  return Boolean(deadline) && new Date(deadline).getTime() - nowMs < URGENT_DEADLINE_MS;
}

/**
 * الوقت المتبقي حتى المهلة: { text, urgent }. النص من مفاتيح dashboard.pendingActions.timeLeft
 * ({n} ساعة/دقيقة) — يُمرَّر t من المكوّن.
 */
export function timeLeft(t, deadlineIso, nowMs, keys = 'dashboard.pendingActions.timeLeft') {
  const remaining = new Date(deadlineIso).getTime() - nowMs;
  if (!Number.isFinite(remaining) || remaining <= 0) {
    return { text: t(`${keys}.expired`), urgent: true };
  }
  const hours = Math.floor(remaining / 3_600_000);
  const text = hours >= 1
    ? t(`${keys}.hours`).replace('{n}', hours)
    : t(`${keys}.minutes`).replace('{n}', Math.max(1, Math.ceil(remaining / 60_000)));
  return { text, urgent: remaining < URGENT_DEADLINE_MS };
}
