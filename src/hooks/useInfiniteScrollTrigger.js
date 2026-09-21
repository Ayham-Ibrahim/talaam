import { useEffect, useRef } from 'react';

/**
 * Returns a ref to attach to a sentinel element near the end of a list.
 * Fires `onIntersect` once the sentinel scrolls within `rootMargin` of the
 * viewport — the `rootMargin` head start is what makes the next page start
 * loading before the user actually hits the bottom, instead of after.
 */
export function useInfiniteScrollTrigger({ onIntersect, enabled, rootMargin = '600px' }) {
  const sentinelRef = useRef(null);
  const onIntersectRef = useRef(onIntersect);
  onIntersectRef.current = onIntersect;

  useEffect(() => {
    if (!enabled) return undefined;
    const node = sentinelRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onIntersectRef.current();
      },
      { rootMargin }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, rootMargin]);

  return sentinelRef;
}
