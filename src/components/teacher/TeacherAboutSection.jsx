import { useState } from "react";
import { Clock3, Play, PlayCircle, Quote, X } from "lucide-react";
import { YoutubeModal } from "@/components/common/YoutubeModal";
import { useT } from "@/hooks/useT";

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
    <div className="mt-4 flex flex-col gap-6 rounded-[28px] bg-white p-6 shadow-[0_10px_30px_rgba(17,24,39,0.06)] ring-1 ring-black/[0.03] sm:p-8 lg:flex-row lg:items-stretch">
      {/* Bio — end side (right in Arabic, left in English) */}
      {bio && (
        <div className="flex-1 text-start">
          <div className="flex items-center justify-start gap-3">
            <h3 className="text-lg font-bold text-[#1E1E1E] sm:text-xl">{t("teacher.about")}</h3>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#5FE4FF]/15 text-[#1FB8D6]">
              <Quote size={18} className="fill-[#5FE4FF]/25" />
            </span>
          </div>
          <p className="mt-4 whitespace-pre-line text-[15px] leading-[1.9] text-[#5B5B5B] sm:text-base">
            {bio}
          </p>
        </div>
      )}

      {/* Intro video — inline within the same card, start side, no longer a separate card */}
      {hasVideo && (
        <button
          type="button"
          onClick={() => setShowVideo(true)}
          aria-label={t("teacher.watchIntro")}
          className="group relative block min-h-[220px] flex-1 overflow-hidden rounded-2xl bg-[#1E1E1E] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(17,24,39,0.22)] lg:max-w-[340px]"
        >
          {poster && (
            <img
              src={poster}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
          {/* cinematic gradient — darker at the edges, clear in the middle for the play button */}
          <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/40 transition-colors group-hover:from-black/80" />

          {teacher.introVideoDuration && (
            <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
              <Clock3 size={12} />
              {teacher.introVideoDuration}
            </span>
          )}

          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_10px_28px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:scale-110">
              <Play size={22} className="ms-1 fill-[#1FB8D6] text-[#1FB8D6]" />
            </span>
          </span>

          <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium text-white ring-1 ring-white/25 backdrop-blur-sm">
            <PlayCircle size={14} />
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
