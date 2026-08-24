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
