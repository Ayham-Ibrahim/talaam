import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { isMetaPixelEnabled, trackMetaEvent } from '@/lib/metaPixel';

// خارج المكوّن عمداً: StrictMode يشغّل الـ effect مرتين في التطوير، وlocation.key فريد لكل تنقّل
let lastTrackedKey = null;

/**
 * PageView مع كل تنقّل داخل الموقع (SPA — لا إعادة تحميل للصفحة). الأدمن والمعلم والمحاسب
 * والداعم الأكاديمي لا يُتتبَّعون: الجمهور المستهدف بالإعلانات زوار وطلاب فقط.
 */
export function MetaPixelPageViews() {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const isTrackedVisitor = !isAuthenticated || user?.role === 'student';

  useEffect(() => {
    if (!isMetaPixelEnabled || !isTrackedVisitor || lastTrackedKey === location.key) return;
    lastTrackedKey = location.key;
    trackMetaEvent('PageView');
  }, [location.key, isTrackedVisitor]);

  return null;
}
