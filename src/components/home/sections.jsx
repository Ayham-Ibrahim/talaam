import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, animate } from "framer-motion";
import {
  fadeUp,
  scaleIn,
  slideIn,
  staggerContainer,
  viewportOnce,
} from "@/lib/motion";
import { useRevealTimeline } from "@/motion/hooks";
import { AnimatedCard } from "@/motion/components";
import {
  Star,
  GraduationCap,
  BookOpen,
  Users,
  Quote,
  Search,
  CalendarClock,
  Video,
  BarChart3,
  School,
  Landmark,
  ShieldCheck,
  ClipboardCheck,
  CreditCard,
  UserCheck,
  MonitorCheck,
  Trophy,
  CheckCircle2,
  MousePointerClick,
  Target,
  BadgeCheck,
  FileText,
  Share2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  TeacherCard,
  TeacherCardSkeleton,
} from "@/components/teacher/TeacherCard";
import { Card, StarRating, Avatar, ErrorState } from "@/components/ui";
import { useFeaturedTeachers } from "@/hooks/useTeachers";
import { useStats as useStatsHook } from "@/hooks/useMeta";
import { formatCompact } from "@/lib/formatters";
import { useT } from "@/hooks/useT";

/* ---------- Education Types ---------- */
const EDUCATION_TYPE_ICONS = {
  school: School,
  university: Landmark,
  courses: BookOpen,
};
const EDUCATION_TYPE_STYLES = {
  school: { base: "#6BCEEE", shine: "#60B9D6" },
  university: { base: "#4B6898", shine: "#445E89" },
  courses: { base: "#B00852", shine: "#9E074A" },
};

export function EducationTypes() {
  const t = useT();
  const types = t("home.educationTypes");

  return (
    <section className="container-app mt-14">
      <motion.h2
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={fadeUp}
        className="text-center font-cairo text-2xl font-bold text-[#1E1E1E]"
      >
        {t("home.educationTypesTitle")}
      </motion.h2>
      <motion.p
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={fadeUp}
        className="mt-2 mb-8 text-center font-cairo text-lg text-[#626262]"
      >
        {t("home.educationTypesSubtitle")}
      </motion.p>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer(0.12)}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 relative"
      >
        {types.map((type) => {
          const Icon = EDUCATION_TYPE_ICONS[type.icon] || School;
          const style = EDUCATION_TYPE_STYLES[type.icon];
          return (
            <AnimatedCard
              key={type.icon}
              variant={fadeUp}
              tilt={true}
              className="flex flex-col items-center gap-2 rounded-2xl bg-white px-4 pb-6 pt-2 text-center group"
            >
              <div
                className="relative flex h-[90px] w-[90px] items-center justify-center overflow-hidden rounded-full shadow-inner transition-transform duration-500 group-hover:scale-105"
                style={{ background: style.base }}
              >
                <div
                  className="absolute -left-1.5 -top-0.5 h-[110px] w-[42px] opacity-40 transition-transform duration-700 ease-out group-hover:translate-x-6"
                  style={{
                    background: style.shine,
                    transform: "rotate(-51.46deg)",
                  }}
                />

                {/* Micro particle pop on hover inside the circle */}
                <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div
                    className="absolute top-2 right-2 w-1.5 h-1.5 bg-white/60 rounded-full animate-ping"
                    style={{ animationDuration: "1.5s" }}
                  />
                  <div
                    className="absolute bottom-3 left-3 w-1 h-1 bg-white/40 rounded-full animate-ping"
                    style={{ animationDuration: "2s" }}
                  />
                </motion.div>

                <motion.div
                  transition={{ duration: 0.3 }}
                  className="group-hover:-translate-y-1 relative z-10"
                >
                  <Icon size={36} className="text-white drop-shadow-md" />
                </motion.div>
              </div>
              <div className="flex flex-col items-center gap-1 group-hover:-translate-y-0.5 transition-transform duration-300">
                <h3 className="font-cairo text-xl font-bold text-[#1E1E1E]">
                  {type.title}
                </h3>
                <p className="font-cairo text-base leading-loose text-[#626262]">
                  {type.desc}
                </p>
              </div>
            </AnimatedCard>
          );
        })}
      </motion.div>
    </section>
  );
}

