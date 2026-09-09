import { useState } from 'react';
import { Trash2, PlusCircle, HelpCircle } from 'lucide-react';
import { ApiErrorList } from '@/components/ui';
import { useT } from '@/hooks/useT';

/**
 * نفس فلسفة TeacherFaqEditor/TeacherVideosEditor تماماً — مكوّن قابل لإعادة
 * الاستخدام بلا أي hook خاص بداخله، يُستخدَم في TeacherSettingsPage (المعلم
 * لنفسه) وAdminTeacherProfileEditor (الأدمن نيابة عنه).
 */
export function TeacherExperienceEditor({
  experiences = [],
  onAdd,
  isAdding = false,
  addError = null,
  onRemove,
  removingId = null,
  maxExperiences = 10,
}) {
  const t = useT();
  const [title, setTitle] = useState('');
  const [period, setPeriod] = useState('');

  const canAddMore = experiences.length < maxExperiences;

  const handleAdd = () => {
    if (!title.trim() || !period.trim() || !onAdd) return;
    onAdd(
      { title: title.trim(), period: period.trim() },
      {
        onSuccess: () => {
          setTitle('');
          setPeriod('');
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <span className="text-sm font-semibold text-ink">
          {t('teacherExperiences.listLabel')} ({experiences.length}/{maxExperiences})
        </span>
        <ul className="mt-2 flex flex-col gap-2">
          {experiences.map((exp) => (
            <li key={exp.id} className="flex items-start justify-between gap-3 rounded-xl border border-line bg-white p-3">
              <button
                type="button"
                onClick={() => onRemove?.(exp.id)}
                disabled={removingId === exp.id}
                aria-label={t('teacherExperiences.remove')}
                className="mt-0.5 shrink-0 text-accent-pink hover:opacity-70 disabled:opacity-50"
              >
                <Trash2 size={16} />
              </button>
              <div className="flex-1 text-right">
                <div className="text-sm font-bold text-ink">{exp.title}</div>
                <div className="mt-1 text-xs text-ink-soft">{exp.period}</div>
              </div>
            </li>
          ))}
          {experiences.length === 0 && <p className="text-sm text-ink-soft">{t('teacherExperiences.empty')}</p>}
        </ul>
      </div>

      {canAddMore && onAdd && (
        <div className="flex flex-col gap-2 rounded-xl border border-dashed border-line bg-white p-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-ink">{t('teacherExperiences.titleLabel')}</span>
            <input
              type="text"
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('teacherExperiences.titlePlaceholder')}
              className="w-full rounded-btn border border-line bg-white p-2.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-ink">{t('teacherExperiences.periodLabel')}</span>
            <input
              type="text"
              maxLength={100}
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder={t('teacherExperiences.periodPlaceholder')}
              className="w-full rounded-btn border border-line bg-white p-2.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <button
            type="button"
            disabled={!title.trim() || !period.trim() || isAdding}
            onClick={handleAdd}
            className="flex items-center justify-center gap-1.5 self-start rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <PlusCircle size={16} />
            {isAdding ? t('teacherExperiences.adding') : t('teacherExperiences.add')}
          </button>
        </div>
      )}
      {!canAddMore && (
        <p className="flex items-center gap-1.5 text-xs text-ink-soft">
          <HelpCircle size={13} />
          {t('teacherExperiences.maxReached')}
        </p>
      )}
      {addError && <ApiErrorList error={addError} labelFor={() => null} className="text-xs" />}
    </div>
  );
}
