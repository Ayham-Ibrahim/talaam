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
  };
});

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

/** Favorites — in-memory now; add persistence later without touching components */
export const useFavoritesStore = create((set, get) => ({
  favorites: new Set(),
  toggleFavorite: (id) =>
    set(() => {
      const next = new Set(get().favorites);
      next.has(id) ? next.delete(id) : next.add(id);
      return { favorites: next };
    }),
  isFavorite: (id) => get().favorites.has(id),
}));
