/**
 * Static, illustrative exchange rates (relative to USD = 1) — there's no live
 * rates API wired up yet, so these are mock figures for the demo only.
 * All prices stored in mock/package data are assumed to be in USD.
 */
export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', rate: 1 },
  { code: 'EUR', name: 'Euro', rate: 0.92 },
  { code: 'SAR', name: 'Saudi Riyal', rate: 3.75 },
  { code: 'AED', name: 'UAE Dirham', rate: 3.67 },
  { code: 'QAR', name: 'Qatari Riyal', rate: 3.64 },
  { code: 'KWD', name: 'Kuwaiti Dinar', rate: 0.31 },
  { code: 'BHD', name: 'Bahraini Dinar', rate: 0.38 },
  { code: 'OMR', name: 'Omani Rial', rate: 0.38 },
  { code: 'JOD', name: 'Jordanian Dinar', rate: 0.71 },
  { code: 'EGP', name: 'Egyptian Pound', rate: 49 },
  { code: 'SYP', name: 'Syrian Pound', rate: 13000 },
  { code: 'LBP', name: 'Lebanese Pound', rate: 89500 },
  { code: 'IQD', name: 'Iraqi Dinar', rate: 1310 },
  { code: 'MAD', name: 'Moroccan Dirham', rate: 9.9 },
];

export function convertPrice(amountUSD, code) {
  const currency = CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
  return Math.round(amountUSD * currency.rate);
}

export function formatPrice(amountUSD, code) {
  return `${convertPrice(amountUSD, code).toLocaleString('en-US')} ${code}`;
}
