import { useEffect, useMemo, useState } from 'react';
import { Pencil } from 'lucide-react';
import { SmoothSelect } from '@/components/dashboard/SmoothSelect';
import { MultiSelectChips } from '@/components/dashboard/MultiSelectChips';
import { TagChipsInput } from '@/components/dashboard/TagChipsInput';
import { TeacherExperienceEditor } from '@/components/teacher/TeacherExperienceEditor';
import { ApiErrorList } from '@/components/ui';
import { useTaxonomyList } from '@/hooks/useTaxonomy';
import {
  useAddExperience,
  useUpdateExperience,
  useRemoveExperience,
  useUpdateMyTeacherProfile,
} from '@/hooks/useTeacherAccount';
import {
  EXPERIENCE_LABELS,
  QUALIFICATION_LABELS,
} from '@/services/teacherService';
import { useT } from '@/hooks/useT';

const QUALIFICATION_OPTIONS = Object.entries(QUALIFICATION_LABELS).map(([value, label]) => ({ value, label }));
const EXPERIENCE_OPTIONS = Object.entries(EXPERIENCE_LABELS).map(([value, label]) => ({ value, label }));

const TEACHING_METHOD_SUGGESTIONS = [
  'شرح مباشر', 'حل واجبات', 'تدريب امتحانات', 'تدريب عملي', 'مشاريع', 'مراجعة', 'خطة فردية',
];
const EXAM_PREP_SUGGESTIONS = ['SAT', 'ACT', 'IB', 'IGCSE', 'GCSE', 'A-Level', 'AP', 'TOEFL', 'IELTS', 'EmSAT'];

const FIELD_LABELS = {
  bio: 'نبذة عني',
  teaching_philosophy_quote: 'مقولة عن فلسفتك في التدريس',
  teaching_philosophy_text: 'فلسفتي في التدريس',
  thank_you_message: 'رسالة الشكر في نهاية الملف الشخصي',
  qualification: 'المؤهل العلمي',
  experience_years: 'سنوات الخبرة',
  city: 'الموقع',
  subject_ids: 'المواد',
  curriculum_ids: 'المناهج',
  language_ids: 'اللغات',
  teaching_methods: 'طريقة التدريس',
  exam_prep: 'التحضير للامتحانات',
};
const errorLabel = (path) => FIELD_LABELS[path.replace(/\.\d+$/, '')] ?? path;

const idsOf = (list) => (list ?? []).map((x) => x.id);

/**
 * Ongoing editor (verified teachers) for the fields that render on the public
 * profile page — bio, qualification, experience, location, subjects, curricula,
 * languages, teaching methods, exam prep. Mirrors CompleteTeacherProfilePage's
 * save payload but lives in Settings so it's editable after verification.
 */
