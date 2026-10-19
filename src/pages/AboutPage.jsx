import { motion } from "framer-motion";
import {
  Check,
  X,
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
import { Seo } from "@/components/seo/Seo";
import { Card } from "@/components/ui";
import { StatsBand } from "@/components/home/sections";
import { SplitWords } from "@/motion/scroll/SplitWords";
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

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};
const viewportOnce = { once: true, amount: 0.3 };

/**
 * صفحة "من نحن" مبنية حول تمايز حقيقي عن أي منصة تدريس أخرى، لا نص عمومي
 * ("نلتزم بالجودة"، "نبني مجتمعاً") يصلح لأي موقع. ثلاث ركائز بدل الشبكات
 * الأيقونية العامة المعتادة: بيان افتتاحي جريء (manifesto)، مقارنة مباشرة
 * "نحن مقابل غيرنا" مبنية على آليات فعلية بالمنصة (توثيق المعلم، تسلسل
 * الموافقة قبل الدفع، كيان الدعم الأكاديمي المنفصل...)، ثم أرقام حقيقية
 * (StatsBand نفسها المستخدمة بالصفحة الرئيسية) بدل وعود.
 */
export function AboutPage() {
  const t = useT();
  const difference = t("about.difference");
  const values = t("about.values");
  const why = t("about.why");

  return (
    <PageContainer>
      <Seo
        title="من نحن | TAALAM"
        description="تعلّم ليست وسيطاً عادياً بين طالب ومعلم — توثيق فعلي لكل معلم، وحجز لا يتأكد إلا بموافقته شخصياً. تعرّف على ما يميزنا فعلياً عن أي منصة أخرى."
        path="/about"
      />
      {/* Hero */}
      <section className="container-app mt-8">
        <div className="relative overflow-hidden rounded-[24px] px-8 py-14 shadow-[0_1px_5px_rgba(0,0,0,0.1)] lg:px-16 lg:py-16">
          <motion.div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage:
                "linear-gradient(120deg, #4B6898, #243757, #35507D, #4B6898)",
              backgroundSize: "300% 300%",
            }}
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="pointer-events-none absolute -top-4 left-1/4 h-64 w-3/5 rounded-full bg-white/60 blur-[120px]" />

          <div className="relative z-10 flex items-center w-full justify-between gap-8">
            <div className="max-w-2xl text-start ">
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
                src="dark_mode_logo.png"
                alt=""
                loading="lazy"
                decoding="async"
                className="h-56 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* قصتنا — مكتوبة لتلامس القلق الحقيقي الذي يعيشه كل طالب متعثّر وكل أهل يبحثون عمّن يناسب ابنهم */}
      <section className="container-app mt-14">
        <motion.div initial="hidden" whileInView="visible" viewport={viewportOnce} variants={fadeUp}>
          <Card className="p-6 lg:p-8">
            <h2 className="mb-4 text-start font-cairo text-2xl font-bold text-ink">
              {t("about.storyTitle")}
            </h2>
            <p className="text-start font-cairo text-base leading-loose text-ink-soft">
              {t("about.storyP1")}
            </p>
            <p className="mt-4 text-start font-cairo text-base leading-loose text-ink-soft">
              {t("about.storyP2")}
            </p>
          </Card>
        </motion.div>
      </section>

      {/* Manifesto — بيان مباشر بعد القصة العاطفية */}
      <section className="container-app mt-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          className="mx-auto max-w-3xl text-center"
        >
          <SplitWords
            as="h2"
            className="font-cairo text-3xl font-bold text-ink lg:text-5xl"
            y={28}
            stagger={0.04}
            duration={0.7}
          >
            {t("about.manifestoTitle")}
          </SplitWords>
          <p className="mt-6 font-cairo text-lg leading-loose text-ink-soft">
            {t("about.manifestoText")}
          </p>
        </motion.div>
      </section>

      {/* الفرق الحقيقي — مقارنة مباشرة بدل شبكة "قيمنا" الأيقونية العامة */}
      <section className="container-app mt-20">
        <motion.div initial="hidden" whileInView="visible" viewport={viewportOnce} variants={fadeUp}>
          <h2 className="text-center font-cairo text-2xl font-bold text-ink lg:text-3xl">
            {t("about.differenceTitle")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center font-cairo text-sm text-ink-soft lg:text-base">
            {t("about.differenceSubtitle")}
          </p>
        </motion.div>

        <div className="mx-auto mt-10 flex max-w-4xl flex-col gap-4">
          {/* عناوين الأعمدة — مرة واحدة أعلى القائمة بدل تكرارها بكل صف */}
          <div className="hidden grid-cols-2 gap-4 px-2 sm:grid">
            <span className="text-end font-cairo text-xs font-bold uppercase tracking-wide text-ink-soft/70">
              {t("about.differenceThemLabel")}
            </span>
            <span className="text-start font-cairo text-xs font-bold uppercase tracking-wide text-primary">
              {t("about.differenceUsLabel")}
            </span>
          </div>

          {difference.map((row, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={fadeUp}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">
                <div className="flex items-start justify-end gap-3 sm:order-1 sm:border-e sm:border-line sm:pe-6">
                  <p className="text-end font-cairo text-sm leading-relaxed text-ink-soft sm:text-base">
                    {row.them}
                  </p>
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FDEFF2]">
                    <X size={14} className="text-accent-pink" />
                  </span>
                </div>
                <div className="flex items-start gap-3 sm:order-2">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Check size={14} className="text-primary" />
                  </span>
                  <p className="text-start font-cairo text-sm font-medium leading-relaxed text-ink sm:text-base">
                    {row.us}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Vision / Mission */}
      <section className="container-app mt-20">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex items-center justify-start gap-4 rounded-2xl bg-[#F7E6EE66] p-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#F7E6EE]">
              <img src="/eye.png" alt="" className="h-9 w-9 object-contain" />
            </div>
            <div className="text-start">
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
            <div className="text-start">
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

      {/* أرقام لا وعود — بدل شبكة "لماذا منصة تعلم" الأيقونية (مكررة مع الصفحة الرئيسية) */}
      <section className="mt-20 bg-[#FBF9FB] py-14">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          className="container-app"
        >
          <h2 className="text-center font-cairo text-2xl font-bold text-ink lg:text-3xl">
            {t("about.numbersTitle")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center font-cairo text-sm text-ink-soft lg:text-base">
            {t("about.numbersSubtitle")}
          </p>
        </motion.div>
        {/* StatsBand تضيف container-app/mt-14 الخاصين بها — لا تُلفّ بحاوية إضافية هنا */}
        <StatsBand />
      </section>

      {/* Values */}
      <section className="container-app mt-20">
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
