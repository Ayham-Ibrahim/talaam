import { X } from 'lucide-react';

/**
 * مشغّل يوتيوب مضمَّن (iframe رسمي) داخل نافذة منبثقة — يُستخدم لمعاينة الفيديو
 * التعريفي وقائمة الفيديوهات، سواء أثناء تعديل المعلم/الأدمن لها أو عرضها
 * فعلياً للطالب في بروفايل المعلم العام.
 */
export function YoutubeModal({ youtubeId, onClose }) {
  if (!youtubeId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-lift">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>
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
