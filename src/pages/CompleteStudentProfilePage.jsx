import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { SmoothSelect } from '@/components/dashboard/SmoothSelect';
import { ApiErrorList } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useCompleteStudentProfile } from '@/hooks/useStudentAccount';
import { useTaxonomyList } from '@/hooks/useTaxonomy';
import { useT } from '@/hooks/useT';

const STUDENT_PROFILE_FIELD_LABELS = {
  education_type: 'نوع التعليم',
  curriculum_id: 'المنهج',
  stage_id: 'المرحلة',
  grade: 'الصف',
  university_id: 'الجامعة',
  major_id: 'التخصص',
  academic_level: 'المستوى الأكاديمي',
  course_field_id: 'مجال الدورة',
  level: 'المستوى',
  birth_date: 'تاريخ الميلاد',
  guardian_name: 'اسم ولي الأمر',
  guardian_phone: 'هاتف ولي الأمر',
};
const studentProfileErrorLabel = (path) => STUDENT_PROFILE_FIELD_LABELS[path] ?? path;

const EDUCATION_TYPES = [
  { value: 'school', key: 'school' },
  { value: 'university', key: 'university' },
  { value: 'training', key: 'training' },
];

const ACADEMIC_LEVELS = ['diploma', 'bachelor', 'master'];
const TRAINING_LEVELS = ['beginner', 'intermediate', 'advanced'];

const INITIAL = {
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

export function CompleteStudentProfilePage() {
  const t = useT();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState(INITIAL);
  const [touched, setTouched] = useState(false);

  const studentId = user?.student?.id;
  const completeProfile = useCompleteStudentProfile(studentId);

  const { data: curricula = [] } = useTaxonomyList(form.education_type === 'school' ? 'curricula' : null);
  const { data: stages = [] } = useTaxonomyList(form.education_type === 'school' ? 'stages' : null);
  const { data: universities = [] } = useTaxonomyList(form.education_type === 'university' ? 'universities' : null);
  const { data: majors = [] } = useTaxonomyList(form.education_type === 'university' ? 'majors' : null);
  const { data: courseFields = [] } = useTaxonomyList(form.education_type === 'training' ? 'course_fields' : null);

  if (!user) return <Navigate to="/login" replace />;
  if (!user.student) return <Navigate to="/" replace />;

  const patch = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const isValid =
    form.education_type === 'school'
      ? form.curriculum_id !== '' && form.stage_id !== ''
      : form.education_type === 'university'
        ? form.university_id !== '' && form.major_id !== '' && form.academic_level !== ''
        : form.education_type === 'training'
          ? form.course_field_id !== '' && form.level !== ''
          : false;

  const handleSubmit = () => {
    setTouched(true);
    if (!isValid) return;

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

    completeProfile.mutate(payload, { onSuccess: () => navigate('/dashboard/student', { replace: true }) });
  };

  return (
    <PageContainer>
      <div className="container-app flex justify-center py-10">
        <div className="w-full max-w-lg rounded-2xl bg-surface p-6 shadow-card sm:p-8">
          <div className="mb-6 flex flex-col items-center gap-3 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
              <GraduationCap size={30} className="text-primary" />
            </div>
            <h1 className="text-xl font-bold text-ink">{t('completeProfile.studentTitle')}</h1>
            <p className="text-sm text-ink-soft">{t('completeProfile.studentHint')}</p>
          </div>

          {completeProfile.isError && (
            <ApiErrorList error={completeProfile.error} labelFor={studentProfileErrorLabel} className="mb-4" />
          )}

          <div className="flex flex-col gap-4 text-right">
            <div>
              <span className="text-sm font-semibold text-ink">{t('completeProfile.educationTypeLabel')}</span>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {EDUCATION_TYPES.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...INITIAL, education_type: opt.value }))}
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

            {form.education_type && touched && !isValid && (
              <span className="text-xs text-accent-pink">{t('completeProfile.requiredHint')}</span>
            )}
          </div>

          <button
            type="button"
            disabled={completeProfile.isPending}
            onClick={handleSubmit}
            className="mt-6 w-full rounded-xl bg-primary py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {completeProfile.isPending ? t('completeProfile.saving') : t('completeProfile.save')}
          </button>
        </div>
      </div>
    </PageContainer>
  );
}
