/**
 * Payouts mocks — mirrors PayoutService: admin generates a month's payouts for
 * every provider with one button (unpaid), then marks each one as paid. No refunds
 * involved anywhere in this flow.
 */

export const PAYOUT_STATUS_STYLES = {
  pending: { label: 'غير مدفوع', bg: '#FEF3E2', color: '#B7791F' },
  paid: { label: 'مدفوع', bg: '#E3F5EC', color: '#2E9E6B' },
};

let mockPayouts = [
  {
    id: 801,
    providerName: 'فيصل الدوسري',
    providerType: 'university',
    periodLabel: 'يونيو 2026',
    sessionsCount: 18,
    totalAmount: 1440,
    status: 'paid',
    generatedAt: '2026-07-01',
    approvedAt: '2026-07-02',
    paidAt: '2026-07-05',
  },
  {
    id: 802,
    providerName: 'ريما الحربي',
    providerType: 'training_center',
    periodLabel: 'يونيو 2026',
    sessionsCount: 22,
    totalAmount: 3300,
    status: 'paid',
    generatedAt: '2026-07-01',
    approvedAt: '2026-07-03',
    paidAt: '2026-07-06',
  },
  {
    id: 803,
    providerName: 'سلمى ياسين',
    providerType: 'school',
    periodLabel: 'يوليو 2026',
    sessionsCount: 10,
    totalAmount: 700,
    status: 'pending',
    generatedAt: '2026-07-20',
    approvedAt: '2026-07-21',
    paidAt: null,
  },
  {
    id: 804,
    providerName: 'يوسف كريم',
    providerType: 'training_center',
    periodLabel: 'يوليو 2026',
    sessionsCount: 8,
    totalAmount: 1600,
    status: 'pending',
    generatedAt: '2026-07-22',
    approvedAt: null,
    paidAt: null,
  },
];

export function filterMockPayouts(filters = {}) {
  let result = [...mockPayouts];
  if (filters.status) result = result.filter((p) => p.status === filters.status);
  result.sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));
  return result;
}

export function findMockPayout(id) {
  return mockPayouts.find((p) => p.id === Number(id)) ?? null;
}

export function updateMockPayout(id, patch) {
  mockPayouts = mockPayouts.map((p) => (p.id === Number(id) ? { ...p, ...patch } : p));
  return findMockPayout(id);
}

export { mockPayouts };
