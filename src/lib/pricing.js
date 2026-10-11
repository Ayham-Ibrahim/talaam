/**
 * Mirrors the backend's PricingService exactly (calculateStudentPrice):
 * the teacher/center sets their own price, the admin sets the margin at
 * approval time, and the student price + platform revenue are derived —
 * never hardcoded, never editable directly. The margin is added on top of
 * the provider's price (never deducted from it) — the provider always
 * receives their price in full.
 */
export function calculateStudentPrice(providerPrice, marginPercent) {
  const studentPrice = Math.round(providerPrice * (1 + marginPercent / 100) * 100) / 100;
  const platformRevenue = Math.round((studentPrice - providerPrice) * 100) / 100;
  return { studentPrice, platformRevenue, providerNet: providerPrice };
}

/** Mirrors the backend's settings-driven default margin (never hardcode 60% elsewhere) */
export const DEFAULT_MARGIN_PERCENT = 60;
