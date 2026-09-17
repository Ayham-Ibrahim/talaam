import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Plus } from 'lucide-react';
import { useT } from '@/hooks/useT';

/** One accordion row — question always visible, answer reveals under it when open */
function FaqItem({ faq, isOpen, onToggle }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border transition-colors duration-200 ${
        isOpen ? 'border-primary/20 bg-primary/[0.04]' : 'border-line/60 bg-white'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start"
      >
        <span className="text-[15px] font-bold text-ink">{faq.question}</span>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-200 ${
            isOpen ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
          }`}
        >
          <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex">
            <ChevronDown size={16} />
          </motion.span>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && faq.answer && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <p className="whitespace-pre-line px-5 pb-4 text-sm leading-[1.8] text-ink-soft">{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * أسئلة شائعة حقيقية يديرها المعلم بنفسه (أو الأدمن نيابة عنه) من لوحة
 * التحكم — لا محتوى ثابت عام. القسم لا يظهر إطلاقاً إن لم يُضِف المعلم أي
 * سؤال بعد. شارة + عنوان + وصف على جهة البداية، والأكورديون على جهة النهاية
 * (يعكس المرجع LTR بشكل صحيح لموقعنا RTL).
 */
export function TeacherFAQSection({ teacher }) {
  const t = useT();
  const faqs = teacher.faqs ?? [];
  const [openId, setOpenId] = useState(faqs[0]?.id ?? null);

  if (faqs.length === 0) return null;

  return (
    <div className="mt-6 rounded-[28px] bg-white p-6 shadow-[0_10px_30px_rgba(17,24,39,0.06)] sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:items-start">
        <div className="text-start">
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
            <Plus size={13} />
            {t('teacher.faqBadge')}
          </span>
          <h3 className="mt-4 text-2xl font-bold leading-tight text-ink sm:text-[28px]">{t('teacher.faqTitle')}</h3>
          <p className="mt-3 text-sm leading-[1.8] text-ink-soft">{t('teacher.faqSubtitle')}</p>
        </div>

        <div className="flex flex-col gap-3">
          {faqs.map((faq) => (
            <FaqItem
              key={faq.id}
              faq={faq}
              isOpen={openId === faq.id}
              onToggle={() => setOpenId((current) => (current === faq.id ? null : faq.id))}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
