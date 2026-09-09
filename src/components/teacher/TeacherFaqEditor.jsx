import { useState } from 'react';
import { Trash2, PlusCircle, HelpCircle } from 'lucide-react';
import { ApiErrorList } from '@/components/ui';
import { useT } from '@/hooks/useT';

/**
 * مكوّن قابل لإعادة الاستخدام بالكامل — بلا أي hook خاص بالمعلم أو الأدمن
 * بداخله عمداً، بنفس فلسفة TeacherVideosEditor تماماً: يُستخدَم في كل من
 * TeacherSettingsPage (المعلم لنفسه) وAdminTeacherProfileEditor (الأدمن نيابة
 * عن المعلم) — كل صفحة تُمرِّر أفعالها الخاصة (hooks مختلفة تماماً).
 */
export function TeacherFaqEditor({
  faqs = [],
  onAdd,
  isAdding = false,
  addError = null,
  onRemove,
  removingId = null,
  maxFaqs = 10,
}) {
  const t = useT();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const canAddMore = faqs.length < maxFaqs;

  const handleAdd = () => {
    if (!question.trim() || !answer.trim() || !onAdd) return;
    onAdd(
      { question: question.trim(), answer: answer.trim() },
      {
        onSuccess: () => {
          setQuestion('');
          setAnswer('');
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <span className="text-sm font-semibold text-ink">
          {t('teacherFaqs.listLabel')} ({faqs.length}/{maxFaqs})
        </span>
        <ul className="mt-2 flex flex-col gap-2">
          {faqs.map((faq) => (
            <li key={faq.id} className="flex items-start justify-between gap-3 rounded-xl border border-line bg-white p-3">
              <button
                type="button"
                onClick={() => onRemove?.(faq.id)}
                disabled={removingId === faq.id}
                aria-label={t('teacherFaqs.remove')}
                className="mt-0.5 shrink-0 text-accent-pink hover:opacity-70 disabled:opacity-50"
              >
                <Trash2 size={16} />
              </button>
              <div className="flex-1 text-right">
                <div className="text-sm font-bold text-ink">{faq.question}</div>
                <div className="mt-1 text-xs text-ink-soft">{faq.answer}</div>
              </div>
            </li>
          ))}
          {faqs.length === 0 && <p className="text-sm text-ink-soft">{t('teacherFaqs.empty')}</p>}
        </ul>
      </div>

      {canAddMore && onAdd && (
        <div className="flex flex-col gap-2 rounded-xl border border-dashed border-line bg-white p-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-ink">{t('teacherFaqs.questionLabel')}</span>
            <input
              type="text"
              maxLength={300}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={t('teacherFaqs.questionPlaceholder')}
              className="w-full rounded-btn border border-line bg-white p-2.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-ink">{t('teacherFaqs.answerLabel')}</span>
            <textarea
              rows={2}
              maxLength={2000}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={t('teacherFaqs.answerPlaceholder')}
              className="w-full resize-none rounded-btn border border-line bg-white p-2.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <button
            type="button"
            disabled={!question.trim() || !answer.trim() || isAdding}
            onClick={handleAdd}
            className="flex items-center justify-center gap-1.5 self-start rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <PlusCircle size={16} />
            {isAdding ? t('teacherFaqs.adding') : t('teacherFaqs.add')}
          </button>
        </div>
      )}
      {!canAddMore && (
        <p className="flex items-center gap-1.5 text-xs text-ink-soft">
          <HelpCircle size={13} />
          {t('teacherFaqs.maxReached')}
        </p>
      )}
      {addError && <ApiErrorList error={addError} labelFor={() => null} className="text-xs" />}
    </div>
  );
}
