import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Search,
  ShieldCheck,
  Video,
  Clock,
  Headphones,
  CheckCircle2,
} from "lucide-react";
import { useT } from "@/hooks/useT";
import { fadeUp, slideIn, staggerContainer } from "@/lib/motion";
import { useParallax } from "@/motion/hooks";
import { BackgroundParticles } from "@/motion/components";

export function Hero() {
  const t = useT();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const heroRef = useRef(null);
  
  // Parallax
  const { x: px1, y: py1 } = useParallax(15);
  const { x: px2, y: py2 } = useParallax(-10);
  const { x: px3, y: py3 } = useParallax(5);

  const featureIcons = [ShieldCheck, Video, Clock, Headphones];
  const features = t("home.features");

  const onSearch = () =>
    navigate(`/search${q ? `?q=${encodeURIComponent(q)}` : ""}`);

  return (
    <section className="container-app pt-6" ref={heroRef}>
      <div className="relative flex justify-center gap-8 overflow-hidden rounded-card bg-[linear-gradient(90deg,#4B6898_14.26%,#243757_101.43%)] px-6 py-10 shadow-soft sm:px-10 lg:gap-12 lg:py-14">
        
        {/* Animated breathing background gradients */}
        <motion.div 
          animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(107,206,238,0.15)_0%,transparent_70%)] blur-2xl" 
        />
        
        {/* Premium ambient particles */}
        <BackgroundParticles count={25} color="bg-white/30" />

        {/* Parallax teal glows behind the photo */}
        <motion.div 
          style={{ x: px1, y: py1 }}
          className="absolute -right-20 top-56 hidden h-72 w-72 rounded-full bg-[#6BCEEE] opacity-30 lg:block xl:h-[28rem] xl:w-[28rem] blur-[80px]" 
        />
        <motion.div 
          style={{ x: px2, y: py2 }}
          className="absolute top-36 right-3 hidden h-72 w-72 rounded-full bg-[#6BCEEE] opacity-20 lg:block xl:h-[28rem] xl:w-[28rem] blur-[100px]" 
        />
        {/* Soft white glow behind the text for contrast */}
        <motion.div 
          style={{ x: px3, y: py3 }}
          className="absolute -left-10 -top-10 h-64 w-[85%] max-w-xl rounded-full bg-white/60 blur-[150px]" 
        />

        {/* Teacher photo (right side) with gentle float + parallax */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={slideIn(true, 50)}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="relative hidden w-[300px] shrink-0 lg:block xl:w-[430px] z-10"
        >
          <motion.div 
            style={{ x: px1, y: py1 }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="w-full h-full"
          >
            <img
              src="/hero-teacher.png"
              alt=""
              className="absolute -bottom-56 left-0 h-auto w-full rounded-2xl object-cover object-top"
            />
          </motion.div>
        </motion.div>

        {/* Text column (left side) */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer(0.12)}
          className="relative z-10 flex max-w-xl flex-1 flex-col justify-center gap-5 font-cairo lg:max-w-[65%]"
        >
          <motion.span
            variants={fadeUp}
            whileHover={{ scale: 1.05 }}
            className="inline-flex w-fit items-center gap-1.5 rounded-pill bg-white px-3 py-1.5 text-xs font-semibold text-[#34C759] shadow-[0_4px_14px_rgba(0,0,0,0.1)] cursor-default transition-shadow hover:shadow-[0_4px_20px_rgba(52,199,89,0.2)]"
          >
            <CheckCircle2 size={16} /> {t("home.heroBadge")}
          </motion.span>

          <motion.div variants={fadeUp}>
            <h1 className="text-3xl font-bold leading-tight text-white lg:text-[48px]">
              {t("home.heroTitle1")}
            </h1>
            <h2 className="mt-1 text-2xl font-bold leading-tight text-[#1E1E1E] lg:text-[40px]">
              {t("home.heroTitle2")}
            </h2>
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="max-w-2xl text-sm leading-relaxed text-white/95 lg:text-base"
          >
            {t("home.heroSubtitle")}
          </motion.p>

          {/* Interactive Search */}
          <motion.div variants={fadeUp} className="flex max-w-md mt-2">
            <motion.div 
              animate={{ 
                boxShadow: focused 
                  ? "0 0 0 4px rgba(255,255,255,0.2), 0 10px 30px rgba(0,0,0,0.15)" 
                  : "0 4px 14px rgba(0,0,0,0.08)"
              }}
              className="flex flex-1 items-center overflow-hidden rounded-btn bg-white/95 transition-all duration-300 relative group"
            >
              <button
                onClick={onSearch}
                className="px-4 text-primary transition-transform duration-300 group-hover:scale-110 group-active:scale-95"
                aria-label="بحث"
              >
                <Search size={18} />
              </button>
              <input
                value={q}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSearch()}
                placeholder={t("home.heroSearchPlaceholder")}
                className="flex-1 bg-transparent py-3 pl-4 text-sm text-ink outline-none placeholder:text-ink-soft placeholder:transition-transform placeholder:duration-300 focus:placeholder:translate-x-1"
              />
            </motion.div>
          </motion.div>

          {/* Feature pills */}
          <motion.div variants={fadeUp} className="flex flex-wrap gap-4 mt-2">
            {features.map((f, i) => {
              const Icon = featureIcons[i];
              return (
                <motion.span
                  key={f}
                  whileHover={{ y: -2, color: "#fff" }}
                  className="inline-flex items-center gap-1.5 text-xs text-white/80 transition-colors cursor-default"
                >
                  <Icon size={14} className="text-[#6BCEEE]" /> {f}
                </motion.span>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
