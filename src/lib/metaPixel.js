import { config } from '@/config/env';

/**
 * Meta Pixel — نسخة المتصفح من أحداث التتبع. معطّل بالكامل (لا تحميل للسكربت ولا أي
 * طلب) ما دام VITE_META_PIXEL_ID فارغاً، فبيئة staging/المحلي لا تلوّث بيانات الحملات.
 *
 * CompleteRegistration وPurchase يُرسَلان أيضاً من السيرفر (Conversions API) بنفس
 * eventID — Meta تحذف المكرر وتُبقي واحداً، فلا تغيّر صيغة المعرّفات هنا دون الباك
 * (MetaConversionsService).
 */
const ONCE_PREFIX = 'meta_pixel_sent:';

export const isMetaPixelEnabled = Boolean(config.metaPixelId);

export function initMetaPixel() {
  if (!isMetaPixelEnabled || window.fbq) return;

  /* eslint-disable */
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */

  // الموقع SPA: البكسل يرسل PageView تلقائياً مع كل pushState، ونحن نرسله يدوياً من
  // الـ Router (MetaPixelPageViews) — إبقاء الاثنين = كل زيارة صفحة تُحسب مرتين
  window.fbq.disablePushState = true;
  window.fbq('init', config.metaPixelId);
}

export function trackMetaEvent(eventName, params = {}, eventId) {
  if (!isMetaPixelEnabled || !window.fbq) return;
  window.fbq('track', eventName, params, eventId ? { eventID: eventId } : undefined);
}

/**
 * Meta تحذف المكرر بين المتصفح والسيرفر فقط، لا بين طلبين من المتصفح — تحديث صفحة
 * نجاح الدفع كان سيُنتج Purchase جديداً كل مرة، فيُحفظ هنا ما أُرسل.
 */
export function trackMetaEventOnce(eventName, params, eventId) {
  if (!isMetaPixelEnabled || !eventId) return;

  try {
    if (window.localStorage.getItem(ONCE_PREFIX + eventId)) return;
    window.localStorage.setItem(ONCE_PREFIX + eventId, String(Date.now()));
  } catch {
    // تخزين محجوب (تصفح خاص) — نرسل على أي حال، والسيرفر يحمل نفس eventID
  }

  trackMetaEvent(eventName, params, eventId);
}

/** صفحة معلم أو دورة — value اختياري (المعلم وحده بلا سعر واحد) */
export function trackViewContent({ contentId, contentName, contentCategory, value }) {
  trackMetaEvent('ViewContent', {
    content_type: 'product',
    content_ids: [contentId],
    content_name: contentName,
    content_category: contentCategory,
    ...(value != null && { value: Number(value) || 0, currency: config.defaultCurrency }),
  });
}

/**
 * قبل التحويل لصفحة Stripe مباشرة. target بصيغة الباك (booking-12 / enrollment-12 /
 * support-package-purchase-12): السيرفر يرسل نفس الحدث بنفس event_id عند إنشاء جلسة
 * الدفع (MetaConversionsService::trackCheckoutStarted) لأن التحويل قد يقطع طلب البكسل،
 * فتُبقي Meta واحداً. مرة واحدة لكل طلب — إعادة ضغط "ادفع" لنفس الطلب لا تُحتسب ثانية.
 * value = المبلغ المستحق بعد الكوبون، وكل الأسعار في المنصة بالدرهم.
 */
export function trackInitiateCheckout({ value, target, contentCategory }) {
  if (!target) return;
  trackMetaEventOnce(
    'InitiateCheckout',
    {
      value: Number(value) || 0,
      currency: config.defaultCurrency,
      content_type: 'product',
      content_ids: [target],
      content_category: contentCategory,
      num_items: 1,
    },
    `checkout_${target}`,
  );
}

function readCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * الـ API على نطاق مختلف عن الموقع فكوكيز البكسل لا تصله — تُرسَل كترويسات ليستخدمها
 * السيرفر في Conversions API (التسجيل، وحفظها مع سطر الدفع عند ضغط "ادفع").
 */
export function getMetaRequestHeaders() {
  if (!isMetaPixelEnabled) return {};

  const headers = { 'X-Meta-Source-Url': window.location.href };
  const fbp = readCookie('_fbp');
  const fbc = readCookie('_fbc');
  if (fbp) headers['X-Meta-Fbp'] = fbp;
  if (fbc) headers['X-Meta-Fbc'] = fbc;
  return headers;
}
