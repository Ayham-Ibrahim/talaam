import { useState, useEffect, useRef } from "react";
import { useMotionValue, useSpring, useTransform, useScroll } from "framer-motion";

// Returns mouse position relative to window or a specific ref
export function useMousePosition(ref = null) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (ref && ref.current) {
        const rect = ref.current.getBoundingClientRect();
        setPosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      } else {
        setPosition({ x: e.clientX, y: e.clientY });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [ref]);

  return position;
}

// Global mouse parallax for floating elements
export function useParallax(offset = 15) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 150, mass: 2 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Normalize from -1 to 1 based on screen size
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      mouseX.set(x * offset);
      mouseY.set(y * offset);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, offset]);

  return { x: smoothX, y: smoothY };
}

// 3D Tilt effect for cards
export function useMouseTilt(ref, settings = { scale: 1.02, maxTilt: 5 }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [settings.maxTilt, -settings.maxTilt]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-settings.maxTilt, settings.maxTilt]);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Normalize -0.5 to 0.5
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return { 
    rotateX, 
    rotateY, 
    onMouseMove: handleMouseMove, 
    onMouseLeave: handleMouseLeave,
    whileHover: { scale: settings.scale }
  };
}

// scroll-based drawing for timeline
export function useRevealTimeline(ref) {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"],
  });

  return { scrollYProgress };
}
