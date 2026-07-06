import { create } from 'zustand';

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
