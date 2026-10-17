import { FileText, Presentation, Sheet as SheetIcon } from 'lucide-react';

/**
 * أيقونة افتراضية حديثة (squircle متدرّج + glyph) لكل نوع ملف — نفس فلسفة
 * التدرّجات الملوّنة ذات الطابع الزجاجي المستخدمة في EducationTypes بالصفحة
 * الرئيسية (sections.jsx)، بألوان قريبة من هوية كل صيغة (PDF أحمر، PPT برتقالي،
 * Excel أخضر). تُعرَض فقط حين لا توجد صورة مصغّرة مرفوعة يدوياً من الداعم.
 */
const FILE_TYPE_STYLES = {
  pdf: { icon: FileText, from: '#FF8A7A', to: '#D9480F' },
  pptx: { icon: Presentation, from: '#FFB07A', to: '#D04423' },
  xlsx: { icon: SheetIcon, from: '#6FE6B0', to: '#107C41' },
};

export function FileTypeIcon({ fileType, size = 'md' }) {
  const style = FILE_TYPE_STYLES[fileType] ?? FILE_TYPE_STYLES.pdf;
  const Icon = style.icon;
  const dims = size === 'sm' ? { box: 44, glyph: 18 } : { box: 64, glyph: 26 };

  return (
    <div className="relative flex h-full w-full items-center justify-center" style={{ minHeight: dims.box }}>
      <div className="relative" style={{ width: dims.box, height: dims.box }}>
        <div
          className="absolute right-0 top-1 h-[78%] w-[78%] rounded-[22%] shadow-md"
          style={{ background: `linear-gradient(135deg, ${style.from}, ${style.to})` }}
        />
        <div
          className="absolute bottom-1 left-1 flex h-[78%] w-[78%] items-center justify-center rounded-[22%] border border-white/50 shadow-lg backdrop-blur-sm"
          style={{ background: `linear-gradient(135deg, ${style.from}CC 0%, ${style.to}55 50%)` }}
        >
          <Icon size={dims.glyph} className="text-white drop-shadow" />
        </div>
      </div>
    </div>
  );
}
