import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// NOTE: this used to gate the reveal behind a GSAP ScrollTrigger (play only
// once the section scrolled into view). That trigger's start/end position is
// calculated from the DOM the moment this effect runs — but the whole app
// tree mounts hidden (display: none) behind the intro splash screen, so the
// measurement was taken against a zero-height layout. The result was
// unreliable across the site: some sections' reveal fired at the wrong
// scroll position, others (once: true) never fired at all and stayed
// invisible. Firing the reveal directly on mount instead of gating it on
// scroll removes the dependency on that measurement entirely — the elements
// always animate in, regardless of where the intro/layout timing lands.
export function useStaggerReveal({
  selector = ".reveal-item",
  y = 60,
  scale = 0.96,
  opacity = 0,
  stagger = 0.12,
  duration = 0.7,
  ease = "power3.out",
}) {
  const containerRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const items = containerRef.current.querySelectorAll(selector);
      if (!items.length) return;

      gsap.from(items, {
        y,
        scale,
        opacity,
        duration,
        stagger,
        ease,
      });
    }, containerRef);

    return () => ctx.revert();
  }, [reducedMotion, selector, y, scale, opacity, stagger, duration, ease]);

  return containerRef;
}
