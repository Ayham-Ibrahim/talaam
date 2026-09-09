import { useState } from 'react';
import { Play, UserRound } from 'lucide-react';
import { YoutubeModal } from '@/components/common/YoutubeModal';
import { useT } from '@/hooks/useT';

/**
 * نبذة عن المعلم — بطاقة بيضاء مستقلة تحت البانر، ومعها بطاقة فيديو تعريفي
 * منفصلة (thumbnail حقيقي من يوتيوب) بجانب النص إن وُجد فيديو — لا تكرار
 * لصف الإحصائيات هنا بعد الآن (انتقل ليكون قسماً مستقلاً في TeacherProfilePage).
 */
export function TeacherAboutSection({ teacher }) {
  const t = useT();
  const [showIntroVideo, setShowIntroVideo] = useState(false);

  return (
    <div className="mt-6 rounded-2xl bg-white p-5 shadow-card sm:p-6">
      <div className="flex flex-col-reverse gap-5 sm:flex-row sm:items-start">
        <div className="flex-1">
          <h3 className="flex items-center gap-2 text-start font-bold text-ink">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-pink/10 text-accent-pink">
              <UserRound size={17} />
            </span>
            {t('teacher.aboutTitle')}
          </h3>
          {teacher.bio && <p className="mt-3 text-start text-sm leading-relaxed text-ink-soft">{teacher.bio}</p>}
        </div>

        {teacher.introYoutubeId && (
          <button
            type="button"
            onClick={() => setShowIntroVideo(true)}
            className="group relative w-full shrink-0 overflow-hidden rounded-2xl shadow-card sm:w-56"
          >
            <img
              src={`https://img.youtube.com/vi/${teacher.introYoutubeId}/mqdefault.jpg`}
              alt=""
              className="aspect-video w-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors group-hover:bg-black/35">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-lift">
                <Play size={18} className="fill-primary text-primary" />
              </span>
            </span>
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2.5 text-start text-xs font-bold text-white">
              {t('teacher.watchIntro')}
            </span>
          </button>
        )}
      </div>

      {showIntroVideo && <YoutubeModal youtubeId={teacher.introYoutubeId} onClose={() => setShowIntroVideo(false)} />}
    </div>
  );
}
