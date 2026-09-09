import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useT } from '@/hooks/useT';

/**
 * أسئلة شائعة حقيقية يديرها المعلم بنفسه (أو الأدمن نيابة عنه) من لوحة
 * التحكم — لا محتوى ثابت عام بعد الآن. القسم لا يظهر إطلاقاً إن لم يُضِف
 * المعلم أي سؤال بعد (لا محتوى وهمي بديل).
 */
export function TeacherFAQSection({ faqs = [] }) {
  const t = useT();
  const [openIndex, setOpenIndex] = useState(0);

  if (faqs.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="mb-3 text-start font-bold text-ink">{t('teacher.faq.title')}</h3>
      <div className="flex flex-col gap-2">
        {faqs.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={item.id}
              className={`rounded-2xl shadow-card transition-colors ${isOpen ? 'bg-primary-light/50' : 'bg-white'}`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? -1 : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 p-4 text-start"
              >
                <span className="font-bold text-ink">{item.question}</span>
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    isOpen ? 'bg-primary text-white' : 'bg-canvas text-ink-soft'
                  }`}
                >
                  {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                </span>
              </button>
              {isOpen && <p className="whitespace-pre-wrap px-4 pb-4 text-start text-sm leading-relaxed text-ink-soft">{item.answer}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
