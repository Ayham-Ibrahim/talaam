/** Backs both the admin's manual-booking search picker and the "إدارة الطلاب" management list — same GET /students endpoint */
export const mockAdminStudents = [
  { id: 401, name: 'نورة الشمري', email: 'noura.shamri@example.com', phone: '0501111111', isActive: true, educationType: 'school', imported: false, createdAt: '2026-01-10T09:00:00Z' },
  { id: 402, name: 'عبدالرحمن فهد', email: 'abdulrahman.fahad@example.com', phone: '0502222222', isActive: true, educationType: 'university', imported: true, createdAt: '2026-02-14T09:00:00Z' },
  { id: 403, name: 'ليان خالد', email: 'layan.khaled@example.com', phone: null, isActive: true, educationType: null, imported: true, createdAt: '2026-03-01T09:00:00Z' },
  { id: 404, name: 'سارة الأحمد', email: 'sara.ahmad@example.com', phone: '0504444444', isActive: false, educationType: 'training', imported: false, createdAt: '2026-03-20T09:00:00Z' },
  { id: 405, name: 'محمد راشد', email: 'mohammed.rashed@example.com', phone: '0505555555', isActive: true, educationType: 'school', imported: false, createdAt: '2026-04-05T09:00:00Z' },
  { id: 406, name: 'هيا سلطان', email: 'haya.sultan@example.com', phone: null, isActive: true, educationType: 'university', imported: true, createdAt: '2026-04-18T09:00:00Z' },
];

export function searchMockStudents(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return mockAdminStudents.filter((s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
}

export function filterMockStudents({ search, educationType } = {}) {
  return mockAdminStudents.filter((s) => {
    if (educationType && s.educationType !== educationType) return false;
    if (search) {
      const q = search.trim().toLowerCase();
      if (q && !s.name.toLowerCase().includes(q) && !s.email.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}
