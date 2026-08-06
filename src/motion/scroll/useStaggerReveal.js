import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

export function useStaggerReveal({
  selector = ".reveal-item",
  start = "top 80%",
  y = 60,
  scale = 0.96,
  opacity = 0,
  stagger = 0.12,
  duration = 0.7,
  ease = "power3.out",
  once = true,
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
        scrollTrigger: {
          trigger: containerRef.current,
          start,
          once,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [reducedMotion, selector, start, y, scale, opacity, stagger, duration, ease, once]);

  return containerRef;
}
