import { Video, BarChart3, Bell, CalendarClock } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { HowItWorks } from "@/components/home/sections";
import { useT } from "@/hooks/useT";

const TOOL_ICONS = { video: Video, chart: BarChart3, bell: Bell };

export function HowItWorksPage() {
  const t = useT();
  const tools = t("howItWorksPage.tools");

  return (
    <PageContainer>
      {/* Hero */}
      <section className="container-app mt-8">
        <div className="relative overflow-hidden rounded-[24px] bg-hero-gradient px-8 py-6 shadow-[0_1px_5px_rgba(0,0,0,0.1)] lg:px-16 ">
          <div className="pointer-events-none absolute -top-8 left-1/4 h-64 w-3/5 rounded-full bg-white/40 blur-[150px]" />

          <div className="relative z-10 flex items-center justify-between gap-8">
            <div className="max-w-2xl text-right">
              <h1 className="font-cairo text-3xl font-bold text-white lg:text-4xl">
                {t("howItWorksPage.heroTitle")}
              </h1>
              <p className="mt-4 font-cairo text-lg font-medium text-white lg:text-xl">
                {t("howItWorksPage.heroSubtitle")}
              </p>
              <p className="mt-2 font-cairo text-base leading-loose text-white/90 lg:text-lg">
                {t("howItWorksPage.heroDesc")}
              </p>
            </div>
            <div className="hidden shrink-0 lg:block">
              <img
                src="/how_it_works/heading.png"
                alt=""
                className="h-72 w-auto object-cover drop-shadow-[0_12px_30px_rgba(0,0,0,0.25)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Steps (student/teacher toggle + connected timeline) */}
      <HowItWorks />

      {/* All learning tools in one place */}
      <section dir="rtl" className="container-app mt-24 mb-16">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="text-right">
            <h2 className="font-cairo text-2xl font-bold text-ink lg:text-3xl">
              {t("howItWorksPage.toolsTitle")}
            </h2>
            <p className="mt-4  font-cairo text-base leading-loose text-ink-soft lg:mr-0 lg:ml-auto">
              {t("howItWorksPage.toolsDesc")}
            </p>
            <ul className="mt-8 flex flex-col gap-7">
              {tools.map((tool, i) => {
                const Icon = TOOL_ICONS[tool.icon] || Video;
                const alignClass =
                  i === 0 ? "self-start" : i === 1 ? "self-center" : "self-end";
                return (
                  <li
                    key={tool.icon}
                    className={`flex items-center gap-3 ${alignClass}`}
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                      style={{ background: "#E7B2C9" }}
                    >
                      <Icon
                        size={20}
                        strokeWidth={1.75}
                        style={{ color: "#B00852" }}
                      />
                    </span>
                    <span className="font-cairo text-lg font-medium text-ink">
                      {tool.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div
            className="relative mx-auto w-full max-w-[600px]"
            style={{ aspectRatio: "600 / 406" }}
          >
            {/* Floating calendar bubble */}
            <div
              className="absolute z-20 flex items-center justify-center rounded-2xl bg-white shadow-lift"
              style={{
                left: "32%",
                top: "0%",
                width: "9.05%",
                height: "13.37%",
              }}
            >
              <CalendarClock size={22} className="text-primary" />
            </div>

            {/* Dashboard preview */}
            <img
              src="/how_it_works/dashboard.png"
              alt=""
              className="absolute object-contain"
              style={{
                left: "6.67%",
                top: "8.37%",
                width: "85.17%",
                height: "79.71%",
              }}
            />

            {/* Video call mockup */}
            <img
              src="/how_it_works/session.png"
              alt=""
              className="absolute z-20 object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.25)]"
              style={{
                left: "77.33%",
                top: "36.95%",
                width: "22.72%",
                height: "63.05%",
              }}
            />

            {/* Floating review card */}
            <img
              src="/how_it_works/rating.png"
              alt=""
              className="absolute z-20 object-contain"
              style={{
                left: "0%",
                top: "76.11%",
                width: "38.5%",
                height: "18.97%",
              }}
            />
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
