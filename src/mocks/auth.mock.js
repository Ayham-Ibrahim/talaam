/**
 * Mock accounts — mirrors the exact user shape the real backend returns
 * from POST /auth/login (see AuthController@login in the API).
 * Password is checked in plain text here only because this is a mock;
 * the real backend hashes/verifies server-side.
 */
export const mockAccounts = [
  {
    email: 'student@taalam.com',
    password: 'Student@123',
    user: {
      id: 101,
      name: 'سارة الأحمد',
      email: 'student@taalam.com',
      role: 'student',
      avatar: null,
    },
  },
  {
    email: 'teacher@taalam.com',
    password: 'Teacher@123',
    user: {
      id: 202,
      name: 'أ. أحمد الشمري',
      email: 'teacher@taalam.com',
      role: 'teacher',
      avatar: null,
    },
  },
  {
    email: 'admin@taalam.com',
    password: 'Admin@123',
    user: {
      id: 1,
      name: 'مدير المنصة',
      email: 'admin@taalam.com',
      role: 'admin',
      avatar: null,
    },
  },
];

export function findMockAccount(email, password) {
  return mockAccounts.find(
    (acc) => acc.email.toLowerCase() === String(email).toLowerCase() && acc.password === password
  );
}
