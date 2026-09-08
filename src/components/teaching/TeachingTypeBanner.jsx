import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useT } from "@/hooks/useT";
import { TEACHING_TYPE_CONFIG } from "./teachingTypeConfig";

/**
 * بانر صفحة نوع التعليم: العنوان + الوصف على جهة، وعنقود أيقونات نوع التعليم
 * على الجهة الأخرى. الألوان والأيقونات مصدرها teachingTypeConfig حسب الشريحة.
 */
export function TeachingTypeBanner({ slug, teachersCount }) {
  const t = useT();
  const cfg = TEACHING_TYPE_CONFIG[slug];
  const copy = t(`teachingType.types.${slug}`);
  const MainIcon = cfg.mainIcon;

  // مواضع الأقمار حول الأيقونة الرئيسية (نسبة مئوية داخل حاوية العنقود)
  const satellitePositions = [
    { top: "2%", left: "6%", size: 26, delay: 0 },
    { top: "8%", right: "2%", size: 30, delay: 0.4 },
    { bottom: "6%", left: "0%", size: 30, delay: 0.8 },
    { bottom: "0%", right: "10%", size: 24, delay: 1.2 },
  ];

  return (
    <section
      className="relative overflow-hidden rounded-card px-5 py-8 shadow-soft sm:px-10 sm:py-12"
      style={{
        backgroundImage: `linear-gradient(120deg, ${cfg.gradient.from} 0%, ${cfg.gradient.to} 100%)`,
      }}
    >
      {/* توهج ناعم خلف النص */}
      <div className="pointer-events-none absolute -right-16 top-0 h-64 w-[70%] max-w-md rounded-full bg-white/30 blur-[120px]" />

      <div className="relative z-10 flex flex-col gap-8 md:flex-row-reverse md:items-center md:justify-between">
        {/* عنقود الأيقونات — الجهة الأخرى من البانر */}
        <div className="relative mx-auto h-44 w-44 shrink-0 sm:h-52 sm:w-52 md:mx-0">
          {satellitePositions.map(({ delay, size, ...pos }, i) => {
            const SatIcon = cfg.satellites[i];
            if (!SatIcon) return null;
            return (
              <motion.div
                key={i}
                className="absolute flex items-center justify-center rounded-2xl border border-white/40 bg-white/15 p-2.5 backdrop-blur-sm"
                style={pos}
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay,
                }}
              >
                <SatIcon size={size} className="text-white drop-shadow" />
              </motion.div>
            );
          })}

          {/* الأيقونة الرئيسية */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[26%] border-2 border-white/50 bg-white/20 shadow-lg backdrop-blur-md sm:h-28 sm:w-28"
          >
            <MainIcon size={52} className="text-white drop-shadow" />
          </motion.div>
        </div>

        {/* النص */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-xl font-cairo text-center md:text-start"
        >
          <Link
            to="/"
            className="mb-4 inline-flex items-center gap-1.5 rounded-pill bg-white/20 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-white/30"
          >
            <ArrowRight size={14} />
            {t("teachingType.backToHome")}
          </Link>
          <h1 className="text-2xl font-bold text-white sm:text-4xl">
            {copy.title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/90 sm:text-base">
            {copy.description}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 md:justify-start">
            <span className="inline-flex items-center rounded-pill bg-white px-3 py-1 text-xs font-bold" style={{ color: cfg.accent }}>
              {copy.tagline}
            </span>
            {typeof teachersCount === "number" && teachersCount > 0 && (
              <span className="inline-flex items-center rounded-pill bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                {teachersCount} {t("teachingType.resultsCount")}
              </span>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
