import { useState } from "react";
import { Play } from "lucide-react";
import { Pill } from "@/components/ui";
import { YoutubeModal } from "@/components/common/YoutubeModal";

// Drawn from the app's own identity palette (accent-pink, primary, star, accent-purple, success, price)
const IDENTITY_DOT_COLORS = ["#C2185B", "#4B6898", "#F5A623", "#7E57C2", "#2E9E6B", "#2F80ED"];

export function InfoSection({ title, items = [], colorfulDots = false }) {
  if (!items.length) return null;

  return (
    <div className="mt-6 rounded-2xl bg-white p-5 text-start shadow-card sm:flex sm:items-start sm:gap-6">
      <h3 className="mb-3 font-bold text-ink sm:mb-0 sm:w-52 sm:shrink-0 sm:pt-1.5">{title}</h3>
      <div className="flex flex-1 flex-wrap justify-start gap-2">
        {items.map((item, i) => {
          const isObject = typeof item === "object" && item !== null;
          const label = isObject ? item.label : item;
          const flag = isObject ? item.flag : null;
          return (
            <Pill
              key={label}
              icon={flag}
              dot={flag ? null : colorfulDots ? IDENTITY_DOT_COLORS[i % IDENTITY_DOT_COLORS.length] : "#C7D0DF"}
            >
              {label}
            </Pill>
          );
        })}
      </div>
    </div>
  );
}

/** فيديوهات إضافية (بخلاف الفيديو التعريفي المعروض في رأس الصفحة) — كل بطاقة تفتح مشغّل يوتيوب مضمَّن */
export function VideosSection({ title, videos = [] }) {
  const [preview, setPreview] = useState(null);

  if (!videos.length) return null;

  return (
    <div className="mt-6 rounded-2xl bg-white p-5 shadow-card">
      <h3 className="mb-3 text-start font-bold text-ink">{title}</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {videos.map((video) => (
          <button
            key={video.id}
            type="button"
            onClick={() => setPreview(video.youtubeId)}
            className="group relative overflow-hidden rounded-xl bg-canvas text-start"
          >
            <img
              src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
              alt={video.title || ""}
              className="aspect-video w-full object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/35">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
                <Play size={16} className="fill-primary text-primary" />
              </span>
            </span>
            {video.title && (
              <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent p-2 text-xs font-medium text-white">
                {video.title}
              </span>
            )}
          </button>
        ))}
      </div>

      <YoutubeModal youtubeId={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
