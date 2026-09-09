import { Briefcase } from 'lucide-react';
import { useT } from '@/hooks/useT';

/**
 * خبرات سابقة حقيقية يديرها المعلم بنفسه (أو الأدمن نيابة عنه) من لوحة
 * التحكم — لا محتوى وهمي بديل، ولا يظهر القسم إطلاقاً إن لم يُضِف المعلم أي
 * خبرة بعد. نفس فلسفة TeacherFAQSection تماماً.
 */
export function TeacherExperienceSection({ experiences = [] }) {
  const t = useT();

  if (experiences.length === 0) return null;

  return (
    <div className="mt-6 rounded-2xl bg-white p-5 shadow-card">
      <h3 className="flex items-center gap-2 text-start font-bold text-ink">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-price/10 text-price">
          <Briefcase size={17} />
        </span>
        {t('teacherExperiences.listLabel')}
      </h3>
      <ul className="mt-3 flex flex-col gap-3">
        {experiences.map((exp) => (
          <li key={exp.id} className="flex items-baseline justify-between gap-3 border-b border-line/60 pb-3 last:border-0 last:pb-0">
            <span className="text-sm font-semibold text-ink">{exp.title}</span>
            <span className="shrink-0 text-xs text-ink-soft">{exp.period}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
