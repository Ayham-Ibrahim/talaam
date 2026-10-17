import { useRef, useState } from 'react';
import { Image as ImageIcon, Trash2, UploadCloud, Download, X } from 'lucide-react';
import { ApiErrorList } from '@/components/ui';
import { FileTypeIcon } from './FileTypeIcon';
import { useT } from '@/hooks/useT';

const IMAGE_EXTENSIONS = ['jpeg', 'jpg', 'png'];

function isImageFile(file) {
  const ext = file.name.split('.').pop()?.toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
}

/**
 * غاليري نماذج أعمال الداعم الأكاديمي. لا تحويل تلقائي لمعاينة PPTX/XLSX
 * (يتطلب محرّك تحويل على السيرفر غير متوفر حالياً) — بدلاً منه الداعم يرفع
 * صورة مصغّرة اختيارية يدوياً مع الملف، وبلا رفعها تُعرَض أيقونة نوع الملف
 * الحديثة (FileTypeIcon) تلقائياً. مكوّن عرض بلا hooks بيانات، يستقبل كل شيء
 * props — يُستخدَم في SupporterSettingsPage فقط.
 */
export function AcademicSupporterGalleryEditor({ items = [], onAdd, isAdding = false, addError = null, onRemove, removingId = null, maxItems = 20 }) {
  const t = useT();
  const inputRef = useRef(null);
  const thumbInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingThumbnail, setPendingThumbnail] = useState(null);

  const canAddMore = items.length < maxItems;

  const stageFile = (file) => {
    if (!file) return;
    setPendingFile(file);
    setPendingThumbnail(null);
  };

  const cancelStaged = () => {
    setPendingFile(null);
    setPendingThumbnail(null);
  };

  const confirmUpload = () => {
    if (!pendingFile || !onAdd) return;
    onAdd(pendingFile, pendingThumbnail);
    setPendingFile(null);
    setPendingThumbnail(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-ink">
          {t('teacherGallery.listLabel')} ({items.length}/{maxItems})
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-ink-soft">{t('teacherGallery.empty')}</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => {
            const previewSrc = item.fileType === 'image' ? item.filePath : item.thumbnailPath;
            return (
              <div
                key={item.id}
                className="group relative aspect-square overflow-hidden rounded-2xl border border-line bg-canvas shadow-sm transition-shadow hover:shadow-lift"
              >
                {previewSrc ? (
                  <img src={previewSrc} alt={item.originalName} className="h-full w-full object-cover" />
                ) : (
                  <FileTypeIcon fileType={item.fileType} />
                )}

                {/* overlay اسم الملف المتحرك — ينزلق من الأسفل عند التحويم */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/80 to-transparent p-2.5 transition-transform duration-300 ease-out group-hover:translate-y-0">
                  <p className="truncate text-xs font-medium text-white">{item.originalName}</p>
                </div>

                <div className="absolute inset-0 flex items-start justify-between p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => onRemove?.(item.id)}
                    disabled={removingId === item.id}
                    aria-label={t('teacherGallery.remove')}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-accent-pink shadow-sm transition-colors hover:bg-white disabled:opacity-50"
                  >
                    <Trash2 size={15} />
                  </button>
                  <a
                    href={item.filePath}
                    download={item.originalName}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t('teacherGallery.download')}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-primary shadow-sm transition-colors hover:bg-white"
                  >
                    <Download size={15} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {canAddMore && onAdd && (
        pendingFile ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-sm font-semibold text-ink">{pendingFile.name}</p>
              <button type="button" onClick={cancelStaged} disabled={isAdding} aria-label={t('teacherGallery.cancel')} className="shrink-0 text-ink-soft hover:text-ink">
                <X size={16} />
              </button>
            </div>

            {!isImageFile(pendingFile) && (
              <div className="flex items-center gap-3">
                {pendingThumbnail ? (
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-line">
                    <img src={URL.createObjectURL(pendingThumbnail)} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPendingThumbnail(null)}
                      className="absolute -left-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-accent-pink shadow-sm"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => thumbInputRef.current?.click()}
                    className="flex items-center gap-1.5 rounded-xl border border-dashed border-line px-3 py-2 text-xs font-medium text-ink-soft hover:border-primary hover:text-primary"
                  >
                    <ImageIcon size={14} />
                    {t('teacherGallery.addThumbnail')}
                  </button>
                )}
                <span className="text-xs text-ink-soft">{t('teacherGallery.thumbnailHint')}</span>
                <input
                  ref={thumbInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => {
                    setPendingThumbnail(e.target.files?.[0] ?? null);
                    e.target.value = '';
                  }}
                />
              </div>
            )}

            <button
              type="button"
              disabled={isAdding}
              onClick={confirmUpload}
              className="rounded-xl bg-primary py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isAdding ? t('teacherGallery.uploading') : t('teacherGallery.confirmUpload')}
            </button>
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              stageFile(e.dataTransfer.files?.[0]);
            }}
            onClick={() => inputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
              dragOver ? 'border-primary bg-primary/5' : 'border-line bg-white hover:bg-canvas'
            }`}
          >
            <UploadCloud size={28} className={dragOver ? 'text-primary' : 'text-ink-soft'} />
            <p className="text-sm font-semibold text-ink">{t('teacherGallery.uploadLabel')}</p>
            <p className="text-xs text-ink-soft">{t('teacherGallery.uploadHint')}</p>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,application/pdf,.pptx,.ppt,.xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                stageFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </div>
        )
      )}

      {addError && <ApiErrorList error={addError} labelFor={() => null} className="text-xs" />}
    </div>
  );
}
