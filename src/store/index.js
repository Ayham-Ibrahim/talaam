import { create } from 'zustand';

const AUTH_STORAGE_KEY = 'taalam-auth';

function readStoredSession() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Auth session — token + user, backed by localStorage ("remember me")
 * or sessionStorage (cleared when the tab closes). This is the single
 * source of truth api/client.js reads to attach the Authorization header.
 */
export const useAuthStore = create((set) => {
  const stored = readStoredSession();

  return {
    user: stored?.user ?? null,
    token: stored?.token ?? null,
    isAuthenticated: !!stored?.token,

    login: ({ user, token }, rememberMe = true) => {
      const payload = JSON.stringify({ user, token });
      localStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      (rememberMe ? localStorage : sessionStorage).setItem(AUTH_STORAGE_KEY, payload);
      set({ user, token, isAuthenticated: true });
    },

    logout: () => {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      set({ user: null, token: null, isAuthenticated: false });
    },

    /**
     * دمج تعديل جزئي على user المخزَّن (مثلاً teacher.status بعد submitForVerification،
     * أو student.education_type بعد إكمال الملف) دون تسجيل خروج/دخول جديد. يحافظ على
     * نفس مكان التخزين (local/session) الذي كانت الجلسة فيه أصلاً.
     */
    updateUser: (patch) => {
      set((state) => {
        if (!state.user) return state;
        const user = { ...state.user };
        for (const [key, value] of Object.entries(patch)) {
          const isMergeableObject = value && typeof value === 'object' && !Array.isArray(value);
          user[key] = isMergeableObject && typeof user[key] === 'object' ? { ...user[key], ...value } : value;
        }
        const storageKey = localStorage.getItem(AUTH_STORAGE_KEY) ? localStorage : sessionStorage;
        storageKey.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, token: state.token }));
        return { user };
      });
    },
  };
});

const CURRENCY_STORAGE_KEY = 'taalam-currency';

/**
 * Site-wide currency toggle for the public website (Navbar → CurrencySwitcher).
 * All prices in mock/package data are stored in USD; components convert via
 * formatPrice() from '@/lib/currency' using this store's active code.
 */
export const useCurrencyStore = create((set) => ({
  currency: localStorage.getItem(CURRENCY_STORAGE_KEY) || 'USD',
  setCurrency: (currency) => {
    localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
    set({ currency });
  },
}));

/** Search filters — kept in sync with the URL by the SearchPage */
export const useFilterStore = create((set) => ({
  filters: {
    type: '',
    q: '',
    minPrice: null,
    maxPrice: null,
    minRating: null,
    sort: 'rating',
  },
  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),
  setFilters: (next) => set((state) => ({ filters: { ...state.filters, ...next } })),
  resetFilters: () =>
    set({
      filters: { type: '', q: '', minPrice: null, maxPrice: null, minRating: null, sort: 'rating' },
    }),
}));

const LOCALE_STORAGE_KEY = 'taalam-locale';

/**
 * Site-wide language toggle for the public website (Navbar → LanguageSwitcher).
 * Dashboard pages are unaffected: useT() falls back to Arabic for any key
 * missing from the active dictionary, and DashboardLayout hardcodes its own
 * dir="rtl" regardless of this value.
 */
export const useLocaleStore = create((set) => ({
  locale: localStorage.getItem(LOCALE_STORAGE_KEY) || 'ar',
  setLocale: (locale) => {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    set({ locale });
  },
}));
