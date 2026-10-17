import { Download } from 'lucide-react';
import { FileTypeIcon } from './FileTypeIcon';
import { useT } from '@/hooks/useT';

/**
 * نماذج أعمال/اساينمنتس حقيقية دعم بها الداعم طلاباً سابقين. صورة/PDF قابلة
 * للمعاينة المباشرة (فتح بتبويب جديد)، PPT/Excel للتنزيل فقط. تُعرَض الصورة
 * المصغّرة التي رفعها الداعم يدوياً إن وُجدت، وإلا أيقونة نوع الملف الافتراضية.
 * اسم الملف overlay متحرك عند التحويم — يوازي AcademicSupporterGalleryEditor بلوحة الداعم.
 */
export function AssignmentsGallerySection({ items = [] }) {
  const t = useT();

  if (!items.length) return null;

  return (
    <div className="mt-6 rounded-2xl bg-white p-5 shadow-card">
      <h3 className="mb-1 text-start font-bold text-ink">{t('academicSupporter.assignmentsGallery.title')}</h3>
      <p className="mb-3 text-start text-sm text-ink-soft">{t('academicSupporter.assignmentsGallery.hint')}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => {
          const isPreviewable = item.fileType === 'image' || item.fileType === 'pdf';
          const previewSrc = item.fileType === 'image' ? item.filePath : item.thumbnailPath;

          return (
            <a
              key={item.id}
              href={item.filePath}
              target="_blank"
              rel="noopener noreferrer"
              download={isPreviewable ? undefined : item.originalName}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-line bg-canvas shadow-sm transition-shadow hover:shadow-lift"
            >
              {previewSrc ? (
                <img src={previewSrc} alt={item.originalName} className="h-full w-full object-cover" />
              ) : (
                <div className="relative h-full w-full">
                  <FileTypeIcon fileType={item.fileType} />
                  {!isPreviewable && <Download size={14} className="absolute bottom-2 left-2 text-ink-soft" />}
                </div>
              )}

              <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/80 to-transparent p-2.5 transition-transform duration-300 ease-out group-hover:translate-y-0">
                <p className="truncate text-xs font-medium text-white">{item.originalName}</p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
