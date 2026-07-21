import { motion, useScroll, useTransform } from "framer-motion";
import { AmbientCanvas } from "./AmbientEngine";

// Premium Ambient layer mixing canvas nodes with slow moving blobs
export function AmbientBackground({ id }) {
  // Use scroll depth
  const { scrollYProgress } = useScroll();
  // Very slow background drifts tied to scroll 
  const yDrift = useTransform(scrollYProgress, [0, 1], [0, 150]);

  return (
    <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
      <motion.div style={{ y: yDrift }} className="absolute inset-0">
        <AmbientCanvas particleCount={30} />
      </motion.div>
      
      {id === "hero" ? (
         <motion.div 
          animate={{ scale: [1, 1.05, 1], opacity: [0.6, 0.4, 0.6] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(75,104,152,0.03)_0%,transparent_60%)] blur-[100px]" 
        />
      ) : id === "teachers" ? (
        <motion.div 
          animate={{ x: [-20, 20, -20], y: [-10, 10, -10] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 right-20 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(107,206,238,0.03)_0%,transparent_70%)] blur-[120px] rounded-full" 
        />
      ) : null}
    </div>
  );
}

export function SVGConnectionPath() {
   // Slowly draws a dashed connection curve connecting features
  return (
    <svg className="absolute w-full h-[300px] pointer-events-none z-0 opacity-20" preserveAspectRatio="none">
      <motion.path 
        d="M -100 150 Q 300 0, 600 150 T 1300 150"
        fill="transparent"
        stroke="#4B6898"
        strokeWidth="1"
        strokeDasharray="4 8"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-20% 0px" }}
        transition={{ duration: 3, ease: "easeOut" }}
      />
    </svg>
  );
}

// Wrapping layout structure for continuous experience
export function EcosystemSection({ children, id, className = "" }) {
  return (
    <section className={`relative mix-blend-[normal] ${className}`} id={id}>
      <AmbientBackground id={id} />
      <div className="relative z-10">
        {children}
      </div>
    </section>
  );
}