import { config } from '@/config/env';

/** Formats a price with currency for Arabic display */
export function formatPrice(amount, currency = config.defaultCurrency) {
  if (amount == null) return '';
  const symbol = currency === 'USD' ? '$' : currency;
  return `${symbol}${amount}`;
}

/** Formats large numbers with Arabic thousands separators */
export function formatNumber(n) {
  if (n == null) return '';
  return new Intl.NumberFormat(config.locale).format(n);
}

/** Compact number for stats (+15,000) */
export function formatCompact(n) {
  if (n == null) return '';
  return '+' + new Intl.NumberFormat('en-US').format(n);
}

/**
 * Latest date in a `[{date, ...}]` schedule list (e.g. a group package's
 * explicit per-session calendar dates from GroupSessionDatesPicker), or null
 * if the list is empty/undated. Individual packages have no `date` on their
 * schedule entries (day_of_week-based availability instead) and correctly
 * resolve to null here — they have no fixed "last session" before booking.
 */
export function lastScheduleDate(schedules) {
  if (!schedules?.length) return null;
  const dates = schedules.map((s) => s.date).filter(Boolean).sort();
  return dates.length ? dates[dates.length - 1] : null;
}

/** True once the given ISO date's whole day has passed (today itself is not yet "past") */
export function isPastDate(iso) {
  if (!iso) return false;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return false;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return date < startOfToday;
}

/** Formats an ISO date string to Arabic long date */
export function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat(config.locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/**
 * Formats an ISO datetime string to Arabic date + time.
 * `timezone` (IANA name, e.g. "Asia/Riyadh") is optional — when given, the
 * moment is rendered in THAT zone instead of the viewer's own browser zone.
 * Needed wherever a time was entered by someone other than whoever is
 * looking at it (e.g. an admin reviewing a student's reschedule request —
 * the request's dates mean nothing in the admin's own local time, only in
 * the student's), so the viewer never silently sees the wrong wall-clock time.
 */
export function formatDateTime(iso, timezone) {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat(config.locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      ...(timezone ? { timeZone: timezone } : {}),
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
