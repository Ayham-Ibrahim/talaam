/**
 * Mirrors the backend's PricingService exactly (calculateStudentPrice):
 * the teacher/center sets their own price, the admin sets the margin at
 * approval time, and the student price + platform revenue are derived —
 * never hardcoded, never editable directly.
 */
export function calculateStudentPrice(providerPrice, marginPercent) {
  const studentPrice = Math.round(providerPrice * (1 + marginPercent / 100) * 100) / 100;
  const platformRevenue = Math.round((studentPrice - providerPrice) * 100) / 100;
  return { studentPrice, platformRevenue };
}

/** Mirrors the backend's settings-driven default margin (never hardcode 60% elsewhere) */
export const DEFAULT_MARGIN_PERCENT = 60;
