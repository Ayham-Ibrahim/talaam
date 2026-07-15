import { useState } from "react";
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
  LogIn,
  UserCog,
  Crown,
  School,
  Landmark,
  ShieldCheck,
  ClipboardCheck,
  CreditCard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  TeacherCard,
  TeacherCardSkeleton,
} from "@/components/teacher/TeacherCard";
import { Card, Button, StarRating, Avatar, ErrorState } from "@/components/ui";
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
      <h2 className="text-center font-cairo text-2xl font-bold text-[#1E1E1E]">
        {t("home.educationTypesTitle")}
      </h2>
      <p className="mt-2 mb-8 text-center font-cairo text-lg text-[#626262]">
        {t("home.educationTypesSubtitle")}
      </p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {types.map((type) => {
          const Icon = EDUCATION_TYPE_ICONS[type.icon] || School;
          const style = EDUCATION_TYPE_STYLES[type.icon];
          return (
            <div
              key={type.icon}
              className="flex flex-col items-center gap-2 rounded-2xl bg-white px-4 pb-6 pt-2 text-center shadow-[0_1px_5px_rgba(0,0,0,0.1)]"
            >
              <div
                className="relative flex h-[90px] w-[90px] items-center justify-center overflow-hidden rounded-full"
                style={{ background: style.base }}
              >
                <div
                  className="absolute -left-1.5 -top-0.5 h-[110px] w-[42px] opacity-40"
                  style={{
                    background: style.shine,
                    transform: "rotate(-51.46deg)",
                  }}
                />
                <Icon size={36} className="relative z-10 text-white" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <h3 className="font-cairo text-xl font-bold text-[#1E1E1E]">
                  {type.title}
                </h3>
                <p className="font-cairo text-base leading-loose text-[#626262]">
                  {type.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- Why Choose Us ---------- */
const WHY_CHOOSE_US_ICONS = {
  verified: ShieldCheck,
  packages: ClipboardCheck,
  reschedule: CalendarClock,
  payment: CreditCard,
  live: Video,
  reviews: Star,
};
const WHY_CHOOSE_US_COLORS = {
  verified: "#4B6898",
  packages: "#2E9E6B",
  reschedule: "#7E57C2",
  payment: "#2F80ED",
  live: "#C2185B",
  reviews: "#F5A623",
};

export function WhyChooseUs() {
  const t = useT();
  const items = t("home.whyChooseUs");

  return (
    <section className="container-app mt-14">
      <h2 className="text-center font-cairo text-2xl font-bold text-[#1E1E1E]">
        {t("home.whyChooseUsTitle")}
      </h2>
      <p className="mt-2 mb-8 text-center font-cairo text-lg text-[#626262]">
        {t("home.whyChooseUsSubtitle")}
      </p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const Icon = WHY_CHOOSE_US_ICONS[item.icon] || ShieldCheck;
          const color = WHY_CHOOSE_US_COLORS[item.icon];

          return (
            <div
              key={item.icon}
              className="group relative overflow-hidden rounded-2xl bg-white px-6 py-7 text-right shadow-[0_1px_5px_rgba(0,0,0,0.1)]"
            >
              {/* Gradient fades in via opacity — background-color and background-image can't be transitioned into each other */}
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(272.4deg,#4B6898_2.51%,#4B68aa_93.94%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative z-10 flex flex-col items-end gap-3">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl transition-colors duration-300 group-hover:!bg-white/15"
                  style={{ background: `${color}1A` }}
                >
                  <Icon
                    size={26}
                    style={{ color }}
                    className="transition-colors duration-300 group-hover:!text-white"
                  />
                </div>
                <h3 className="font-cairo text-lg font-bold text-[#1E1E1E] transition-colors duration-300 group-hover:text-white">
                  {item.title}
                </h3>
                <p className="font-cairo text-sm leading-relaxed text-[#626262] transition-colors duration-300 group-hover:text-white/85">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- Featured Teachers ---------- */
export function FeaturedTeachers() {
  const t = useT();
  const { data, isLoading, isError, refetch } = useFeaturedTeachers();

  return (
    <section className="container-app mt-14">
      <h2 className="text-center font-bold text-2xl text-ink mb-8">
        {t("home.topTeachers")}
      </h2>
      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <TeacherCardSkeleton key={i} />
              ))
            : data.map((teacher) => (
                <TeacherCard key={teacher.id} teacher={teacher} />
              ))}
        </div>
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

export function StatsBand() {
  const { data, isLoading } = useStatsHook();

  return (
    <section className="container-app mt-14">
      <Card className="p-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {(isLoading ? Array.from({ length: 4 }) : data).map((stat, i) => {
            if (!stat) {
              return <div key={i} className="skeleton h-16 rounded-lg" />;
            }
            const Icon = STAT_ICONS[stat.icon] || Star;
            return (
              <div key={stat.key} className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center ${STAT_COLORS[stat.icon]}`}
                >
                  <Icon size={24} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-ink">
                    {formatCompact(stat.value)}
                  </div>
                  <div className="text-sm text-ink-soft">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </section>
  );
}

/* ---------- How It Works ---------- */
const STUDENT_ICONS = [Search, CalendarClock, Video, BarChart3];
const TEACHER_ICONS = [LogIn, UserCog, Crown, Video];
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
  const tabs = t("home.howItWorksTabs");
  const steps = role === "teacher" ? t("home.stepsTeacher") : t("home.steps");
  const icons = role === "teacher" ? TEACHER_ICONS : STUDENT_ICONS;

  return (
    <section className="container-app mt-20">
      <h2 className="text-center font-cairo text-2xl font-bold text-[#1E1E1E]">
        {t("home.howItWorksTitle")}
      </h2>
      <p className="mt-2 text-center font-cairo text-lg text-[#626262]">
        {t("home.howItWorksSubtitle")}
      </p>

      <div className="mx-auto mt-6 mb-12 flex w-full max-w-[291px] items-center gap-2 rounded-lg bg-[#F2F2F7] p-1">
        {["teacher", "student"].map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setRole(key)}
            className={`flex-1 rounded-lg py-2.5 font-cairo text-sm font-semibold transition-colors ${
              role === key
                ? "border border-[#4B6898] bg-[#4B6898] text-white"
                : "text-[#1E1E1E]"
            }`}
          >
            {tabs[key]}
          </button>
        ))}
      </div>

      <div className="relative mx-auto max-w-5xl">
        {/* Decorative dashed connectors */}
        <div className="pointer-events-none absolute inset-0 w-full hidden lg:block">
          {Array.from({ length: steps.length - 1 }).map((_, i) => {
            const pattern = CONNECTOR_PATTERNS[i % CONNECTOR_PATTERNS.length];
            const rowHeight = 100 / steps.length;
            const isThirdLine = i % CONNECTOR_PATTERNS.length === 2;
            const top = rowHeight * (i + 0.4) + (isThirdLine ? 8 : 0);
            return (
              <svg
                key={i}
                viewBox={pattern.viewBox}
                preserveAspectRatio="none"
                fill="none"
                className={`absolute   left-[25%] -translate-x-[50%]  ${
                  isThirdLine
                    ? "w-[50%] -right-[200px]"
                    : i % 2 === 1
                      ? "w-[50%] -right-7"
                      : " w-[33%] left-[35%]"
                }`}
                style={{ top: `${top}%`, height: `${25}%` }}
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

            const card = (
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
              <div key={`${role}-${step.no}`} className="flex">
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
              </div>
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
      <h2 className="text-center font-bold text-2xl text-ink mb-10">
        {t("home.testimonialsTitle")}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {testimonials.map((item) => (
          <Card key={item.id} className="p-6">
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
        ))}
      </div>
    </section>
  );
}

/* ---------- CTA ---------- */
export function CTASection() {
  const t = useT();
  const navigate = useNavigate();

  return (
    <section className="container-app mt-20">
      <div className="relative bg-primary rounded-card overflow-hidden px-8 py-12 lg:px-16 text-center">
        <div className="relative z-10">
          <h2 className="text-white font-bold text-2xl lg:text-3xl">
            {t("home.ctaTitle")}
          </h2>
          <p className="text-white/80 text-sm mt-3 mb-6">
            {t("home.ctaSubtitle")}
          </p>
          <Button variant="white" size="lg" onClick={() => navigate("/search")}>
            {t("home.ctaButton")}
          </Button>
        </div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-8 -mb-8" />
      </div>
    </section>
  );
}
