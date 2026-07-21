import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { fadeUp, viewportOnce } from "./variants";
import { useMouseTilt } from "./hooks";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { useRef, useEffect } from "react";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function AnimatedSection({ 
  children, 
  className, 
  variant = fadeUp, 
  delay = 0,
  StaggerWrapper = false 
}) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={variant}
      transition={{ delay }}
      className={cn("", className)}
    >
      {children}
    </motion.section>
  );
}

export function AnimatedCard({ children, className, variant = fadeUp, tilt = true }) {
  const ref = useRef(null);
  const tiltProps = useMouseTilt(ref, { scale: 1.02, maxTilt: 3 });
  
  // Premium subtle card reflection following mouse point
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove(e) {
    if (tilt) tiltProps.onMouseMove(e);
    if (!ref.current) return;
    const { left, top } = ref.current.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  }
  
  function handleMouseLeave() {
    if (tilt) tiltProps.onMouseLeave();
    mouseX.set(0);
    mouseY.set(0);
  }

  const background = useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(107,206,238,0.06), transparent 80%)`;

  return (
    <motion.div
      ref={ref}
      variants={variant}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={tilt ? { rotateX: tiltProps.rotateX, rotateY: tiltProps.rotateY } : {}}
      whileHover={tilt ? tiltProps.whileHover : { y: -4, scale: 1.01 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn("transition-shadow duration-300 hover:shadow-2xl hover:shadow-black/5 relative z-10 overflow-hidden", className)}
    >
      <motion.div 
         className="pointer-events-none absolute inset-0 z-20 mix-blend-screen opacity-0 transition-opacity duration-500 group-hover:opacity-100"
         style={{ background }}
      />
      {children}
    </motion.div>
  );
}

export function BackgroundParticles({ count = 20, color = "bg-primary/20", className }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            opacity: 0, 
            y: Math.random() * window.innerHeight,
            x: Math.random() * window.innerWidth 
          }}
          animate={{
            opacity: [0, Math.random() * 0.3 + 0.1, 0],
            y: [null, Math.random() * -150 - 50],
            x: [null, Math.random() * 50 - 25]
          }}
          transition={{
            duration: Math.random() * 15 + 10,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 10
          }}
          className={cn("absolute h-1 w-1 rounded-full blur-[1px]", color)}
        />
      ))}
    </div>
  );
}
