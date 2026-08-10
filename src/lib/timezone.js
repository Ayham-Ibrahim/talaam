/** The IANA zone the browser itself reports — this is "where the user currently is", not a guess. */
export function getBrowserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

/** A reasonably short curated list for browsers without Intl.supportedValuesOf (older Safari/Firefox) */
const FALLBACK_TIMEZONES = [
  'UTC',
  'Asia/Riyadh',
  'Asia/Dubai',
  'Asia/Kuwait',
  'Asia/Qatar',
  'Asia/Bahrain',
  'Asia/Baghdad',
  'Asia/Amman',
  'Asia/Beirut',
  'Asia/Damascus',
  'Asia/Jerusalem',
  'Africa/Cairo',
  'Africa/Casablanca',
  'Africa/Tunis',
  'Africa/Algiers',
  'Africa/Tripoli',
  'Africa/Khartoum',
  'Asia/Istanbul',
  'Asia/Tehran',
  'Asia/Karachi',
  'Asia/Kolkata',
  'Asia/Dhaka',
  'Asia/Jakarta',
  'Asia/Kuala_Lumpur',
  'Asia/Singapore',
  'Asia/Hong_Kong',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Australia/Sydney',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Madrid',
  'Europe/Rome',
  'Europe/Moscow',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Sao_Paulo',
];

/** Every IANA zone the browser knows about, or the curated fallback list on older browsers. */
export function listTimezones() {
  try {
    if (typeof Intl.supportedValuesOf === 'function') {
      const zones = Intl.supportedValuesOf('timeZone');
      if (zones?.length) return zones;
    }
  } catch {
    // fall through to the curated list below
  }
  return FALLBACK_TIMEZONES;
}
