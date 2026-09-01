import { SmoothSelect } from '@/components/dashboard/SmoothSelect';
import { sanitizeName, sanitizePhone, validateName, validatePhone } from '@/lib/accountFormValidation';
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
// لا جدول تصنيف للصفوف (بعكس المراحل) — أرقام صِرفة 1-12، بلا ربط بالمرحلة
// المختارة (الباك اند: integer|min:1|max:12 بلا أي شرط على stage_id). نفس
// نمط MetaController::filters().grades وPackageWizardBasicInfo.jsx.
const GRADE_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i + 1));

/** الباك اند يُعيد birth_date كـ ISO كامل ("2005-03-10T00:00:00Z") — نأخذ جزء التاريخ فقط ليقبله <input type="date"> وتصحّ المقارنة. */
export function toDateInputValue(value) {
  return value ? String(value).slice(0, 10) : '';
}

/** أحدث تاريخ ميلاد مقبول = أمس (الباك اند: before:today — تاريخ اليوم نفسه مرفوض). */
export function maxBirthDate() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** تاريخ ميلاد اليوم أو بعده غير صالح؛ الحقل اختياري فالقيمة الفارغة صالحة. يطابق قاعدة before:today في الباك اند. */
export function isBirthDateValid(birthDate) {
  const date = toDateInputValue(birthDate);
  return !date || date <= maxBirthDate();
}

/** الصف الدراسي: رقم صحيح من 1 إلى 12 فقط (الباك اند: integer|min:1|max:12). اختياري. */
export function isGradeValid(grade) {
  if (grade === '' || grade == null) return true;
  const n = Number(grade);
  return Number.isInteger(n) && n >= 1 && n <= 12;
}

/** هاتف ولي الأمر: إلزامي، أرقام فقط (نفس قاعدة الهاتف). الباك اند: required. */
export function isGuardianPhoneValid(phone) {
  return !!phone && validatePhone(sanitizePhone(String(phone))) === null;
}

/** اسم ولي الأمر: إلزامي، أحرف فقط بلا أرقام أو رموز (نفس قاعدة الاسم في الباك اند). الباك اند: required. */
export function isGuardianNameValid(name) {
  return String(name ?? '').trim() !== '' && validateName(String(name)) === null;
}

/**
 * الحقول الإلزامية لنوع التعليم المختار، بالإضافة لاسم وهاتف ولي الأمر
 * الإلزاميين بصرف النظر عن نوع التعليم — لتلميح "أكمل الحقول المطلوبة".
 */
export function studentAcademicRequiredFieldsFilled(form) {
  const typeSpecificFilled =
    form.education_type === 'school'
      ? form.curriculum_id !== '' && form.stage_id !== ''
      : form.education_type === 'university'
        ? form.university_id !== '' && form.major_id !== '' && form.academic_level !== ''
        : form.education_type === 'training'
          ? form.course_field_id !== '' && form.level !== ''
          : false;

  return typeSpecificFilled && form.guardian_name.trim() !== '' && form.guardian_phone !== '';
}

/** خطأ في أي حقل حر (تاريخ ميلاد/صف/اسم وهاتف ولي الأمر) — لتعطيل زر الحفظ، مستقل عن اكتمال الحقول الإلزامية. */
export function hasStudentAcademicFieldError(form) {
  return (
    !isBirthDateValid(form.birth_date) ||
    !isGradeValid(form.grade) ||
    !isGuardianNameValid(form.guardian_name) ||
    !isGuardianPhoneValid(form.guardian_phone)
  );
}

export function isStudentAcademicFormValid(form) {
  return studentAcademicRequiredFieldsFilled(form) && !hasStudentAcademicFieldError(form);
}

export function buildStudentAcademicPayload(form) {
  const payload = { education_type: form.education_type };
  if (form.education_type === 'school') {
    payload.curriculum_id = Number(form.curriculum_id);
    payload.stage_id = Number(form.stage_id);
    if (form.grade && isGradeValid(form.grade)) payload.grade = Number(form.grade);
  } else if (form.education_type === 'university') {
    payload.university_id = Number(form.university_id);
    payload.major_id = Number(form.major_id);
    payload.academic_level = form.academic_level;
  } else if (form.education_type === 'training') {
    payload.course_field_id = Number(form.course_field_id);
    payload.level = form.level;
  }
  if (form.birth_date) payload.birth_date = toDateInputValue(form.birth_date);
  if (form.guardian_name && form.guardian_name.trim()) payload.guardian_name = form.guardian_name.trim();
  if (form.guardian_phone) payload.guardian_phone = sanitizePhone(String(form.guardian_phone));
  return payload;
}

