import { useState } from "react";
import { CirclePlay, X } from "lucide-react";
import { YoutubeModal } from "@/components/common/YoutubeModal";
import { useT } from "@/hooks/useT";

const CARD = "rounded-[24px] shadow-[0px_1px_5px_rgba(0,0,0,0.1)]";

/** Lightweight overlay for an uploaded (non-YouTube) intro video */
function VideoModal({ src, onClose }) {
  if (!src) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <video
          src={src}
          controls
          autoPlay
          className="aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-lift"
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق"
          className="mx-auto mt-3 flex items-center gap-1.5 rounded-pill bg-white px-4 py-2 text-sm font-medium text-ink shadow-card hover:opacity-90"
        >
          <X size={16} />
          إغلاق
        </button>
      </div>
    </div>
  );
}

export function TeacherAboutSection({ teacher }) {
  const t = useT();
  const [showVideo, setShowVideo] = useState(false);

  const bio = teacher.bio?.trim();
  const hasVideo = Boolean(teacher.introYoutubeId || teacher.introVideoUrl);
  if (!bio && !hasVideo) return null;

  const poster = teacher.introYoutubeId
    ? `https://img.youtube.com/vi/${teacher.introYoutubeId}/hqdefault.jpg`
    : teacher.avatar || null;

  return (
    <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-stretch">
      {/* Bio — right in RTL */}
      {bio && (
        <div className={`flex-1 bg-white px-6 py-4 text-end sm:px-8 ${CARD}`}>
          <h3 className="text-lg font-bold text-[#2D2D2D]">{t("teacher.about")}</h3>
          <p className="mt-2 whitespace-pre-line text-[15px] leading-[32px] text-[#626262] sm:text-lg sm:leading-[34px]">
            {bio}
          </p>
        </div>
      )}

      {/* Intro video — left in RTL, equal-width card */}
      {hasVideo && (
        <button
          type="button"
          onClick={() => setShowVideo(true)}
          aria-label={t("teacher.watchIntro")}
          className={`group relative block min-h-[240px] flex-1 overflow-hidden bg-[#272727] ${CARD}`}
        >
          {poster && (
            <img
              src={poster}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
          <span className="absolute inset-0 bg-[#272727]/50 transition-colors group-hover:bg-[#272727]/40" />
          <span className="absolute inset-0 flex items-center justify-center">
            <CirclePlay size={48} strokeWidth={1.5} className="text-white transition-transform group-hover:scale-110" />
          </span>
          <span className="absolute bottom-4 right-6 text-lg font-medium text-white">
            {t("teacher.watchIntro")}
          </span>
        </button>
      )}

      {showVideo && teacher.introYoutubeId && (
        <YoutubeModal youtubeId={teacher.introYoutubeId} onClose={() => setShowVideo(false)} />
      )}
      {showVideo && !teacher.introYoutubeId && teacher.introVideoUrl && (
        <VideoModal src={teacher.introVideoUrl} onClose={() => setShowVideo(false)} />
      )}
    </div>
  );
}
