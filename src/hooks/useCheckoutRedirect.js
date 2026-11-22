import { useCallback, useEffect, useState } from 'react';
import { trackInitiateCheckout } from '@/lib/metaPixel';
import { gtmBeginCheckout } from '@/lib/gtm';

/**
 * التحويل لـ Stripe بعد إنشاء جلسة الدفع — مع حدثَي InitiateCheckout (Meta) وbegin_checkout (GTM).
 * GTM يؤخّر التحويل حتى ثانية ريثما يُرسَل الحدث، والـ mutation انتهت قبلها فيعود الزر
 * قابلاً للضغط — ضغطة ثانية = حجز/تسجيل/اشتراك جديد بانتظار الدفع. isRedirecting يُبقيه معطّلاً
 * حتى مغادرة الصفحة.
 */
export function useCheckoutRedirect() {
  const [isRedirecting, setIsRedirecting] = useState(false);

  // زر "رجوع" من Stripe قد يعيد الصفحة من bfcache بحالتها — بدون هذا يبقى الزر معطّلاً
  useEffect(() => {
    const onPageShow = (e) => {
      if (e.persisted) setIsRedirecting(false);
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  const goToCheckout = useCallback((checkoutEvent, checkoutUrl) => {
    setIsRedirecting(true);
    trackInitiateCheckout(checkoutEvent);
    gtmBeginCheckout(checkoutEvent, () => {
      window.location.href = checkoutUrl;
    });
  }, []);

  return { isRedirecting, goToCheckout };
}
