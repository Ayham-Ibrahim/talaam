import { FileText, Presentation, Sheet as SheetIcon, Download } from 'lucide-react';
import { useT } from '@/hooks/useT';

const ICONS = { pdf: FileText, pptx: Presentation, xlsx: SheetIcon };

/**
 * الداعم الأكاديمي فقط — نماذج أعمال/اساينمنتس حقيقية دعم بها طلاباً سابقين.
 * صورة/PDF قابلة للمعاينة المباشرة (فتح بتبويب جديد — المتصفح يعرضها أصلاً)،
 * PPT/Excel للتنزيل فقط (لا معاينة مباشرة ممكنة بالمتصفح، باختيار صريح).
 * اسم الملف overlay متحرك عند التحويم — يوازي TeacherGalleryEditor في لوحة المعلم.
 */
export function AssignmentsGallerySection({ items = [] }) {
  const t = useT();

  if (!items.length) return null;

  return (
    <div className="mt-6 rounded-2xl bg-white p-5 shadow-card">
      <h3 className="mb-1 text-start font-bold text-ink">{t('teacher.assignmentsGallery.title')}</h3>
      <p className="mb-3 text-start text-sm text-ink-soft">{t('teacher.assignmentsGallery.hint')}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = ICONS[item.fileType] ?? FileText;
          const isPreviewable = item.fileType === 'image' || item.fileType === 'pdf';

          return (
            <a
              key={item.id}
              href={item.filePath}
              target="_blank"
              rel="noopener noreferrer"
              download={isPreviewable ? undefined : item.originalName}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-line bg-canvas shadow-sm transition-shadow hover:shadow-lift"
            >
              {item.fileType === 'image' ? (
                <img src={item.filePath} alt={item.originalName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/10 to-accent-purple/10">
                  <Icon size={40} className="text-primary" />
                  {!isPreviewable && <Download size={14} className="text-ink-soft" />}
                </div>
              )}

              {/* overlay اسم الملف المتحرك — ينزلق من الأسفل عند التحويم */}
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
