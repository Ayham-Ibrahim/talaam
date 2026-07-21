import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform, useMotionValue } from "framer-motion";

// High-performance canvas-based intelligent particles
export function AmbientCanvas({ 
  particleCount = 35, 
  color = "107, 206, 238", // #6BCEEE rgb 
  connectionDistance = 120 
}) {
  const canvasRef = useRef(null);
  
  // Track mouse directly on canvas
  const mouse = useRef({ x: 0, y: 0, radius: 100 });
  const isHovering = useRef(false);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    let particles = [];
    let animationFrameId;
    let width = canvas.width;
    let height = canvas.height;

    const initResize = () => {
      // Use parent dimensions
      width = canvas.parentElement.offsetWidth;
      height = canvas.parentElement.offsetHeight;
      canvas.width = width;
      canvas.height = height;
    };
    
    // Resize observe
    window.addEventListener("resize", initResize);
    initResize();

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.baseSize = Math.random() * 1.5 + 0.5;
        this.size = this.baseSize;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, 0.25)`;
        ctx.fill();
      }

      update() {
        // Very slow ambient movement
        if (this.x > width || this.x < 0) this.vx = -this.vx;
        if (this.y > height || this.y < 0) this.vy = -this.vy;

        this.x += this.vx;
        this.y += this.vy;

        // Mouse interaction (gentle repel)
        if (isHovering.current) {
          const dx = mouse.current.x - this.x;
          const dy = mouse.current.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.current.radius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (mouse.current.radius - distance) / mouse.current.radius;
            
            this.x -= forceDirectionX * force * 1.5;
            this.y -= forceDirectionY * force * 1.5;
          }
        }
        
        this.draw();
      }
    }

    // Init Particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const connect = () => {
      // Opt-out rendering of lines if performance is hurting, but fine for 35 particles
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < connectionDistance) {
            const opacity = 1 - distance / connectionDistance;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${color}, ${opacity * 0.15})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => p.update());
      connect();
      animationFrameId = requestAnimationFrame(animate);
    };

    // Observers to pause animation when offscreen
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animate();
      } else {
        cancelAnimationFrame(animationFrameId);
      }
    });
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener("resize", initResize);
    };
  }, [particleCount, color, connectionDistance]);

  const handleMouseMove = (e) => {
    isHovering.current = true;
    const rect = canvasRef.current.getBoundingClientRect();
    mouse.current.x = e.clientX - rect.left;
    mouse.current.y = e.clientY - rect.top;
  };
  
  const handleMouseLeave = () => {
    isHovering.current = false;
  };

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-auto"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    />
  );
}

// Global Cursor Light Engine Context (Vercel/Linear style glow)
export function CursorLight() {
  const [isMounted, setIsMounted] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Spring parameters to make it silky smooth
  const springConfig = { damping: 40, stiffness: 200, mass: 1 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    setIsMounted(true);
    // Ignore mobile devices entirely
    if (window.matchMedia("(max-width: 768px)").matches) return;

    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  if (!isMounted) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden mix-blend-screen hidden lg:block">
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full"
        style={{
          left: smoothX,
          top: smoothY,
          x: "-50%",
          y: "-50%",
          background: "radial-gradient(circle, rgba(107,206,238,0.03) 0%, rgba(255,255,255,0) 70%)"
        }}
      />
    </div>
  );
}
