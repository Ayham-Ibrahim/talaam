/** Minimal student directory for the admin's manual-booking search — no dedicated "list students" backend endpoint exists yet */
export const mockAdminStudents = [
  { id: 401, name: 'نورة الشمري', email: 'noura.shamri@example.com' },
  { id: 402, name: 'عبدالرحمن فهد', email: 'abdulrahman.fahad@example.com' },
  { id: 403, name: 'ليان خالد', email: 'layan.khaled@example.com' },
  { id: 404, name: 'سارة الأحمد', email: 'sara.ahmad@example.com' },
  { id: 405, name: 'محمد راشد', email: 'mohammed.rashed@example.com' },
  { id: 406, name: 'هيا سلطان', email: 'haya.sultan@example.com' },
];

export function searchMockStudents(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return mockAdminStudents.filter((s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
}
