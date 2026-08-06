import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

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
  start = "top 85%",
  onReady,
}) {
  const containerRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const triggeredRef = useRef(false);

  const text = typeof children === "string" ? children : "";

  useEffect(() => {
    if (!animate || reducedMotion || !containerRef.current) return;
    const ctx = gsap.context(() => {
      const words = containerRef.current.querySelectorAll(".split-word");
      gsap.set(words, { y, opacity: 0 });

      ScrollTrigger.create({
        trigger: containerRef.current,
        start,
        once: true,
        onEnter: () => {
          if (triggeredRef.current) return;
          triggeredRef.current = true;
          gsap.to(words, {
            y: 0,
            opacity: 1,
            duration,
            stagger,
            ease,
            delay,
            onComplete: onReady,
          });
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [animate, reducedMotion, y, stagger, duration, ease, delay, start, onReady, text]);

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
