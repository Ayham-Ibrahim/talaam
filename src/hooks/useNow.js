import { useSyncExternalStore } from 'react';

/**
 * ساعة مشتركة لكل المكوّنات التي تعرض شيئاً يتغيّر بمرور الوقت فقط (زر "انضمام" الذي يظهر
 * قبل الموعد بخمس دقائق ويختفي بنهايته) — بلا أي طلب للسيرفر. مؤقّت واحد لكل التطبيق
 * يعمل فقط ما دام هناك مكوّن مشترك، ويُحدَّث فوراً عند العودة للتبويب لأن المتصفح
 * يُبطئ المؤقّتات في التبويبات المخفية.
 */
const TICK_MS = 30_000;

let now = Date.now();
let timer = null;
const listeners = new Set();

function tick() {
  now = Date.now();
  listeners.forEach((listener) => listener());
}

function onVisibilityChange() {
  if (document.visibilityState === 'visible') tick();
}

function subscribe(listener) {
  listeners.add(listener);
  if (listeners.size === 1) {
    now = Date.now();
    timer = setInterval(tick, TICK_MS);
    document.addEventListener('visibilitychange', onVisibilityChange);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearInterval(timer);
      timer = null;
      document.removeEventListener('visibilitychange', onVisibilityChange);
    }
  };
}

const getSnapshot = () => now;

export function useNow() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
