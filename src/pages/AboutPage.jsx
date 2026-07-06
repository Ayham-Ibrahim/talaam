import {
  Star,
  ShieldCheck,
  Rocket,
  UsersRound,
  Medal,
  Video,
  Lock,
  Headphones,
  CalendarClock,
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui";
import { useT } from "@/hooks/useT";

const VALUE_ICONS = {
  quality: Star,
  trust: ShieldCheck,
  growth: Rocket,
  community: UsersRound,
};
const VALUE_COLORS = {
  quality: "bg-[#FFFFDD] text-[#FFCC00]",
  trust: "bg-[#DAFFDF] text-[#34C759]",
  growth: "bg-[#FEEDEA] text-[#F74E28]",
  community: "bg-[#EDF0F5] text-[#4B6898]",
};

const WHY_ICONS = {
  teachers: Medal,
  sessions: Video,
  payment: Lock,
  reviews: Star,
  support: Headphones,
  booking: CalendarClock,
};

export function AboutPage() {
  const t = useT();
  const values = t("about.values");
  const why = t("about.why");

  return (
    <PageContainer>
      {/* Hero */}
      <section className="container-app mt-8">
        <div className="relative overflow-hidden rounded-[24px] bg-[linear-gradient(89.95deg,#4B6898_3.11%,#243757_98.69%)] px-8 py-14 shadow-[0_1px_5px_rgba(0,0,0,0.1)] lg:px-16 lg:py-16">
          <div className="pointer-events-none absolute -top-4 left-1/4 h-64 w-3/5 rounded-full bg-white/60 blur-[120px]" />

          <div className="relative z-10 flex items-center w-full justify-between gap-8">
            <div className="max-w-2xl text-right ">
              <h1 className="font-cairo text-3xl font-bold text-white lg:text-4xl">
                {t("about.heroTitle")}
              </h1>
              <p className="mt-4 font-cairo text-lg flex flex-col gap-4 font-medium leading-10 text-white lg:text-xl">
                <span>{t("about.heroSubtitle1")}</span>
                <span>{t("about.heroSubtitle2")}</span>
              </p>
            </div>
            <div className="hidden shrink-0 lg:block">
              <img
                src="/dark_mode_logo.png"
                alt=""
                className="h-56 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="container-app mt-14">
        <Card className="p-6 lg:p-8">
          <h2 className="mb-4 text-right font-cairo text-2xl font-bold text-ink">
            {t("about.storyTitle")}
          </h2>
          <p className="text-right font-cairo text-base leading-loose text-ink-soft">
            {t("about.storyP1")}
          </p>
          <p className="mt-4 text-right font-cairo text-base leading-loose text-ink-soft">
            {t("about.storyP2")}
          </p>
        </Card>

        {/* Vision / Mission */}
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex items-center justify-start gap-4 rounded-2xl bg-[#F7E6EE66] p-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#F7E6EE]">
              <img src="/eye.png" alt="" className="h-9 w-9 object-contain" />
            </div>
            <div className="text-right">
              <h3 className="mb-2 font-cairo text-2xl font-bold text-ink">
                {t("about.visionTitle")}
              </h3>
              <p className="font-cairo text-base text-ink-soft">
                {t("about.visionText")}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#EDF0F566] p-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#EDF0F5]">
              <img src="/goal.png" alt="" className="h-9 w-9 object-contain" />
            </div>
            <div className="text-right">
              <h3 className="mb-2 font-cairo text-2xl font-bold text-ink">
                {t("about.missionTitle")}
              </h3>
              <p className="font-cairo text-base text-ink-soft">
                {t("about.missionText")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="container-app mt-24">
        <h2 className="mb-8 text-center font-cairo text-2xl font-bold text-ink">
          {t("about.valuesTitle")}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => {
            const Icon = VALUE_ICONS[v.key] || Star;
            return (
              <Card
                key={v.key}
                className="flex flex-col items-center p-6 text-center"
              >
                <div
                  className={`mb-4 flex h-20 w-20 items-center justify-center rounded-full ${VALUE_COLORS[v.key]}`}
                >
                  <Icon size={32} />
                </div>
                <h3 className="mb-2 font-cairo text-lg font-bold text-ink">
                  {v.title}
                </h3>
                <p className="font-cairo text-sm leading-relaxed text-ink-soft">
                  {v.desc}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Why platform */}
      <section className="mt-14 bg-[#FBF9FB] py-10">
        <div className="container-app">
          <h2 className="mb-8 text-center font-cairo text-2xl font-bold text-ink">
            {t("about.whyTitle")}
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {why.map((w) => {
              const Icon = WHY_ICONS[w.key] || Star;
              return (
                <div
                  key={w.key}
                  className="flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-[0_1px_5px_rgba(0,0,0,0.1)]"
                >
                  <Icon size={32} className="mb-4 text-[#4B6898]" />
                  <h3 className="mb-2 font-cairo text-base font-bold text-[#4B6898]">
                    {w.title}
                  </h3>
                  <p className="font-cairo text-sm leading-relaxed text-ink-soft">
                    {w.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