export function StudentAcademicProfileFields({ form, setForm, touched }) {
  const t = useT();
  // تلميح "أكمل الحقول المطلوبة" يخص الحقول الإلزامية فقط — أخطاء الصف/تاريخ
  // الميلاد/هاتف ولي الأمر لها رسائلها الخاصة تحت كل حقل مباشرةً.
  const requiredFieldsValid = studentAcademicRequiredFieldsFilled(form);
  const gradeError = !isGradeValid(form.grade);
  // قبل أول محاولة حفظ (touched=false)، حقل ولي الأمر الفارغ لا يُعرَض كخطأ —
  // إلزاميته الجديدة لا يجب أن تُخيف المستخدم برسالة حمراء قبل أن يحاول الكتابة أصلاً.
  const guardianNameError = touched && !isGuardianNameValid(form.guardian_name);
  const guardianPhoneError = touched && !isGuardianPhoneValid(form.guardian_phone);
  const guardianNameEmpty = form.guardian_name.trim() === '';
  const guardianPhoneEmpty = form.guardian_phone === '';

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
          <SmoothSelect
            label={t('completeProfile.gradeLabel')}
            value={form.grade}
            onChange={(v) => setForm((prev) => ({ ...prev, grade: v }))}
            options={GRADE_OPTIONS.map((g) => ({ value: g, label: `${t('completeProfile.gradeOptionLabel')} ${g}` }))}
            placeholder="—"
            error={gradeError}
            errorMessage={t('completeProfile.gradeInvalid')}
          />
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
              value={toDateInputValue(form.birth_date)}
              max={maxBirthDate()}
              onChange={patch('birth_date')}
              aria-invalid={!isBirthDateValid(form.birth_date)}
              className={`w-full rounded-btn border bg-white p-3 text-sm text-ink focus:outline-none focus:ring-2 ${
                !isBirthDateValid(form.birth_date)
                  ? 'border-accent-pink focus:border-accent-pink focus:ring-accent-pink/20'
                  : 'border-line focus:border-primary focus:ring-primary/20'
              }`}
            />
            {!isBirthDateValid(form.birth_date) && (
              <span className="text-xs text-accent-pink">{t('completeProfile.birthDateInvalid')}</span>
            )}
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">{t('completeProfile.guardianNameLabel')}</span>
            <input
              type="text"
              maxLength={150}
              value={form.guardian_name}
              onChange={(e) => setForm((prev) => ({ ...prev, guardian_name: sanitizeName(e.target.value) }))}
              aria-invalid={guardianNameError}
              className={`w-full rounded-btn border bg-white p-3 text-sm text-ink focus:outline-none focus:ring-2 ${
                guardianNameError
                  ? 'border-accent-pink focus:border-accent-pink focus:ring-accent-pink/20'
                  : 'border-line focus:border-primary focus:ring-primary/20'
              }`}
            />
            {guardianNameError && (
              <span className="text-xs text-accent-pink">
                {t(guardianNameEmpty ? 'completeProfile.guardianNameRequired' : 'completeProfile.guardianNameInvalid')}
              </span>
            )}
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">{t('completeProfile.guardianPhoneLabel')}</span>
            <input
              type="tel"
              inputMode="tel"
              dir="ltr"
              maxLength={25}
              value={form.guardian_phone}
              onChange={(e) => setForm((prev) => ({ ...prev, guardian_phone: sanitizePhone(e.target.value) }))}
              aria-invalid={guardianPhoneError}
              className={`w-full rounded-btn border bg-white p-3 text-sm text-ink focus:outline-none focus:ring-2 ${
                guardianPhoneError
                  ? 'border-accent-pink focus:border-accent-pink focus:ring-accent-pink/20'
                  : 'border-line focus:border-primary focus:ring-primary/20'
              }`}
            />
            {guardianPhoneError && (
              <span className="text-xs text-accent-pink">
                {t(guardianPhoneEmpty ? 'completeProfile.guardianPhoneRequired' : 'completeProfile.guardianPhoneInvalid')}
              </span>
            )}
          </label>
        </>
      )}

      {form.education_type && touched && !requiredFieldsValid && (
        <span className="text-xs text-accent-pink">{t('completeProfile.requiredHint')}</span>
      )}
    </div>
  );
}
