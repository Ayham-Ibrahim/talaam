import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Seo } from "@/components/seo/Seo";
import { Card, ErrorState, Skeleton } from "@/components/ui";
import { useLegalPage } from "@/hooks/useMeta";
import { useLocaleStore } from "@/store";
import { useT } from "@/hooks/useT";

/** نفس تدرّج هيرو About/Contact/HowItWorks حرفياً — هويتنا البصرية الفعلية، لا ألوان جديدة */
function LegalHero({ title, subtitle }) {
  return (
    <section className="container-app mt-8">
      <div className="relative overflow-hidden rounded-[24px] px-8 py-14 shadow-[0_1px_5px_rgba(0,0,0,0.1)] lg:px-16 lg:py-16">
        <motion.div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "linear-gradient(120deg, #4B6898, #243757, #35507D, #4B6898)",
            backgroundSize: "300% 300%",
          }}
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="pointer-events-none absolute -top-4 left-1/4 h-64 w-3/5 rounded-full bg-white/60 blur-[120px]" />

        <div className="relative z-10 flex items-center gap-5">
          <span className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm sm:flex">
            <ShieldCheck size={30} className="text-white" />
          </span>
          <div className="max-w-2xl text-start">
            <h1 className="font-cairo text-3xl font-bold text-white lg:text-4xl">{title}</h1>
            <p className="mt-3 font-cairo text-base leading-relaxed text-white/90 lg:text-lg">{subtitle}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * صفحة واحدة قابلة لإعادة الاستخدام لكل من سياسة الخصوصية والشروط والأحكام —
 * بـ slug فقط (راجع LegalPageController بالباك اند). محتوى مُهيكَل بأقسام
 * (sections[].title_ar/en + body_ar/en) قابل للتعديل الكامل من لوحة الأدمن؛
 * هذه الصفحة تعرضه فقط، ثنائية اللغة حسب useLocaleStore الحالي.
 */
export function LegalPage({ slug }) {
  const t = useT();
  const locale = useLocaleStore((s) => s.locale);
  const { data, isLoading, isError, refetch } = useLegalPage(slug);
  const sections = data?.sections ?? [];
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRefs = useRef([]);

  const pageTitle = slug === "privacy" ? t("legal.privacyTitle") : t("legal.termsTitle");
  const pageSubtitle = slug === "privacy" ? t("legal.privacySubtitle") : t("legal.termsSubtitle");

  useEffect(() => {
    if (!sections.length) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          const idx = Number(visible[0].target.dataset.index);
          setActiveIndex(idx);
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    sectionRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [sections.length]);

  const scrollToSection = (index) => {
    sectionRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <PageContainer>
      <Seo title={`${pageTitle} | TAALAM`} description={pageSubtitle} path={slug === "privacy" ? "/privacy-policy" : "/terms-conditions"} />

      <LegalHero title={pageTitle} subtitle={pageSubtitle} />

      <section className="container-app mt-14 mb-20">
        {isError ? (
          <ErrorState onRetry={refetch} />
        ) : isLoading ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
            <Skeleton className="hidden h-64 rounded-2xl lg:block" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-2xl" />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
            {/* Side nav — sticky, right in RTL */}
            <nav className="hidden lg:block">
              <div className="sticky top-24 flex flex-col gap-1 rounded-2xl border border-line bg-white p-3 shadow-card">
                {sections.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => scrollToSection(i)}
                    className={`rounded-xl px-4 py-2.5 text-start text-sm font-medium transition-colors ${
                      activeIndex === i ? "bg-primary text-white" : "text-ink-soft hover:bg-canvas"
                    }`}
                  >
                    {locale === "en" ? s.title_en : s.title_ar}
                  </button>
                ))}
              </div>
            </nav>

            {/* Sections */}
            <div className="flex flex-col gap-4">
              {sections.map((s, i) => (
                <div key={i} ref={(el) => (sectionRefs.current[i] = el)} data-index={i} className="scroll-mt-24">
                  <Card className="p-6 lg:p-8">
                    <h2 className="mb-3 text-start font-cairo text-xl font-bold text-ink">
                      {locale === "en" ? s.title_en : s.title_ar}
                    </h2>
                    <p className="whitespace-pre-line text-start font-cairo text-sm leading-loose text-ink-soft lg:text-base">
                      {locale === "en" ? s.body_en : s.body_ar}
                    </p>
                  </Card>
                </div>
              ))}

              {data?.updatedAt && (
                <p className="mt-2 text-end text-xs text-ink-soft">
                  {t("legal.lastUpdated")} {new Date(data.updatedAt).toLocaleDateString(locale === "en" ? "en-US" : "ar-EG")}
                </p>
              )}
            </div>
          </div>
        )}
      </section>
    </PageContainer>
  );
}
