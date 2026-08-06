import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

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
  start = "top 82%",
  once = true,
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
        scrollTrigger: {
          trigger: ref.current,
          start,
          once,
        },
      });
    }, ref);

    return () => ctx.revert();
  }, [reducedMotion, y, x, scale, opacity, duration, ease, delay, start, once]);

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
