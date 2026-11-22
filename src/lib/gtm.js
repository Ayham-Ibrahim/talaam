import { config } from '@/config/env';
import { useAuthStore } from '@/store';

/**
 * Google Tag Manager — المسار الوحيد لأحداث Google (GA4 وGoogle Ads): الموقع يضع الحدث
 * في dataLayer مرة واحدة، وGTM يوزّعه على المنصات. لا يوجد أي كود gtag مباشر في الموقع،
 * ولا يُضاف Meta Pixel داخل GTM (مركّب في metaPixel.js مع Conversions API) — وإلا تتكرر الأحداث.
 *
 * ظهور الصفحات لا يُرسَل من هنا: Enhanced Measurement في GA4 يلتقط تنقّل الـ SPA بنفسه،
 * فإرساله يدوياً (أو مشغّل History Change في GTM) = كل زيارة تُحسب مرتين.
 *
 * معطّل بالكامل (لا تحميل للسكربت ولا أي push) ما دام VITE_GTM_ID فارغاً، مثل البكسل.
 */
const ONCE_PREFIX = 'gtm_sent:';

export const isGtmEnabled = Boolean(config.gtmId);

function push(data) {
  if (!isGtmEnabled) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(data);
}

/** visitor | student | teacher | admin ... — ليُستثنى غير الطلاب من التقارير كما في Meta */
function roleOf(state) {
  return state.isAuthenticated ? state.user?.role || 'unknown' : 'visitor';
}

export function initGtm() {
  if (!isGtmEnabled || window.google_tag_manager) return;

  // الدور قبل تحميل GTM — الجلسة تُقرأ من التخزين بشكل متزامن، فهو جاهز من أول حدث
  let lastRole = roleOf(useAuthStore.getState());
  push({ user_role: lastRole });
  useAuthStore.subscribe((state) => {
    const role = roleOf(state);
    if (role === lastRole) return;
    lastRole = role;
    push({ event: 'user_role_change', user_role: role });
  });

  push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(config.gtmId)}`;
  document.head.appendChild(script);
}

/** أحداث التجارة بصيغة GA4 القياسية — ecommerce: null أولاً حتى لا يرث الحدث items حدثٍ سابق */
function pushEcommerce(event, ecommerce) {
  push({ ecommerce: null });
  push({ event, ecommerce: { currency: config.defaultCurrency, ...ecommerce } });
}

function item({ id, name, category, price }) {
  return {
    item_id: id,
    ...(name && { item_name: name }),
    ...(category && { item_category: category }),
    ...(price != null && { price: Number(price) || 0 }),
    quantity: 1,
  };
}

/** نفس منطق trackMetaEventOnce — تحديث صفحة نجاح الدفع لا يُنتج حدثاً جديداً */
function once(key) {
  try {
    if (window.localStorage.getItem(ONCE_PREFIX + key)) return false;
    window.localStorage.setItem(ONCE_PREFIX + key, String(Date.now()));
  } catch {
    // تخزين محجوب (تصفح خاص) — نرسل على أي حال، وtransaction_id يمنع التكرار في GA4 وAds
  }
  return true;
}

/** صفحة معلم أو دورة — يقابل ViewContent في Meta */
export function gtmViewItem({ contentId, contentName, contentCategory, value }) {
  pushEcommerce('view_item', {
    ...(value != null && { value: Number(value) || 0 }),
    items: [item({ id: contentId, name: contentName, category: contentCategory, price: value })],
  });
}

/** قبل التحويل لـ Stripe — يقابل InitiateCheckout، وtarget بصيغة الباك (booking-12 ...) */
export function gtmBeginCheckout({ value, target, contentCategory }) {
  if (!isGtmEnabled || !target || !once(`checkout_${target}`)) return;
  pushEcommerce('begin_checkout', {
    value: Number(value) || 0,
    items: [item({ id: target, category: contentCategory, price: value })],
  });
}

/** تسجيل طالب جديد — يقابل CompleteRegistration */
export function gtmSignUp() {
  push({ event: 'sign_up', method: 'email' });
}

/**
 * بعد تأكيد webhook Stripe فقط — يقابل Purchase. transaction_id = target نفسه (booking-12)
 * فيطابق event_id في Meta، ويدمج به GA4 وGoogle Ads أي تكرار.
 */
export function gtmPurchase({ value, target, contentCategory }) {
  if (!isGtmEnabled || !target || !once(`purchase_${target}`)) return;
  pushEcommerce('purchase', {
    transaction_id: target,
    value: Number(value) || 0,
    items: [item({ id: target, category: contentCategory, price: value })],
  });
}
