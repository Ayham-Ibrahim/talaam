import { useRef, useState } from 'react';
import { Trash2, UploadCloud, FileText, Presentation, Sheet as SheetIcon, Download } from 'lucide-react';
import { ApiErrorList } from '@/components/ui';
import { useT } from '@/hooks/useT';

const ICONS = { pdf: FileText, pptx: Presentation, xlsx: SheetIcon };

/**
 * غاليري نماذج أعمال الداعم الأكاديمي — صورة تُعرَض كخلفية البطاقة، أي نوع آخر
 * (pdf/pptx/xlsx) يعرض أيقونة ملونة. اسم الملف overlay متحرك يظهر عند التحويم،
 * تماماً كطلب التصميم. نفس فلسفة TeacherExperienceEditor (مكوّن عرض بلا hooks
 * داخلية، يستقبل كل شيء props) — يُستخدَم في TeacherSettingsPage فقط.
 */
export function TeacherGalleryEditor({ items = [], onAdd, isAdding = false, addError = null, onRemove, removingId = null, maxItems = 20 }) {
  const t = useT();
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const canAddMore = items.length < maxItems;

  const handleFile = (file) => {
    if (!file || !onAdd) return;
    onAdd(file);
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
            const Icon = ICONS[item.file_type] ?? FileText;
            return (
              <div
                key={item.id}
                className="group relative aspect-square overflow-hidden rounded-2xl border border-line bg-canvas shadow-sm transition-shadow hover:shadow-lift"
              >
                {item.file_type === 'image' ? (
                  <img src={item.file_path} alt={item.original_name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/10 to-accent-purple/10">
                    <Icon size={40} className="text-primary" />
                  </div>
                )}

                {/* overlay اسم الملف المتحرك — ينزلق من الأسفل عند التحويم */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/80 to-transparent p-2.5 transition-transform duration-300 ease-out group-hover:translate-y-0">
                  <p className="truncate text-xs font-medium text-white">{item.original_name}</p>
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
                    href={item.file_path}
                    download={item.original_name}
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
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
            dragOver ? 'border-primary bg-primary/5' : 'border-line bg-white hover:bg-canvas'
          }`}
        >
          <UploadCloud size={28} className={dragOver ? 'text-primary' : 'text-ink-soft'} />
          <p className="text-sm font-semibold text-ink">{isAdding ? t('teacherGallery.uploading') : t('teacherGallery.uploadLabel')}</p>
          <p className="text-xs text-ink-soft">{t('teacherGallery.uploadHint')}</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,application/pdf,.pptx,.ppt,.xlsx,.xls"
            className="hidden"
            disabled={isAdding}
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </div>
      )}

      {addError && <ApiErrorList error={addError} labelFor={() => null} className="text-xs" />}
    </div>
  );
}