/* ---------- Why Choose Us ---------- */
const WHY_CHOOSE_US_IMAGES = {
  certified: "/why_choose_us/3.png",
  quality: "/why_choose_us/2.png",
  support: "/why_choose_us/1.png",
  reports: "/why_choose_us/4.png",
  network: "/why_choose_us/5.png",
  reviews: "/why_choose_us/6.png",
};
const WHY_CHOOSE_US_BADGE_ICONS = {
  certified: UserCheck,
  quality: ShieldCheck,
  support: GraduationCap,
  reports: FileText,
  network: Share2,
  reviews: Users,
};
const WHY_CHOOSE_US_COLORS = {
  certified: "#8B7FD1",
  quality: "#2E9E6B",
  support: "#4A90E2",
  reports: "#F5A623",
  network: "#EC4899",
  reviews: "#FBBF24",
};

export function WhyChooseUs() {
  const t = useT();
  const items = t("home.whyChooseUs");

  return (
    <section className="container-app mt-14">
      <motion.h2
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={fadeUp}
        className="text-center font-cairo text-2xl font-bold text-[#1E1E1E]"
      >
        {t("home.whyChooseUsTitle")}
      </motion.h2>
      <motion.p
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={fadeUp}
        className="mt-2 mb-8 text-center font-cairo text-lg text-[#626262] max-w-2xl mx-auto"
      >
        {t("home.whyChooseUsSubtitle")}
      </motion.p>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer(0.08)}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {items.map((item) => {
          const BadgeIcon = WHY_CHOOSE_US_BADGE_ICONS[item.icon] || ShieldCheck;
          const color = WHY_CHOOSE_US_COLORS[item.icon];
          const image = WHY_CHOOSE_US_IMAGES[item.icon];

          return (
            <AnimatedCard
              key={item.icon}
              variant={fadeUp}
              tilt={true}
              className="group relative flex items-center gap-5 overflow-hidden rounded-3xl p-7 shadow-[0_4px_18px_rgba(0,0,0,0.05)] transition-shadow duration-300 hover:shadow-[0_8px_28px_rgba(0,0,0,0.09)]"
              style={{
                background: `linear-gradient(135deg, ${color}14, ${color}05 60%, ${color}05)`,
              }}
            >
              {/* Badge — top-right corner */}
              <span
                className="absolute -top-2 -right-2 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.12)]"
                style={{ color }}
              >
                <BadgeIcon size={18} />
              </span>

              {/* Text (first in DOM → renders on the right in RTL) */}
              <div className="flex-1 text-right">
                <h3 className="mb-2 font-cairo text-lg font-bold text-[#1E1E1E] sm:text-xl">
                  {item.title}
                </h3>
                <p className="font-cairo text-sm leading-relaxed text-[#626262]">
                  {item.desc}
                </p>
              </div>

              {/* Illustration (second in DOM → renders on the left in RTL) */}
              <div className="flex h-28 w-28 shrink-0 items-center justify-center transition-transform duration-300 group-hover:scale-105 sm:h-32 sm:w-32">
                <img
                  src={image}
                  alt=""
                  className="h-full w-full object-contain mix-blend-screen"
                />
              </div>
            </AnimatedCard>
          );
        })}
      </motion.div>
    </section>
  );
}

/* ---------- Featured Teachers ---------- */
export function FeaturedTeachers() {
  const t = useT();
  const { data, isLoading, isError, refetch } = useFeaturedTeachers();

  return (
    <section className="container-app mt-14">
      <motion.h2
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={fadeUp}
        className="text-center font-bold text-2xl text-ink mb-8"
      >
        {t("home.topTeachers")}
      </motion.h2>
      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer(0.08)}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <TeacherCardSkeleton key={i} />
              ))
            : data.map((teacher) => (
                <motion.div key={teacher.id} variants={fadeUp}>
                  <TeacherCard teacher={teacher} />
                </motion.div>
              ))}
        </motion.div>
      )}
    </section>
  );
}

/* ---------- Stats Band ---------- */
const STAT_ICONS = {
  star: Star,
  graduation: GraduationCap,
  book: BookOpen,
  users: Users,
};
const STAT_COLORS = {
  star: "text-star bg-star/10",
  graduation: "text-ink-soft bg-line/50",
  book: "text-price bg-price/10",
  users: "text-accent-pink bg-accent-pink/10",
};

import { Counter } from "@/components/ui";

