import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// NOTE: this used to gate the reveal behind a GSAP ScrollTrigger. See the
// comment in useStaggerReveal.js — the trigger's position was measured
// against the app tree while it's mounted hidden (display: none) behind the
// intro splash, so it was unreliable: some elements revealed at the wrong
// scroll position, others never revealed at all. Playing the animation
// directly on mount removes that dependency entirely.
export function ScrollReveal({
  children,
  className = "",
  y = 30,
  x = 0,
  scale = 1,
  opacity = 0,
  duration = 0.7,
  ease = "power3.out",
  delay = 0,
  as: Tag = "div",
}) {
  const ref = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !ref.current) return;

    const ctx = gsap.context(() => {
      gsap.from(ref.current, {
        y,
        x,
        scale,
        opacity,
        duration,
        ease,
        delay,
      });
    }, ref);

    return () => ctx.revert();
  }, [reducedMotion, y, x, scale, opacity, duration, ease, delay]);

  return (
    <Tag
      ref={ref}
      className={className}
      style={reducedMotion ? undefined : { willChange: "transform, opacity" }}
    >
      {children}
    </Tag>
  );
}
