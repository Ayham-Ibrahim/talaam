import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Search,
  ShieldCheck,
  Video,
  Clock,
  Headphones,
  CheckCircle2,
} from "lucide-react";
import { useT } from "@/hooks/useT";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { fadeUp, slideIn, staggerContainer } from "@/lib/motion";
import { BackgroundParticles } from "@/motion/components";

gsap.registerPlugin(ScrollTrigger);

function TypewriterBlock({ lines, className = "", speed = 90, pause = 2200 }) {
  const containerRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!containerRef.current || reducedMotion) return;
    const el = containerRef.current;
    let active = true;
    let current = "";
    let timer = null;

    // Build typed sequence: line1, then line2 with its own color wrapper
    const line1 = lines[0] || "";
    const line2 = lines[1] || "";

    const typeNext = () => {
      if (!active) return;
      const full = line1 + "\u00A0\u00A0" + line2;

      if (current.length < full.length) {
        current = full.slice(0, current.length + 1);
        el.innerHTML = render(current);
        timer = setTimeout(typeNext, speed);
      } else {
        timer = setTimeout(() => {
          current = "";
          el.innerHTML = render(current);
          timer = setTimeout(typeNext, speed);
        }, pause);
      }
    };

    const render = (text) => {
      if (text.length <= line1.length) {
        return `<span class="text-white">${escapeHtml(text)}</span>`;
      }
      const gap = "\u00A0\u00A0";
      if (text.length <= line1.length + gap.length) {
        return `<span class="text-white">${escapeHtml(line1)}</span>${escapeHtml(text.slice(line1.length))}`;
      }
      return `<span class="text-white">${escapeHtml(line1)}</span>${gap}<span class="text-[#1E1E1E]">${escapeHtml(text.slice(line1.length + gap.length))}</span>`;
    };

    const escapeHtml = (str) =>
      str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    // Reserve exact height by measuring full rendered text
    el.innerHTML = render(line1 + "\u00A0\u00A0" + line2);
    const computedHeight = el.offsetHeight;
    el.style.minHeight = `${computedHeight}px`;
    el.innerHTML = render("");

    timer = setTimeout(typeNext, 300);

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [lines, speed, pause, reducedMotion]);

  if (reducedMotion) {
    return (
      <span className={className}>
        <span className="block text-white">{lines[0]}</span>
        <span className="block text-[#1E1E1E]">{lines[1]}</span>
      </span>
    );
  }

  return (
    <span
      ref={containerRef}
      className={`${className} block whitespace-pre-wrap`}
      aria-label={`${lines[0]} ${lines[1]}`}
    />
  );
}

