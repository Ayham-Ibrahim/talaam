/**
 * Static, illustrative exchange rates (relative to AED = 1, the platform's
 * base/operational currency — every price actually stored in the backend is
 * AED) — there's no live rates API wired up yet, so these are mock figures
 * for the demo only. Rebased from the old USD-based table by dividing each
 * rate by the old AED rate (3.67); AED itself is exactly 1 by construction.
 */
export const CURRENCIES = [
  { code: 'AED', name: 'UAE Dirham', rate: 1 },
  { code: 'USD', name: 'US Dollar', rate: 0.2725 },
  { code: 'EUR', name: 'Euro', rate: 0.2507 },
  { code: 'SAR', name: 'Saudi Riyal', rate: 1.0218 },
  { code: 'QAR', name: 'Qatari Riyal', rate: 0.9918 },
  { code: 'KWD', name: 'Kuwaiti Dinar', rate: 0.0845 },
  { code: 'BHD', name: 'Bahraini Dinar', rate: 0.1035 },
  { code: 'OMR', name: 'Omani Rial', rate: 0.1035 },
  { code: 'JOD', name: 'Jordanian Dinar', rate: 0.1934 },
  { code: 'EGP', name: 'Egyptian Pound', rate: 13.3515 },
  { code: 'SYP', name: 'Syrian Pound', rate: 3542.1798 },
  { code: 'LBP', name: 'Lebanese Pound', rate: 24386.921 },
  { code: 'IQD', name: 'Iraqi Dinar', rate: 356.9482 },
  { code: 'MAD', name: 'Moroccan Dirham', rate: 2.6975 },
];

export function convertPrice(amountAED, code) {
  const currency = CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
  return Math.round(amountAED * currency.rate);
}

export function formatPrice(amountAED, code) {
  return `${convertPrice(amountAED, code).toLocaleString('en-US')} ${code}`;
}
