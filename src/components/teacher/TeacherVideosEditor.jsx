import { useState } from 'react';
import { Play, Trash2, PlusCircle } from 'lucide-react';
import { YoutubeModal } from '@/components/common/YoutubeModal';
import { ApiErrorList } from '@/components/ui';
import { useT } from '@/hooks/useT';

/**
 * مكوّن قابل لإعادة الاستخدام بالكامل — بلا أي hook خاص بالمعلم أو الأدمن
 * بداخله عمداً: كل الصفحات الثلاث التي تستخدمه (CompleteTeacherProfilePage
 * أثناء إكمال الملف، TeacherSettingsPage لمعلم موثَّق مستمر، AdminTeacherProfileEditor
 * للأدمن نيابة عن المعلم) تُمرِّر أفعالها الخاصة (hooks مختلفة تماماً) — هذا
 * المكوّن لا يعرف من ينفّذ الفعل، فقط يعرض النموذج ويستدعي ما يُمرَّر إليه.
 *
 * الرابط المُدخَل (لأي صيغة يوتيوب معروفة) يُرسَل كما هو — التطبيع والتحقق
 * الفعليان يتمّان في الباك اند (App\Rules\ValidYoutubeVideo) قبل التخزين.
 */
export function TeacherVideosEditor({
  introYoutubeId,
  videos = [],
  onSaveIntro,
  isSavingIntro = false,
  introError = null,
  onAddVideo,
  isAddingVideo = false,
  addVideoError = null,
  onRemoveVideo,
  removingVideoId = null,
  maxVideos = 6,
}) {
  const t = useT();
  const [introInput, setIntroInput] = useState(introYoutubeId ?? '');
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [preview, setPreview] = useState(null);

  const canAddMore = videos.length < maxVideos;

  const handleAdd = () => {
    if (!newUrl.trim() || !onAddVideo) return;
    onAddVideo(
      { youtubeId: newUrl.trim(), title: newTitle.trim() || undefined },
      {
        onSuccess: () => {
          setNewUrl('');
          setNewTitle('');
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="text-sm font-semibold text-ink">{t('teacherVideos.introLabel')}</span>
        <p className="mt-0.5 text-xs text-ink-soft">{t('teacherVideos.introHint')}</p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            dir="ltr"
            value={introInput}
            onChange={(e) => setIntroInput(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="flex-1 rounded-btn border border-line bg-white p-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {introYoutubeId && (
            <button
              type="button"
              onClick={() => setPreview(introYoutubeId)}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink hover:border-primary sm:py-0"
            >
              <Play size={15} />
              {t('teacherVideos.preview')}
            </button>
          )}
          <button
            type="button"
            disabled={isSavingIntro || !onSaveIntro}
            onClick={() => onSaveIntro?.(introInput.trim())}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSavingIntro ? t('teacherVideos.saving') : t('teacherVideos.save')}
          </button>
        </div>
        {introError && <ApiErrorList error={introError} labelFor={() => null} className="mt-2 text-xs" />}
      </div>

      <div>
        <span className="text-sm font-semibold text-ink">
          {t('teacherVideos.videosLabel')} ({videos.length}/{maxVideos})
        </span>

        <ul className="mt-2 flex flex-col gap-2">
          {videos.map((v) => (
            <li key={v.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white p-3">
              <button
                type="button"
                onClick={() => onRemoveVideo?.(v.id)}
                disabled={removingVideoId === v.id}
                aria-label={t('teacherVideos.remove')}
                className="text-accent-pink hover:opacity-70 disabled:opacity-50"
              >
                <Trash2 size={16} />
              </button>
              <button type="button" onClick={() => setPreview(v.youtubeId)} className="flex flex-1 items-center justify-end gap-2 text-right">
                <span className="text-sm font-medium text-ink">{v.title || t('teacherVideos.untitled')}</span>
                <img
                  src={`https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg`}
                  alt=""
                  className="h-10 w-16 shrink-0 rounded-lg object-cover"
                />
              </button>
            </li>
          ))}
          {videos.length === 0 && <p className="text-sm text-ink-soft">{t('teacherVideos.empty')}</p>}
        </ul>

        {canAddMore && onAddVideo && (
          <div className="mt-3 flex flex-col gap-2 rounded-xl border border-dashed border-line bg-white p-3 sm:flex-row">
            <input
              type="text"
              dir="ltr"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 rounded-btn border border-line bg-white p-2.5 text-sm text-ink"
            />
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder={t('teacherVideos.titlePlaceholder')}
              className="flex-1 rounded-btn border border-line bg-white p-2.5 text-sm text-ink"
            />
            <button
              type="button"
              disabled={!newUrl.trim() || isAddingVideo}
              onClick={handleAdd}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <PlusCircle size={16} />
              {isAddingVideo ? t('teacherVideos.adding') : t('teacherVideos.add')}
            </button>
          </div>
        )}
        {addVideoError && <ApiErrorList error={addVideoError} labelFor={() => null} className="mt-2 text-xs" />}
      </div>

      <YoutubeModal youtubeId={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
