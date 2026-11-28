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
  defaultCurrency: 'AED',
  locale: 'ar-SA',
  // النطاق النهائي للموقع (مؤكَّد) — يُستخدَم لبناء canonical URLs وstructured data
  // وsitemap.xml. راجع SEO_IMPLEMENTATION.md.
  // Meta Pixel — فارغ = التتبع معطّل بالكامل (راجع src/lib/metaPixel.js)
  metaPixelId: import.meta.env.VITE_META_PIXEL_ID || '',
  // Google Tag Manager (GA4 + Google Ads) — فارغ = معطّل بالكامل (راجع src/lib/gtm.js)
  gtmId: import.meta.env.VITE_GTM_ID || '',
  siteUrl: (import.meta.env.VITE_SITE_URL || 'https://t3allem.com').replace(/\/$/, ''),
  // المحادثة اللحظية (Laravel Reverb) — مفتاح فارغ = WebSocket معطّل، والمحادثة تعمل
  // عبر HTTP مع استطلاع دوري (راجع src/lib/echo.js)
  reverb: {
    key: import.meta.env.VITE_REVERB_APP_KEY || '',
    host: import.meta.env.VITE_REVERB_HOST || 'localhost',
    port: Number(import.meta.env.VITE_REVERB_PORT || 8080),
    scheme: import.meta.env.VITE_REVERB_SCHEME || 'http',
  },
};