function StatItem({ stat, started }) {
  const Icon = STAT_ICONS[stat.icon] || Star;

  return (
    <motion.div variants={fadeUp} className="flex items-center gap-4">
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center ${STAT_COLORS[stat.icon]}`}
      >
        <Icon size={24} />
      </div>
      <div>
        <div className="text-2xl font-bold text-ink flex items-center gap-1">
          {started && <Counter from={0} to={stat.value} duration={1.5} />}
          {stat.value >= 1000 && <span>K</span>}
        </div>
        <div className="text-sm text-ink-soft">{stat.label}</div>
      </div>
    </motion.div>
  );
}

export function StatsBand() {
  const { data, isLoading } = useStatsHook();
  const [started, setStarted] = useState(false);

  return (
    <section className="container-app mt-14">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={fadeUp}
        onViewportEnter={() => setStarted(true)}
      >
        <Card className="p-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={staggerContainer(0.1)}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {(isLoading ? Array.from({ length: 4 }) : data).map((stat, i) => {
              if (!stat) {
                return <div key={i} className="skeleton h-16 rounded-lg" />;
              }
              return <StatItem key={stat.key} stat={stat} started={started} />;
            })}
          </motion.div>
        </Card>
      </motion.div>
    </section>
  );
}

/* ---------- How It Works ---------- */
const STUDENT_ICONS = [Search, CalendarClock, Video, BarChart3];
const TEACHER_ICONS = [
  UserCheck,
  GraduationCap,
  MonitorCheck,
  ClipboardCheck,
  Trophy,
];
const CONNECTOR_PATTERNS = [
  {
    color: "#F74E28",
    viewBox: "0 0 199 188",
    path: "M198.298 1H62.3706C45.1267 1 28.6816 8.26882 17.0744 21.0212C-18.73 60.3579 9.17915 123.5 62.3706 123.5H119.798C155.42 123.5 184.298 152.378 184.298 188",
  },
  {
    color: "#6BCEEE",
    viewBox: "0 0 461 249",
    path: "M193.526 248H64.6259C47.0217 248 30.2076 240.692 18.1978 227.821C-19.6781 187.228 9.10695 121 64.6258 121H399.393C434.101 121 461.569 91.6398 459.26 57.0089C457.159 25.491 430.981 1 399.393 1H237.026",
  },
  {
    color: "#B00852",
    viewBox: "0 0 199 188",
    path: "M0 187H135.927C153.171 187 169.616 179.731 181.223 166.979C217.028 127.642 189.119 64.5 135.927 64.5H78.5C42.8776 64.5 14 35.6224 14 0",
  },
];

/* Card silhouette with a concave notch on one edge for the circle to nest into. */
function NotchedCardShape({ mirrored }) {
  return (
    <svg
      viewBox="0 0 517 133"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full drop-shadow-[0_4px_14px_rgba(0,0,0,0.12)] ${
        mirrored ? "-scale-x-100" : ""
      }`}
    >
      <path
        d="M510.252 109.164C510.252 117.856 503.206 124.902 494.515 124.902H7.53066C5.96751 124.902 6.42556 123.055 7.92422 122.611C31.3626 115.661 48.5795 92.5342 48.5795 65.0735C48.5794 37.5205 31.2464 14.3301 7.68728 7.46662C6.6415 7.16196 6.44141 5.90167 7.53066 5.90161H494.515C503.206 5.90161 510.252 12.9476 510.252 21.6393V109.164Z"
        fill="white"
        stroke="#E4E8E7"
        strokeWidth="1.3"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function HowItWorks() {
  const t = useT();
  const [role, setRole] = useState("teacher");
  const [openIndex, setOpenIndex] = useState(null);
  const [supportsHover, setSupportsHover] = useState(true);
  const tabs = t("home.howItWorksTabs");
  const steps = role === "teacher" ? t("home.stepsTeacher") : t("home.steps");
  const icons = role === "teacher" ? TEACHER_ICONS : STUDENT_ICONS;

  useEffect(() => {
    setSupportsHover(window.matchMedia("(hover: hover)").matches);
  }, []);

  return (
    <section className="container-app mt-20">
      <motion.h2
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={fadeUp}
        className="text-center font-cairo text-2xl font-bold text-[#1E1E1E]"
      >
        {t("home.howItWorksTitle")}
      </motion.h2>
      <motion.p
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={fadeUp}
        className="mt-2 text-center font-cairo text-lg text-[#626262]"
      >
        {t("home.howItWorksSubtitle")}
      </motion.p>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={fadeUp}
        className="mx-auto mt-6 mb-12 flex w-full max-w-[291px] items-center gap-2 rounded-lg bg-[#F2F2F7] p-1"
      >
        {["teacher", "student"].map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setRole(key);
              setOpenIndex(null);
            }}
            className={`flex-1 rounded-lg py-2.5 font-cairo text-sm font-semibold transition-colors duration-300 ${
              role === key
                ? "border border-[#4B6898] bg-[#4B6898] text-white shadow-sm"
                : "text-[#1E1E1E] hover:bg-black/5"
            }`}
          >
            {tabs[key]}
          </button>
        ))}
      </motion.div>

      <div className="relative mx-auto max-w-5xl">
        {/* Decorative dashed connectors */}
        <div className="pointer-events-none absolute inset-0 w-full hidden lg:block">
          {Array.from({ length: steps.length - 1 }).map((_, i) => {
            const patternIndex = i % CONNECTOR_PATTERNS.length;
            const pattern = CONNECTOR_PATTERNS[patternIndex];
            const rowHeight = 100 / steps.length;
            const isThirdLine = patternIndex === 2;
            const top =
              rowHeight * (i + 0.5) + (isThirdLine ? rowHeight * 0.12 : 0);
            return (
              <svg
                key={i}
                viewBox={pattern.viewBox}
                preserveAspectRatio="none"
                fill="none"
                className={`absolute   left-[25%] -translate-x-[50%]  ${
                  isThirdLine
                    ? "w-[50%] -right-[200px]"
                    : patternIndex === 1
                      ? "w-[50%] -right-7"
                      : " w-[33%] left-[35%]"
                }`}
                style={{ top: `${top}%`, height: `${rowHeight}%` }}
              >
                <path
                  d={pattern.path}
                  stroke={pattern.color}
                  strokeWidth="2"
                  strokeDasharray="8 8"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            );
          })}
        </div>

        <div className="relative flex flex-col gap-10 lg:gap-36">
          {steps.map((step, i) => {
            const Icon = icons[i];
            const mirrored = i % 2 === 1;
            const enumeration = (
              <div>
                <span
                  className={`absolute top-[16%] h-[74%] w-[5%] bg-[linear-gradient(180deg,#6BCEEE_42%,#4B6898_42%)] ${
                    mirrored
                      ? "right-[17%] rounded-r-full"
                      : "left-[17%] rounded-l-full"
                  }`}
                />
                <span
                  className={`absolute top-[47%] flex h-[18%] w-[25%] items-center justify-center bg-[#4B6898] font-cairo text-sm font-bold text-white ${
                    mirrored
                      ? "-right-[5%] rounded-r-full"
                      : "-left-[5%] rounded-l-full"
                  }`}
                >
                  {step.no}
                </span>
              </div>
            );
            const circle = (
              <div
                className={`relative z-10 flex h-[90px] w-[90px] shrink-0 items-center justify-center rounded-full border border-[#E4E8E7] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.12)] lg:h-24 lg:w-24 
              ${mirrored ? "-mr-4 lg:mr-12" : "-ml-4 lg:ml-12"}
              `}
              >
                <div className="flex h-[92%] w-[92%] items-center justify-center rounded-full border border-[#E4E8E7] bg-[#EDF0F5]">
                  <div className="flex h-[78%] w-[78%] items-center justify-center rounded-full bg-[#4B6898]">
                    <Icon className="text-white" size={26} />
                  </div>
                </div>
              </div>
            );

            const title = (
              <h3 className="text-center text-base font-bold text-[#4B6898] sm:text-xl">
                {step.title}
              </h3>
            );
            const desc = (
              <p className="max-w-[240px] text-center text-sm text-[#2D2D2D] sm:text-base">
                {step.desc}
              </p>
            );
            const divider = (
              <span className="h-12 w-px shrink-0 bg-line sm:h-16" />
            );
            const hasItems = Array.isArray(step.items);
            const isOpen = openIndex === i;
            const revealHandlers = hasItems
              ? supportsHover
                ? {
                    onMouseEnter: () => setOpenIndex(i),
                    onMouseLeave: () =>
                      setOpenIndex((cur) => (cur === i ? null : cur)),
                    onFocus: () => setOpenIndex(i),
                    onBlur: () =>
                      setOpenIndex((cur) => (cur === i ? null : cur)),
                  }
                : {
                    onClick: () =>
                      setOpenIndex((cur) => (cur === i ? null : i)),
                  }
              : {};

            const card = hasItems ? (
              <motion.div
                {...revealHandlers}
                tabIndex={0}
                role="button"
                aria-expanded={isOpen}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.99 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className={`relative flex-1 cursor-pointer select-none outline-none ${mirrored ? "-mr-8" : "-ml-8"}`}
              >
                <NotchedCardShape mirrored={mirrored} />
                <div className="relative z-10 flex min-h-24 flex-col items-center justify-center gap-2 px-8 py-5 font-cairo lg:min-h-28 sm:px-12">
                  {title}
                  <AnimatePresence initial={false} mode="wait">
                    {isOpen ? (
                      <motion.ul
                        key="items"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: "easeInOut" }}
                        className="flex w-full flex-col gap-1.5 overflow-hidden"
                      >
                        {step.items.map((item, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-sm text-[#2D2D2D] sm:text-base"
                          >
                            <CheckCircle2
                              size={16}
                              className="mt-0.5 shrink-0 text-[#6BCEEE]"
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </motion.ul>
                    ) : (
                      <motion.span
                        key="hint"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#4B6898]/70"
                      >
                        <motion.span
                          animate={{ x: [0, 3, 0] }}
                          transition={{
                            duration: 1.4,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          <MousePointerClick size={14} />
                        </motion.span>
                        {supportsHover
                          ? "مرر للاطلاع على التفاصيل"
                          : "اضغط للاطلاع على التفاصيل"}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <span
                    className={`absolute top-1 h-[90%] w-[3%] bg-[linear-gradient(180deg,#6BCEEE_42%,#4B6898_42%)] ${
                      mirrored
                        ? "left-[0%] rounded-l-full"
                        : "right-[0%] rounded-r-full"
                    }`}
                  />
                  <span
                    className={`absolute top-[47%] flex h-[18%] w-[8%] items-center justify-center bg-[#4B6898] font-cairo text-sm font-bold text-white ${
                      mirrored
                        ? "left-[0%] rounded-r-full"
                        : "right-[0%] rounded-l-full"
                    }`}
                  >
                    {step.no}
                  </span>
                </div>
              </motion.div>
            ) : (
              <div
                className={`relative h-24 flex-1 lg:h-28 ${mirrored ? "-mr-8" : "-ml-8"}`}
              >
                <NotchedCardShape mirrored={mirrored} />
                <div className="relative z-10 flex h-full items-center justify-center gap-4 px-6 font-cairo sm:gap-6 sm:px-10">
                  {mirrored ? (
                    <>
                      {title}
                      {divider}
                      {desc}
                      <span
                        className={`absolute top-1 h-[90%] w-[3%]  bg-[linear-gradient(180deg,#6BCEEE_42%,#4B6898_42%)] ${
                          mirrored
                            ? "left-[0%] rounded-l-full"
                            : "right-[0 %] rounded-r-full"
                        }`}
                      />
                      <span
                        className={`absolute top-[47%] flex h-[18%] w-[8%] items-center justify-center bg-[#4B6898] font-cairo text-sm font-bold text-white ${
                          mirrored
                            ? "left-[0%] rounded-r-full"
                            : "right-[0%] rounded-l-full"
                        }`}
                      >
                        {step.no}
                      </span>
                    </>
                  ) : (
                    <>
                      {desc}
                      {divider}
                      {title}
                      <span
                        className={`absolute top-1 h-[90%] w-[3%] bg-[linear-gradient(180deg,#6BCEEE_42%,#4B6898_42%)] ${
                          mirrored
                            ? " left-[0%] rounded-l-full"
                            : "right-[0%] rounded-r-full "
                        }`}
                      />
                      <span
                        className={`absolute top-[47%] flex h-[18%] w-[8%] items-center justify-center bg-[#4B6898] font-cairo text-sm font-bold text-white ${
                          mirrored
                            ? "left-[0%]  rounded-r-full"
                            : " right-[0%] rounded-l-full"
                        }`}
                      >
                        {step.no}
                      </span>
                    </>
                  )}
                </div>
              </div>
            );

            return (
              <motion.div
                key={`${role}-${step.no}`}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
                variants={slideIn(mirrored, 40)}
                className="flex"
              >
                <div
                  className={`flex flex-row-reverse w-full items-center lg:w-[58%] ${mirrored ? "mr-auto" : "ml-auto"}`}
                >
                  {mirrored ? (
                    <>
                      {card}
                      {circle}
                    </>
                  ) : (
                    <>
                      {circle}
                      {card}
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- Testimonials ---------- */
export function Testimonials() {
  const t = useT();
  const testimonials = Array.from({ length: 3 }).map((_, i) => ({
    id: i,
    name: "عبدالله سليم",
    role: "طالب لغة انكليزية",
    rating: 4.9,
    text: "منصة رائعة المعلم يشرح بطريقة سهلة ومبسطة والدعم والتواصل جيد انصح الجميع بتجربتها",
  }));

  return (
    <section className="container-app mt-20">
      <motion.h2
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={fadeUp}
        className="text-center font-bold text-2xl text-ink mb-10"
      >
        {t("home.testimonialsTitle")}
      </motion.h2>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={staggerContainer(0.12)}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {testimonials.map((item) => (
          <motion.div
            key={item.id}
            variants={fadeUp}
            whileHover={{
              y: -6,
              transition: { type: "spring", stiffness: 300, damping: 22 },
            }}
          >
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <Quote className="text-accent-purple/30" size={28} />
              </div>
              <p className="text-sm text-ink-soft leading-relaxed mb-5">
                {item.text}
              </p>
              <div className="flex items-center justify-between">
                <StarRating value={item.rating} size={13} />
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-ink">
                      {item.name}
                    </div>
                    <div className="text-xs text-ink-soft">{item.role}</div>
                  </div>
                  <Avatar name={item.name} size="sm" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/* ---------- CTA ---------- */
import { BackgroundParticles } from "@/motion/components";

export function CTASection() {
  const t = useT();
  const navigate = useNavigate();

  return (
    <section className="container-app mt-20 relative">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        variants={scaleIn}
        className="relative overflow-hidden rounded-[24px] bg-[#4B6898] px-6 py-10 lg:min-h-[241px] lg:px-16 lg:py-0 group"
        style={{
          boxShadow:
            "0px 1px 5px rgba(0,0,0,0.1), inset 4px 4px 2px #5A75A2, inset -4px -4px 2px #5A75A2",
        }}
      >
        <BackgroundParticles count={15} color="bg-white/20" />

        {/* Soft scrolling breathing glow */}
        <motion.div
          animate={{ x: ["-10%", "10%", "-10%"], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(107,206,238,0.25)_0%,transparent_60%)] blur-2xl z-0"
        />

        <motion.img
          variants={slideIn(false, 60)}
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          src="/ea5159b8-ad3f-4475-a944-b21119d7ce97 1.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-0 hidden w-[220px] lg:block lg:left-10 lg:w-[280px] z-10"
        />
        <motion.div
          variants={staggerContainer(0.12)}
          className="relative z-10 mx-auto flex max-w-md flex-col items-center gap-6 py-4 text-center lg:mx-0 lg:ml-auto lg:mr-24 lg:max-w-[547px] lg:items-start lg:py-[25px] lg:text-right"
        >
          <motion.div variants={fadeUp} className="flex flex-col gap-0.5">
            <h2 className="font-cairo text-2xl font-bold leading-snug text-white lg:text-[32px] lg:leading-[60px]">
              {t("home.ctaTitle")}
            </h2>
            <p className="font-cairo text-sm font-medium text-white lg:text-lg lg:leading-[34px]">
              {t("home.ctaSubtitle")}
            </p>
          </motion.div>
          <motion.button
            variants={fadeUp}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 20px rgba(255,255,255,0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => navigate("/search")}
            className="group/btn flex items-center justify-center gap-2.5 rounded-xl border border-white bg-white px-8 py-2.5 font-cairo text-sm font-medium text-[#4B6898] transition-all relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2.5">
              {t("home.ctaButton")}
              <Target
                size={24}
                className="transition-transform duration-300 group-hover/btn:scale-110"
              />
            </span>
            <div className="absolute inset-0 bg-white/20 blur-md transform -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-in-out" />
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
}
