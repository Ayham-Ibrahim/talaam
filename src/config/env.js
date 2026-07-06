/**
 * Central configuration.
 * The `useMocks` flag is THE single switch that toggles the entire app
 * between mock data and the real backend API.
 *
 * To connect the real backend:  set VITE_USE_MOCKS=false in your .env
 */
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  useMocks: import.meta.env.VITE_USE_MOCKS !== 'false', // defaults to true
  mockDelayMs: 400,
  defaultCurrency: 'USD',
  locale: 'ar-SA',
};
