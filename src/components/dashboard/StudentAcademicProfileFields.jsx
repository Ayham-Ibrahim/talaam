import { SmoothSelect } from '@/components/dashboard/SmoothSelect';
import { useTaxonomyList } from '@/hooks/useTaxonomy';
import { useT } from '@/hooks/useT';

/**
 * Shared between CompleteStudentProfilePage (first-login gate) and
 * StudentSettingsPage (edit anytime) — both submit to the same backend
 * endpoint (StudentController::update / UpdateStudentProfileRequest), so the
 * field set, validation, and payload shape must stay identical between them.
 */
export const STUDENT_ACADEMIC_INITIAL = {
  education_type: '',
  curriculum_id: '',
  stage_id: '',
  grade: '',
  university_id: '',
  major_id: '',
  academic_level: '',
  course_field_id: '',
  level: '',
  birth_date: '',
  guardian_name: '',
  guardian_phone: '',
};

const EDUCATION_TYPES = [
  { value: 'school', key: 'school' },
  { value: 'university', key: 'university' },
  { value: 'training', key: 'training' },
];

const ACADEMIC_LEVELS = ['diploma', 'bachelor', 'master'];
const TRAINING_LEVELS = ['beginner', 'intermediate', 'advanced'];

export function isStudentAcademicFormValid(form) {
  return form.education_type === 'school'
    ? form.curriculum_id !== '' && form.stage_id !== ''
    : form.education_type === 'university'
      ? form.university_id !== '' && form.major_id !== '' && form.academic_level !== ''
      : form.education_type === 'training'
        ? form.course_field_id !== '' && form.level !== ''
        : false;
}

export function buildStudentAcademicPayload(form) {
  const payload = { education_type: form.education_type };
  if (form.education_type === 'school') {
    payload.curriculum_id = Number(form.curriculum_id);
    payload.stage_id = Number(form.stage_id);
    if (form.grade) payload.grade = Number(form.grade);
  } else if (form.education_type === 'university') {
    payload.university_id = Number(form.university_id);
    payload.major_id = Number(form.major_id);
    payload.academic_level = form.academic_level;
  } else if (form.education_type === 'training') {
    payload.course_field_id = Number(form.course_field_id);
    payload.level = form.level;
  }
  if (form.birth_date) payload.birth_date = form.birth_date;
  if (form.guardian_name) payload.guardian_name = form.guardian_name;
  if (form.guardian_phone) payload.guardian_phone = form.guardian_phone;
  return payload;
}

export function StudentAcademicProfileFields({ form, setForm, touched }) {
  const t = useT();
  const isValid = isStudentAcademicFormValid(form);

  const { data: curricula = [] } = useTaxonomyList(form.education_type === 'school' ? 'curricula' : null);
  const { data: stages = [] } = useTaxonomyList(form.education_type === 'school' ? 'stages' : null);
  const { data: universities = [] } = useTaxonomyList(form.education_type === 'university' ? 'universities' : null);
  const { data: majors = [] } = useTaxonomyList(form.education_type === 'university' ? 'majors' : null);
  const { data: courseFields = [] } = useTaxonomyList(form.education_type === 'training' ? 'course_fields' : null);

  const patch = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="flex flex-col gap-4 text-right">
      <div>
        <span className="text-sm font-semibold text-ink">{t('completeProfile.educationTypeLabel')}</span>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {EDUCATION_TYPES.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setForm((prev) => ({ ...STUDENT_ACADEMIC_INITIAL, education_type: opt.value }))}
              className={`rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                form.education_type === opt.value
                  ? 'border-primary bg-primary text-white'
                  : 'border-line text-ink hover:bg-line/30'
              }`}
            >
              {t(`completeProfile.educationTypes.${opt.key}`)}
            </button>
          ))}
        </div>
      </div>

      {form.education_type === 'school' && (
        <>
          <SmoothSelect
            label={t('completeProfile.curriculumLabel')}
            value={form.curriculum_id}
            onChange={(v) => setForm((prev) => ({ ...prev, curriculum_id: v }))}
            options={curricula.map((c) => ({ value: c.id, label: c.name_ar }))}
            placeholder="—"
          />
          <SmoothSelect
            label={t('completeProfile.stageLabel')}
            value={form.stage_id}
            onChange={(v) => setForm((prev) => ({ ...prev, stage_id: v }))}
            options={stages.map((s) => ({ value: s.id, label: s.name_ar }))}
            placeholder="—"
          />
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">{t('completeProfile.gradeLabel')}</span>
            <input
              type="number"
              min="1"
              max="12"
              value={form.grade}
              onChange={patch('grade')}
              className="w-full rounded-btn border border-line bg-white p-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
        </>
      )}

      {form.education_type === 'university' && (
        <>
          <SmoothSelect
            label={t('completeProfile.universityLabel')}
            value={form.university_id}
            onChange={(v) => setForm((prev) => ({ ...prev, university_id: v }))}
            options={universities.map((u) => ({ value: u.id, label: u.name_ar }))}
            placeholder="—"
          />
          <SmoothSelect
            label={t('completeProfile.majorLabel')}
            value={form.major_id}
            onChange={(v) => setForm((prev) => ({ ...prev, major_id: v }))}
            options={majors.map((m) => ({ value: m.id, label: m.name_ar }))}
            placeholder="—"
          />
          <SmoothSelect
            label={t('completeProfile.academicLevelLabel')}
            value={form.academic_level}
            onChange={(v) => setForm((prev) => ({ ...prev, academic_level: v }))}
            options={ACADEMIC_LEVELS.map((lvl) => ({ value: lvl, label: t(`completeProfile.academicLevels.${lvl}`) }))}
            placeholder="—"
          />
        </>
      )}

      {form.education_type === 'training' && (
        <>
          <SmoothSelect
            label={t('completeProfile.courseFieldLabel')}
            value={form.course_field_id}
            onChange={(v) => setForm((prev) => ({ ...prev, course_field_id: v }))}
            options={courseFields.map((c) => ({ value: c.id, label: c.name_ar }))}
            placeholder="—"
          />
          <SmoothSelect
            label={t('completeProfile.trainingLevelLabel')}
            value={form.level}
            onChange={(v) => setForm((prev) => ({ ...prev, level: v }))}
            options={TRAINING_LEVELS.map((lvl) => ({ value: lvl, label: t(`completeProfile.trainingLevels.${lvl}`) }))}
            placeholder="—"
          />
        </>
      )}

      {form.education_type && (
        <>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">{t('completeProfile.birthDateLabel')}</span>
            <input
              type="date"
              value={form.birth_date}
              onChange={patch('birth_date')}
              className="w-full rounded-btn border border-line bg-white p-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">{t('completeProfile.guardianNameLabel')}</span>
            <input
              type="text"
              maxLength={150}
              value={form.guardian_name}
              onChange={patch('guardian_name')}
              className="w-full rounded-btn border border-line bg-white p-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">{t('completeProfile.guardianPhoneLabel')}</span>
            <input
              type="tel"
              dir="ltr"
              maxLength={25}
              value={form.guardian_phone}
              onChange={patch('guardian_phone')}
              className="w-full rounded-btn border border-line bg-white p-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
        </>
      )}

      {form.education_type && touched && !isValid && (
        <span className="text-xs text-accent-pink">{t('completeProfile.requiredHint')}</span>
      )}
    </div>
  );
}
