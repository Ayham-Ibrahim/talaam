/**
 * Payouts mocks — mirrors PayoutService: aggregates completed sessions per
 * provider into a batch, admin approves then marks as paid. No refunds
 * involved anywhere in this flow.
 */

export const PAYOUT_STATUS_STYLES = {
  pending: { label: 'بانتظار الاعتماد', bg: '#FEF3E2', color: '#B7791F' },
  approved: { label: 'معتمد', bg: '#F0FAFD', color: '#2F80ED' },
  paid: { label: 'مدفوع', bg: '#E3F5EC', color: '#2E9E6B' },
};

export const ELIGIBLE_PAYOUT_PROVIDERS = [
  { id: 304, name: 'سلمى ياسين', type: 'school', sessionsCount: 9, amountPerSession: 72 },
  { id: 305, name: 'فيصل الدوسري', type: 'university', sessionsCount: 12, amountPerSession: 100 },
  { id: 306, name: 'ريما الحربي', type: 'training_center', sessionsCount: 16, amountPerSession: 150 },
  { id: 309, name: 'يوسف كريم', type: 'training_center', sessionsCount: 7, amountPerSession: 180 },
];

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
    status: 'approved',
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

let nextPayoutId = 805;

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

export function createMockPayout(providerId) {
  const provider = ELIGIBLE_PAYOUT_PROVIDERS.find((p) => p.id === Number(providerId));
  if (!provider) return null;

  const created = {
    id: nextPayoutId++,
    providerName: provider.name,
    providerType: provider.type,
    periodLabel: 'يوليو 2026',
    sessionsCount: provider.sessionsCount,
    totalAmount: provider.sessionsCount * provider.amountPerSession,
    status: 'pending',
    generatedAt: new Date().toISOString().slice(0, 10),
    approvedAt: null,
    paidAt: null,
  };
  mockPayouts = [created, ...mockPayouts];
  return created;
}

export { mockPayouts };
