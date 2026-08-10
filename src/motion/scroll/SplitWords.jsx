import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// NOTE: this used to gate the word-reveal behind a GSAP ScrollTrigger
// (onEnter). See the comment in useStaggerReveal.js — that trigger's
// position was measured against the app tree while mounted hidden
// (display: none) behind the intro splash, so it was unreliable across the
// site: some headings revealed late, others never revealed at all. Playing
// the animation directly on mount removes that dependency entirely.
export function SplitWords({
  children,
  as: Tag = "span",
  className = "",
  animate = true,
  y = 40,
  stagger = 0.08,
  duration = 0.9,
  ease = "power3.out",
  delay = 0,
  onReady,
}) {
  const containerRef = useRef(null);
  const reducedMotion = useReducedMotion();

  const text = typeof children === "string" ? children : "";

  useEffect(() => {
    if (!animate || reducedMotion || !containerRef.current) return;
    const ctx = gsap.context(() => {
      const words = containerRef.current.querySelectorAll(".split-word");
      gsap.set(words, { y, opacity: 0 });

      gsap.to(words, {
        y: 0,
        opacity: 1,
        duration,
        stagger,
        ease,
        delay,
        onComplete: onReady,
      });
    }, containerRef);

    return () => ctx.revert();
  }, [animate, reducedMotion, y, stagger, duration, ease, delay, onReady, text]);

  if (!text) {
    return <Tag className={className}>{children}</Tag>;
  }

  const words = text.split(/\s+/).filter(Boolean);

  return (
    <Tag ref={containerRef} className={className}>
      {words.map((word, i) => (
        <span
          key={i}
          className="split-word inline-block"
          style={{
            opacity: reducedMotion ? 1 : undefined,
            transform: reducedMotion ? "none" : undefined,
            willChange: animate && !reducedMotion ? "transform, opacity" : undefined,
          }}
        >
          {word}
          {i < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </Tag>
  );
}