export function TeacherProfileEditorCard({ teacherId, teacher, isTrainingCenter }) {
  const t = useT();
  const update = useUpdateMyTeacherProfile(teacherId);
  const addExperience = useAddExperience(teacherId);
  const updateExperience = useUpdateExperience(teacherId);
  const removeExperience = useRemoveExperience(teacherId);

  const { data: subjects = [] } = useTaxonomyList('subjects');
  const { data: curricula = [] } = useTaxonomyList('curricula');
  const { data: languages = [] } = useTaxonomyList('languages');

  const [form, setForm] = useState(null);
  const [savedAt, setSavedAt] = useState(0);

  useEffect(() => {
    if (teacher && !form) {
      setForm({
        bio: teacher.bio ?? '',
        teaching_philosophy_quote: teacher.teaching_philosophy_quote ?? '',
        teaching_philosophy_text: teacher.teaching_philosophy_text ?? '',
        thank_you_message: teacher.thank_you_message ?? '',
        qualification: teacher.qualification ?? '',
        experience_years: teacher.experience_years ?? '',
        city: teacher.city ?? '',
        subject_ids: idsOf(teacher.subjects),
        curriculum_ids: idsOf(teacher.curricula),
        language_ids: idsOf(teacher.languages),
        teaching_methods: teacher.teaching_methods ?? [],
        exam_prep: teacher.exam_prep ?? [],
      });
    }
  }, [teacher, form]);

  const set = (field) => (value) => setForm((prev) => ({ ...prev, [field]: value }));

  const dirty = useMemo(() => {
    if (!form || !teacher) return false;
    return JSON.stringify(form) !== JSON.stringify({
      bio: teacher.bio ?? '',
      teaching_philosophy_quote: teacher.teaching_philosophy_quote ?? '',
      teaching_philosophy_text: teacher.teaching_philosophy_text ?? '',
      thank_you_message: teacher.thank_you_message ?? '',
      qualification: teacher.qualification ?? '',
      experience_years: teacher.experience_years ?? '',
      city: teacher.city ?? '',
      subject_ids: idsOf(teacher.subjects),
      curriculum_ids: idsOf(teacher.curricula),
      language_ids: idsOf(teacher.languages),
      teaching_methods: teacher.teaching_methods ?? [],
      exam_prep: teacher.exam_prep ?? [],
    });
  }, [form, teacher]);

  if (!form) return null;

  const handleSave = () => {
    update.mutate(
      {
        bio: form.bio || null,
        teaching_philosophy_quote: form.teaching_philosophy_quote || null,
        teaching_philosophy_text: form.teaching_philosophy_text || null,
        thank_you_message: form.thank_you_message || null,
        qualification: form.qualification || null,
        experience_years: form.experience_years || null,
        city: form.city || null,
        subject_ids: form.subject_ids,
        curriculum_ids: form.curriculum_ids,
        language_ids: form.language_ids,
        teaching_methods: form.teaching_methods,
        exam_prep: form.exam_prep,
        // Backend re-validates the training-center required fields on every PUT
        ...(isTrainingCenter
          ? {
              display_name_en: teacher.display_name_en,
              commercial_register: teacher.commercial_register,
            }
          : {}),
      },
      { onSuccess: () => setSavedAt(Date.now()) },
    );
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card">
      <h2 className="flex items-center gap-2 font-bold text-ink">
        <Pencil size={18} className="text-primary" />
        {t('teacherSettings.profileTitle')}
      </h2>
      <p className="mt-1 text-sm text-ink-soft">{t('teacherSettings.profileHint')}</p>

      {update.isError && <ApiErrorList error={update.error} labelFor={errorLabel} className="mt-4" />}

      <div className="mt-5 flex flex-col gap-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-primary">{FIELD_LABELS.bio}</span>
          <textarea
            rows={4}
            maxLength={500}
            value={form.bio}
            onChange={(e) => set('bio')(e.target.value)}
            className="w-full resize-none rounded-lg border border-[#E3E3E3] bg-white p-3 text-sm leading-7 text-ink focus:border-primary focus:outline-none"
          />
          <span className="text-left text-xs text-ink-soft/70">{form.bio.length}/500</span>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-primary">{FIELD_LABELS.teaching_philosophy_quote}</span>
          <input
            type="text"
            maxLength={200}
            value={form.teaching_philosophy_quote}
            placeholder={t('teacherSettings.philosophyQuotePlaceholder')}
            onChange={(e) => set('teaching_philosophy_quote')(e.target.value)}
            className="w-full rounded-lg border border-[#E3E3E3] bg-white p-3 text-sm text-ink focus:border-primary focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-primary">{FIELD_LABELS.teaching_philosophy_text}</span>
          <textarea
            rows={3}
            maxLength={600}
            value={form.teaching_philosophy_text}
            placeholder={t('teacherSettings.philosophyTextPlaceholder')}
            onChange={(e) => set('teaching_philosophy_text')(e.target.value)}
            className="w-full resize-none rounded-lg border border-[#E3E3E3] bg-white p-3 text-sm leading-7 text-ink focus:border-primary focus:outline-none"
          />
          <span className="text-left text-xs text-ink-soft/70">{form.teaching_philosophy_text.length}/600</span>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-primary">{FIELD_LABELS.thank_you_message}</span>
          <textarea
            rows={3}
            maxLength={600}
            value={form.thank_you_message}
            placeholder={`${t('teacher.defaultThankYouLine1')} ${t('teacher.defaultThankYouLine2')}`}
            onChange={(e) => set('thank_you_message')(e.target.value)}
            className="w-full resize-none rounded-lg border border-[#E3E3E3] bg-white p-3 text-sm leading-7 text-ink focus:border-primary focus:outline-none"
          />
          <span className="text-xs text-ink-soft/70">{t('teacherSettings.thankYouHint')}</span>
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SmoothSelect
            label={FIELD_LABELS.qualification}
            value={form.qualification}
            onChange={set('qualification')}
            options={QUALIFICATION_OPTIONS}
            placeholder="—"
          />
          <SmoothSelect
            label={FIELD_LABELS.experience_years}
            value={form.experience_years}
            onChange={set('experience_years')}
            options={EXPERIENCE_OPTIONS}
            placeholder="—"
          />
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-primary">{FIELD_LABELS.city}</span>
          <input
            type="text"
            maxLength={80}
            value={form.city}
            placeholder={t('teacherSettings.locationPlaceholder')}
            onChange={(e) => set('city')(e.target.value)}
            className="w-full rounded-lg border border-[#E3E3E3] bg-white p-3 text-sm text-ink focus:border-primary focus:outline-none"
          />
        </label>

        <MultiSelectChips
          label={FIELD_LABELS.subject_ids}
          values={form.subject_ids}
          onChange={set('subject_ids')}
          options={subjects.map((s) => ({ value: s.id, label: s.name_ar }))}
          placeholder="—"
          max={30}
        />
        <MultiSelectChips
          label={FIELD_LABELS.curriculum_ids}
          values={form.curriculum_ids}
          onChange={set('curriculum_ids')}
          options={curricula.map((c) => ({ value: c.id, label: c.name_ar }))}
          placeholder="—"
          max={20}
        />
        <MultiSelectChips
          label={FIELD_LABELS.language_ids}
          values={form.language_ids}
          onChange={set('language_ids')}
          options={languages.map((l) => ({ value: l.id, label: l.name_ar }))}
          placeholder="—"
          max={20}
        />

        <TagChipsInput
          label={FIELD_LABELS.teaching_methods}
          values={form.teaching_methods}
          onChange={set('teaching_methods')}
          suggestions={TEACHING_METHOD_SUGGESTIONS}
          placeholder={t('teacherSettings.addTagPlaceholder')}
        />
        <TagChipsInput
          label={FIELD_LABELS.exam_prep}
          values={form.exam_prep}
          onChange={set('exam_prep')}
          suggestions={EXAM_PREP_SUGGESTIONS}
          placeholder={t('teacherSettings.addTagPlaceholder')}
        />

        <TeacherExperienceEditor
          experiences={teacher.experiences ?? []}
          onAdd={(payload, opts) => addExperience.mutate(payload, opts)}
          isAdding={addExperience.isPending}
          addError={addExperience.isError ? addExperience.error : null}
          onUpdate={(payload, opts) => updateExperience.mutate(payload, opts)}
          isUpdating={updateExperience.isPending}
          updateError={updateExperience.isError ? updateExperience.error : null}
          updatingId={updateExperience.isPending ? updateExperience.variables?.experienceId : null}
          onRemove={(id) => removeExperience.mutate(id)}
          removingId={removeExperience.isPending ? removeExperience.variables : null}
        />

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={update.isPending || !dirty}
            onClick={handleSave}
            className="w-fit rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {update.isPending ? t('studentSettings.saving') : t('studentSettings.save')}
          </button>
          {savedAt > 0 && !dirty && !update.isPending && (
            <span className="text-sm font-medium text-success">{t('completeProfile.saveSuccess')}</span>
          )}
        </div>
      </div>
    </div>
  );
}
