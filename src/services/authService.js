import { config } from '@/config/env';
import { client, mockDelay } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { findMockAccount } from '@/mocks/auth.mock';

/**
 * Real backend nests teacher_type under user.teacher.teacher_type, but the rest
 * of the app (originally built against the mock shape in auth.mock.js) reads a
 * flat user.teacherType — e.g. TeacherPackagesPage's package-vs-course branch.
 * Same story for the avatar: backend field is avatar_path, dashboard headers read
 * user.avatar. Enrich rather than replace so user.teacher.id (also consumed
 * elsewhere) and the raw avatar_path still work. Exported so useUploadAvatar can
 * re-derive the same shape after a successful upload without a full re-login.
 */
export function withTeacherType(user) {
  if (!user) return user;
  return { ...user, teacherType: user.teacher?.teacher_type ?? null, avatar: user.avatar_path ?? null };
}

/**
 * Auth service — the ONLY module that knows how login/logout are performed.
 * Same mock/real switch as every other service; once the backend is live,
 * flipping VITE_USE_MOCKS=false routes these calls to the real /auth endpoints
 * without touching the login page or the store.
 */
export const authService = {
  async login({ email, password }) {
    if (config.useMocks) {
      await mockDelay(500);
      const account = findMockAccount(email, password);
      if (!account) {
        return Promise.reject({
          status: 401,
          message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
          errors: null,
        });
      }
      return {
        token: `mock-token-${account.user.id}-${Date.now()}`,
        user: account.user,
      };
    }
    const { data } = await client.post(endpoints.auth.login, { email, password });
    return { ...data.data, user: withTeacherType(data.data.user) };
  },

  async logout() {
    if (config.useMocks) {
      await mockDelay(150);
      return true;
    }
    const { data } = await client.post(endpoints.auth.logout);
    return data.data;
  },

  async me() {
    if (config.useMocks) {
      await mockDelay(150);
      return null;
    }
    const { data } = await client.get(endpoints.auth.me);
    return withTeacherType(data.data);
  },
};
