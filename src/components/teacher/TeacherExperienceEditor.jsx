import { useState } from 'react';
import { Trash2, Pencil, PlusCircle, Check, X, HelpCircle } from 'lucide-react';
import { ApiErrorList } from '@/components/ui';
import { useT } from '@/hooks/useT';

const EMPTY_DRAFT = { title: '', company: '', period: '', location: '', description: '' };

/** Shared title/company/location+period/description inputs — used identically for the "add new" form and an in-place edit form */
function ExperienceFields({ draft, onChange, t }) {
  const set = (field) => (e) => onChange((prev) => ({ ...prev, [field]: e.target.value }));
  return (
    <>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-ink">{t('teacherExperiences.titleLabel')}</span>
        <input
          type="text"
          maxLength={200}
          value={draft.title}
          onChange={set('title')}
          placeholder={t('teacherExperiences.titlePlaceholder')}
          className="w-full rounded-btn border border-line bg-white p-2.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-ink">{t('teacherExperiences.companyLabel')}</span>
        <input
          type="text"
          maxLength={200}
          value={draft.company}
          onChange={set('company')}
          placeholder={t('teacherExperiences.companyPlaceholder')}
          className="w-full rounded-btn border border-line bg-white p-2.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </label>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-ink">{t('teacherExperiences.locationLabel')}</span>
          <input
            type="text"
            maxLength={150}
            value={draft.location}
            onChange={set('location')}
            placeholder={t('teacherExperiences.locationPlaceholder')}
            className="w-full rounded-btn border border-line bg-white p-2.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-ink">{t('teacherExperiences.periodLabel')}</span>
          <input
            type="text"
            maxLength={100}
            value={draft.period}
            onChange={set('period')}
            placeholder={t('teacherExperiences.periodPlaceholder')}
            className="w-full rounded-btn border border-line bg-white p-2.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-ink">{t('teacherExperiences.descriptionLabel')}</span>
        <textarea
          rows={3}
          maxLength={2000}
          value={draft.description}
          onChange={set('description')}
          placeholder={t('teacherExperiences.descriptionPlaceholder')}
          className="w-full resize-none rounded-btn border border-line bg-white p-2.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </label>
    </>
  );
}

/**
 * نفس فلسفة TeacherFaqEditor/TeacherVideosEditor تماماً — مكوّن قابل لإعادة
 * الاستخدام بلا أي hook خاص بداخله، يُستخدَم في TeacherSettingsPage (المعلم
 * لنفسه) وAdminTeacherProfileEditor (الأدمن نيابة عنه). كل خبرة قابلة للتعديل
 * في مكانها (زر قلم يفتح نفس حقول الإضافة معبّأة بقيمها الحالية) لا فقط
 * الحذف وإعادة الإضافة.
 */
export function TeacherExperienceEditor({
  experiences = [],
  onAdd,
  isAdding = false,
  addError = null,
  onUpdate,
  isUpdating = false,
  updateError = null,
  updatingId = null,
  onRemove,
  removingId = null,
  maxExperiences = 10,
}) {
  const t = useT();
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(EMPTY_DRAFT);

  const canAddMore = experiences.length < maxExperiences;

  const handleAdd = () => {
    if (!draft.title.trim() || !draft.period.trim() || !onAdd) return;
    onAdd(
      {
        title: draft.title.trim(),
        company: draft.company.trim() || null,
        period: draft.period.trim(),
        location: draft.location.trim() || null,
        description: draft.description.trim() || null,
      },
      { onSuccess: () => setDraft(EMPTY_DRAFT) },
    );
  };

  const startEdit = (exp) => {
    setEditingId(exp.id);
    setEditDraft({
      title: exp.title ?? '',
      company: exp.company ?? '',
      period: exp.period ?? '',
      location: exp.location ?? '',
      description: exp.description ?? '',
    });
  };
  const cancelEdit = () => setEditingId(null);
  const handleSaveEdit = () => {
    if (!editDraft.title.trim() || !editDraft.period.trim() || !onUpdate) return;
    onUpdate(
      {
        experienceId: editingId,
        title: editDraft.title.trim(),
        company: editDraft.company.trim() || null,
        period: editDraft.period.trim(),
        location: editDraft.location.trim() || null,
        description: editDraft.description.trim() || null,
      },
      { onSuccess: () => setEditingId(null) },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <span className="text-sm font-semibold text-ink">
          {t('teacherExperiences.listLabel')} ({experiences.length}/{maxExperiences})
        </span>
        <ul className="mt-2 flex flex-col gap-2">
          {experiences.map((exp) =>
            editingId === exp.id ? (
              <li key={exp.id} className="flex flex-col gap-2 rounded-xl border border-primary/40 bg-white p-3">
                <ExperienceFields draft={editDraft} onChange={setEditDraft} t={t} />
                {updateError && <ApiErrorList error={updateError} labelFor={() => null} className="text-xs" />}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!editDraft.title.trim() || !editDraft.period.trim() || isUpdating}
                    onClick={handleSaveEdit}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    <Check size={16} />
                    {isUpdating && updatingId === exp.id ? t('teacherExperiences.saving') : t('teacherExperiences.save')}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    disabled={isUpdating}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-canvas disabled:opacity-50"
                  >
                    <X size={16} />
                    {t('teacherExperiences.cancel')}
                  </button>
                </div>
              </li>
            ) : (
              <li key={exp.id} className="flex items-start justify-between gap-3 rounded-xl border border-line bg-white p-3">
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onRemove?.(exp.id)}
                    disabled={removingId === exp.id}
                    aria-label={t('teacherExperiences.remove')}
                    className="mt-0.5 text-accent-pink hover:opacity-70 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                  {onUpdate && (
                    <button
                      type="button"
                      onClick={() => startEdit(exp)}
                      aria-label={t('teacherExperiences.edit')}
                      className="mt-0.5 text-primary hover:opacity-70"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                </div>
                <div className="flex-1 text-right">
                  <div className="text-sm font-bold text-ink">{exp.title}</div>
                  {exp.company && <div className="mt-0.5 text-xs font-semibold text-ink-soft">{exp.company}</div>}
                  <div className="mt-1 flex flex-wrap items-center justify-end gap-x-3 gap-y-0.5 text-xs text-ink-soft">
                    {exp.location && <span>{exp.location}</span>}
                    <span>{exp.period}</span>
                  </div>
                  {exp.description && <p className="mt-1.5 whitespace-pre-line text-xs text-ink-soft">{exp.description}</p>}
                </div>
              </li>
            ),
          )}
          {experiences.length === 0 && <p className="text-sm text-ink-soft">{t('teacherExperiences.empty')}</p>}
        </ul>
      </div>

      {canAddMore && onAdd && (
        <div className="flex flex-col gap-2 rounded-xl border border-dashed border-line bg-white p-3">
          <ExperienceFields draft={draft} onChange={setDraft} t={t} />
          <button
            type="button"
            disabled={!draft.title.trim() || !draft.period.trim() || isAdding}
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