export function Hero() {
  const t = useT();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const heroRef = useRef(null);
  const subtitleRef = useRef(null);
  const contentRef = useRef(null);
  const photoRef = useRef(null);
  const glow1Ref = useRef(null);
  const glow2Ref = useRef(null);
  const glow3Ref = useRef(null);
  const reducedMotion = useReducedMotion();

  const featureIcons = [ShieldCheck, Video, Clock, Headphones];
  const features = t("home.features");

  const onSearch = () =>
    navigate(`/search${q ? `?q=${encodeURIComponent(q)}` : ""}`);

  useEffect(() => {
    if (reducedMotion || !heroRef.current) return;

    const ctx = gsap.context(() => {
      if (subtitleRef.current) {
        gsap.set(subtitleRef.current, { y: 20, opacity: 0 });
        gsap.to(subtitleRef.current, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          delay: 1.2,
        });
      }

      // Scroll parallax for hero layers
      if (contentRef.current) {
        gsap.to(contentRef.current, {
          y: -40,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });
      }

      if (photoRef.current) {
        gsap.to(photoRef.current, {
          y: 60,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });
      }

      // Mouse parallax via gsap.quickTo
      const layers = [
        { ref: glow1Ref, xTo: gsap.quickTo(glow1Ref.current, "x", { duration: 0.8, ease: "power3" }), yTo: gsap.quickTo(glow1Ref.current, "y", { duration: 0.8, ease: "power3" }), factor: 25 },
        { ref: glow2Ref, xTo: gsap.quickTo(glow2Ref.current, "x", { duration: 0.8, ease: "power3" }), yTo: gsap.quickTo(glow2Ref.current, "y", { duration: 0.8, ease: "power3" }), factor: 15 },
        { ref: glow3Ref, xTo: gsap.quickTo(glow3Ref.current, "x", { duration: 0.8, ease: "power3" }), yTo: gsap.quickTo(glow3Ref.current, "y", { duration: 0.8, ease: "power3" }), factor: 10 },
        { ref: photoRef, xTo: gsap.quickTo(photoRef.current, "x", { duration: 0.8, ease: "power3" }), yTo: gsap.quickTo(photoRef.current, "y", { duration: 0.8, ease: "power3" }), factor: 20 },
      ].filter((l) => l.ref.current);

      const handleMouseMove = (e) => {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const nx = (e.clientX - cx) / cx;
        const ny = (e.clientY - cy) / cy;
        layers.forEach((l) => {
          l.xTo(nx * l.factor);
          l.yTo(ny * l.factor);
        });
      };

      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }, heroRef);

    return () => ctx.revert();
  }, [reducedMotion, t]);

  return (
    <section className="container-app pt-6" ref={heroRef}>
      <div className="relative flex justify-center gap-8 overflow-hidden rounded-card px-6 py-10 shadow-soft sm:px-10 lg:gap-12 lg:py-14">
        {/* Animated gradient background — same brand blues, slowly drifting */}
        <motion.div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              "linear-gradient(120deg, #4B6898, #243757, #35507D, #4B6898)",
            backgroundSize: "300% 300%",
          }}
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Animated breathing background gradients */}
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(107,206,238,0.15)_0%,transparent_70%)] blur-2xl"
        />

        {/* Premium ambient particles */}
        <BackgroundParticles count={25} color="bg-white/30" />

        {/* Parallax teal glows behind the photo */}
        <div
          ref={glow1Ref}
          className="absolute -right-20 top-56 hidden h-72 w-72 rounded-full bg-[#6BCEEE] opacity-30 lg:block xl:h-[28rem] xl:w-[28rem] blur-[80px]"
        />
        <div
          ref={glow2Ref}
          className="absolute top-36 right-3 hidden h-72 w-72 rounded-full bg-[#6BCEEE] opacity-20 lg:block xl:h-[28rem] xl:w-[28rem] blur-[100px]"
        />
        {/* Soft white glow behind the text for contrast */}
        <div
          ref={glow3Ref}
          className="absolute -left-10 -top-10 h-64 w-[85%] max-w-xl rounded-full bg-white/60 blur-[150px]"
        />

        {/* Teacher photo (right side) with gentle float + parallax */}
        <motion.div
          ref={photoRef}
          initial="hidden"
          animate="visible"
          variants={slideIn(true, 50)}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="relative hidden w-[300px] shrink-0 lg:block xl:w-[430px] z-10"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="w-full h-full"
          >
            <img
              src="/hero-teacher.webp"
              alt=""
              fetchpriority="high"
              decoding="async"
              className="absolute -bottom-56 left-0 h-auto w-full rounded-2xl object-cover object-top"
            />
          </motion.div>
        </motion.div>

        {/* Text column (left side) */}
        <motion.div
          ref={contentRef}
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
              <TypewriterBlock
                lines={[t("home.heroTitle1"), t("home.heroTitle2")]}
                speed={90}
                pause={2200}
              />
            </h1>
          </motion.div>

          <motion.p
            ref={subtitleRef}
            variants={fadeUp}
            className="max-w-2xl text-sm leading-relaxed text-white lg:text-base"
          >
            {t("home.heroSubtitle")}
          </motion.p>

          {/* Interactive Search */}
          <motion.div variants={fadeUp} className="flex max-w-md mt-2">
            <motion.div
              animate={{
                boxShadow: focused
                  ? "0 0 0 4px rgba(255,255,255,0.2), 0 10px 30px rgba(0,0,0,0.15)"
                  : "0 4px 14px rgba(0,0,0,0.08)",
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
