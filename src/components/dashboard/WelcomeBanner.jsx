import { motion } from "framer-motion";
import { useT } from "@/hooks/useT";

export function WelcomeBanner({
  name,
  sessionsThisWeek,
  imageSrc = "/student dashboard_heading.png",
  teal = false,
}) {
  const t = useT();

  return (
    <div className="relative overflow-hidden rounded-card px-6 py-16 shadow-soft sm:px-10">
      <motion.div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "linear-gradient(120deg, #243757, #4B6898, #35507D, #243757)",
          backgroundSize: "300% 300%",
        }}
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="pointer-events-none absolute left-24 -top-8 h-64 w-[60%] max-w-md rounded-full bg-white/30 blur-[120px]" />
      {teal && (
        <>
          <div className="pointer-events-none absolute left-14 top-16 h-64 w-64 rounded-full bg-[#6BCEEE] opacity-10" />
          <div className="pointer-events-none absolute left-0 top-3 h-64 w-64 rounded-full bg-[#6BCEEE] opacity-10" />
        </>
      )}

      <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
        <div className="text-right">
          <h1 className="flex items-center justify-end gap-2 text-xl font-bold text-white sm:text-2xl">
            {t("dashboard.welcome")} {name} 👋
          </h1>
          <p className="mt-2 text-sm font-medium text-white sm:text-base">
            {t("dashboard.welcomeSubtitlePrefix")} {sessionsThisWeek}{" "}
            {t("dashboard.welcomeSubtitleSuffix")}
          </p>
          <p className="mt-1 text-sm text-white/85">
            {t("dashboard.welcomeHint")}
          </p>
        </div>
      </div>

      {/* Flush against the banner's own left/bottom edge — absolute here ignores the banner's own padding */}
      <div className="absolute -bottom-6 -left-0 hidden h-36 w-64 md:w-[300px] md:h-[250px] overflow-hidden rounded-tr-2xl sm:block">
        <img
          src={imageSrc}
          alt=""
          className="h-full w-full object-contain"
          style={{ objectPosition: "37% 38%" }}
        />
      </div>
    </div>
  );
}
