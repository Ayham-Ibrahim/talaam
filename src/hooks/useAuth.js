import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store';

/** Current session — components read auth state through this, never the store directly */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return { user, isAuthenticated };
}

export function useLogin() {
  const login = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: ({ email, password }) => authService.login({ email, password }),
    onSuccess: (data, variables) => {
      login({ user: data.user, token: data.token }, variables.rememberMe);
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => logout(),
  });
}
