import { useState } from "react";
import { Play, Star, Briefcase, ShieldCheck } from "lucide-react";
import { FavoriteButton } from "@/components/ui";
import { YoutubeModal } from "@/components/common/YoutubeModal";
import { useT } from "@/hooks/useT";

/** رقاقة معلومات زجاجية (خلفية شفافة + تمويه) — تُستخدَم لمقياسَي الحصص المكتملة/الخبرة أسفل التقييم */
function MetaChip({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill bg-white/15 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
      <Icon size={14} />
      {children}
    </span>
  );
}

export function TeacherProfileHeader({ teacher, isFavorite, onToggleFavorite, onBookClick }) {
  const t = useT();
  const [showIntroVideo, setShowIntroVideo] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-card bg-profile-gradient shadow-lift">
      {/* توهّج خفيف خلف النص — يبقي التدرّج حيوياً بدل مسطّح تماماً */}
      <div className="pointer-events-none absolute -left-10 top-6 h-64 w-[50%] max-w-md rounded-full bg-white/25 blur-[150px]" />

      <div className="relative flex flex-col items-stretch gap-6 p-5 sm:flex-row sm:items-center sm:gap-8 sm:p-8 lg:p-10">
        {/*
          الصورة والفيديو عنصران منفصلان تماماً (لا طبقة تعتيم كاملة على
          الصورة تخفيها) — غلاف خارجي بلا overflow-hidden كي تظهر شارة
          الفيديو الصغيرة فوق حافة الصورة دون أن تُقصّها زوايا الصورة المدوَّرة.
        */}
        <div className="relative mx-auto shrink-0 sm:mx-0">
          <div className="h-48 w-48 overflow-hidden rounded-[28px] shadow-lift ring-4 ring-white/40 sm:h-56 sm:w-56 lg:h-60 lg:w-60">
            {teacher.avatar ? (
              <img src={teacher.avatar} alt={teacher.name} className="h-full w-full object-cover object-top" />
            ) : (
              <img src="/teacher.webp" alt={teacher.name} decoding="async" className="h-full w-full object-cover object-top" />
            )}
          </div>
          {onToggleFavorite && (
            <FavoriteButton active={isFavorite} onClick={onToggleFavorite} className="absolute left-3 top-3" />
          )}
          {/*
            عرض احترافي للفيديو التعريفي (رابط يوتيوب مخزَّن): بطاقة صغيرة
            بصورة يوتيوب المصغَّرة الفعلية + أيقونة تشغيل، عائمة عند حافة
            الصورة — عنصر مستقل واضح لا يُخفي صورة المعلم الحقيقية.
          */}
          {teacher.introYoutubeId && (
            <button
              type="button"
              onClick={() => setShowIntroVideo(true)}
              className="absolute bottom-3 left-3 flex items-center gap-2 rounded-2xl bg-white/95 py-1.5 ps-1.5 pe-3 shadow-lift backdrop-blur-sm transition-transform duration-150 hover:-translate-y-0.5"
            >
              <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl">
                <img
                  src={`https://img.youtube.com/vi/${teacher.introYoutubeId}/default.jpg`}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Play size={11} className="fill-white text-white" />
                </span>
              </span>
              <span className="text-xs font-bold text-ink">{t("teacher.watchIntro")}</span>
            </button>
          )}
        </div>

        {showIntroVideo && <YoutubeModal youtubeId={teacher.introYoutubeId} onClose={() => setShowIntroVideo(false)} />}

        {/* Text column */}
        <div className="flex-1 text-center sm:text-start">
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:justify-start">
            <h1 className="text-3xl font-extrabold text-white drop-shadow-sm sm:text-4xl">{teacher.name}</h1>
            {teacher.isVerified && (
              <span className="inline-flex items-center gap-1.5 rounded-pill bg-success px-3 py-1 text-xs font-bold text-white shadow-soft">
                <ShieldCheck size={13} />
                {t("teacher.verified")}
              </span>
            )}
          </div>
          <p className="mt-1 text-base font-bold text-white/85">{teacher.typeLabel}</p>

          <div className="mt-3 flex items-center justify-center gap-1.5 sm:justify-start">
            <Star size={16} className="fill-star text-star" />
            <span className="font-extrabold text-white">{teacher.rating}</span>
            <span className="text-sm text-white/75">
              ({teacher.reviewsCount} {t("teacher.reviews")})
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            {/*
              بيانات وهمية مؤقتة — لا عمود حقيقي لعدد الحصص الإجمالي المكتمل
              لكل معلم في الباك اند بعد (نفس حال avg_response_minutes).
            */}
            <MetaChip icon={Star}>{t("teacher.stats.completedSessionsFake")} {t("teacher.stats.completedSessionsLabel")}</MetaChip>
            {teacher.experienceLabel && <MetaChip icon={Briefcase}>{teacher.experienceLabel}</MetaChip>}
          </div>

          {teacher.badges?.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
              {teacher.badges.map((badge) => (
                <span
                  key={badge.id}
                  className="inline-flex items-center gap-1.5 rounded-pill bg-white/90 px-2.5 py-1.5 text-xs font-bold text-ink"
                >
                  {badge.name}
                  <span className="text-sm leading-none">{badge.icon}</span>
                </span>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-wrap justify-center gap-3 sm:justify-start">
            {onBookClick && (
              <button
                type="button"
                onClick={onBookClick}
                className="rounded-2xl bg-star px-8 py-3.5 text-base font-extrabold text-ink shadow-lift transition-transform duration-150 hover:-translate-y-0.5 hover:opacity-95"
              >
                {t("teacher.bookNow")}
              </button>
            )}
            {teacher.introYoutubeId && (
              <button
                type="button"
                onClick={() => setShowIntroVideo(true)}
                className="flex items-center gap-2 rounded-2xl border-2 border-white/70 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white/10"
              >
                <Play size={15} />
                {t("teacher.watchIntro")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
