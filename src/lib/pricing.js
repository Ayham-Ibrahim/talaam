/**
 * Mirrors the backend's PricingService exactly (calculateStudentPrice):
 * the student pays the teacher/center price as set; the admin's margin is
 * deducted from it (never added on top), and the provider receives the net.
 */
export function calculateStudentPrice(providerPrice, marginPercent) {
  const studentPrice = Math.round(providerPrice * 100) / 100;
  const platformRevenue = Math.round(providerPrice * (marginPercent / 100) * 100) / 100;
  const providerNet = Math.round((providerPrice - platformRevenue) * 100) / 100;
  return { studentPrice, platformRevenue, providerNet };
}

/** Mirrors the backend's settings-driven default margin (never hardcode 60% elsewhere) */
export const DEFAULT_MARGIN_PERCENT = 60;
