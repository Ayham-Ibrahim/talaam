import { useState } from 'react';
import { ArrowLeftRight, KeyRound, Plus, Users, X } from 'lucide-react';
import { ChangeSiblingPasswordModal } from '@/components/dashboard/ChangeSiblingPasswordModal';
import { SiblingPasswordField, validateSiblingPassword } from '@/components/dashboard/SiblingPasswordField';
import {
  StudentAcademicProfileFields,
  STUDENT_ACADEMIC_INITIAL,
  buildStudentAcademicPayload,
  isStudentAcademicFormValid,
  hasStudentAcademicFieldError,
} from '@/components/dashboard/StudentAcademicProfileFields';
import { SmoothSelect } from '@/components/dashboard/SmoothSelect';
import { ApiErrorList, Avatar, Skeleton } from '@/components/ui';
import { useAddSibling, useSiblingFamily, useSwitchAccount } from '@/hooks/useSiblings';
import { useT } from '@/hooks/useT';

const FIELD_LABELS = {
  name: 'الاسم',
  password: 'كلمة المرور',
  gender: 'الجنس',
  education_type: 'نوع التعليم',
  curriculum_id: 'المنهج',
  country_id: 'الدولة',
  region_id: 'الولاية',
  stage_id: 'المرحلة',
  grade: 'الصف',
  university_id: 'الجامعة',
  major_id: 'التخصص',
  academic_level: 'المستوى الأكاديمي',
  course_field_id: 'مجال الدورة',
  level: 'المستوى',
};
const errorLabel = (path) => FIELD_LABELS[path] ?? path;

const EMPTY_FORM = { name: '', gender: '', password: '', ...STUDENT_ACADEMIC_INITIAL };

/**
 * قسم "إخوتي" في إعدادات الطالب الأساسي — قائمة الإخوة المضافين، التبديل إلى
 * حساب أيٍّ منهم أو تغيير كلمة مروره، وإضافة أخ جديد (حساب طالب مستقل بلا إيميل
 * يشترك بباقاته بنفسه، ويدخل ببريد الأساسي + كلمة مروره الخاصة).
 * لا يُعرض لحساب أخ (الإضافة مسموحة للحساب الأساسي فقط — SiblingController).
 */
export function SiblingsSection() {
  const t = useT();
  const { data: family, isLoading } = useSiblingFamily();
  const addSibling = useAddSibling();
  const switchAccount = useSwitchAccount();

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState(false);
  const [passwordTarget, setPasswordTarget] = useState(null);
  const [passwordChangedFor, setPasswordChangedFor] = useState(null);

  const siblings = (family ?? []).filter((member) => member.is_sibling_account);
  const nameMissing = form.name.trim() === '';
  const passwordInvalid = !!validateSiblingPassword(form.password);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setTouched(false);
    addSibling.reset();
  };

  const handleSubmit = () => {
    setTouched(true);
    // الموقع اختياري للأخ — بلا اختيار يرث الباك اند موقع الحساب الأساسي
    if (nameMissing || passwordInvalid || !isStudentAcademicFormValid(form, true, false)) return;
    addSibling.mutate(
      {
        name: form.name.trim(),
        password: form.password,
        password_confirmation: form.password,
        gender: form.gender || null,
        ...buildStudentAcademicPayload(form),
      },
      {
        onSuccess: () => {
          resetForm();
          setFormOpen(false);
        },
      }
    );
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-bold text-ink">
            <Users size={20} className="text-primary" />
            {t('siblings.title')}
          </h2>
          <p className="mt-1 text-sm text-ink-soft">{t('siblings.hint')}</p>
        </div>
        {!formOpen && (
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5"
          >
            <Plus size={16} />
            {t('siblings.add')}
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {switchAccount.isError && <ApiErrorList error={switchAccount.error} labelFor={() => null} />}
        {passwordChangedFor && (
          <p className="rounded-xl bg-primary/5 px-4 py-2 text-sm text-primary">
            {t('siblings.changePasswordSuccess')}: {passwordChangedFor}
          </p>
        )}

        {isLoading ? (
          <Skeleton className="h-16 rounded-2xl" />
        ) : siblings.length === 0 ? (
          !formOpen && <p className="text-sm text-ink-soft">{t('siblings.empty')}</p>
        ) : (
          siblings.map((sibling) => (
            <div
              key={sibling.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-line px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <Avatar name={sibling.name} src={sibling.avatar} size="sm" />
                <div className="text-sm font-semibold text-ink">{sibling.name}</div>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPasswordChangedFor(null);
                    setPasswordTarget(sibling);
                  }}
                  className="flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-medium text-ink-soft hover:bg-line/30 hover:text-ink"
                >
                  <KeyRound size={15} />
                  {t('siblings.changePassword')}
                </button>
                <button
                  type="button"
                  disabled={switchAccount.isPending}
                  onClick={() => switchAccount.mutate(sibling.id)}
                  className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  <ArrowLeftRight size={15} />
                  {t('siblings.switchTo')}
                </button>
              </div>
            </div>
          ))
        )}

        {formOpen && (
          <div className="mt-2 rounded-xl border border-line p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-ink">{t('siblings.formTitle')}</h3>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setFormOpen(false);
                }}
                aria-label={t('siblings.cancel')}
                className="text-ink-soft hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            {addSibling.isError && <ApiErrorList error={addSibling.error} labelFor={errorLabel} className="mb-4" />}

            <div className="mb-4 grid grid-cols-1 gap-4 text-right sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-ink">{t('siblings.nameLabel')}</span>
                <input
                  type="text"
                  maxLength={150}
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  aria-invalid={touched && nameMissing}
                  className={`w-full rounded-btn border bg-white p-3 text-sm text-ink focus:outline-none focus:ring-2 ${
                    touched && nameMissing
                      ? 'border-accent-pink focus:ring-accent-pink/30'
                      : 'border-line focus:border-primary focus:ring-primary/20'
                  }`}
                />
              </label>
              <SmoothSelect
                label={t('studentSettings.genderLabel')}
                value={form.gender}
                onChange={(v) => setForm((prev) => ({ ...prev, gender: v }))}
                options={[
                  { value: 'male', label: t('studentSettings.genderMale') },
                  { value: 'female', label: t('studentSettings.genderFemale') },
                ]}
                placeholder="—"
              />
              <div className="sm:col-span-2">
                <SiblingPasswordField
                  value={form.password}
                  onChange={(v) => setForm((prev) => ({ ...prev, password: v }))}
                  showError={touched}
                />
              </div>
            </div>

            {/* StudentAcademicProfileFields يعيد ضبط النموذج عند تغيير نوع التعليم —
                نحفظ الاسم/الجنس/كلمة المرور من التصفير بتمرير setter يدمجها دوماً */}
            <StudentAcademicProfileFields
              form={form}
              setForm={(updater) =>
                setForm((prev) => {
                  const next = typeof updater === 'function' ? updater(prev) : updater;
                  return { ...next, name: prev.name, gender: prev.gender, password: prev.password };
                })
              }
              touched={touched}
              requireLocation={false}
            />

            <button
              type="button"
              disabled={addSibling.isPending || hasStudentAcademicFieldError(form)}
              onClick={handleSubmit}
              className="mt-4 w-fit rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {addSibling.isPending ? t('studentSettings.saving') : t('siblings.submit')}
            </button>
          </div>
        )}
      </div>

      {passwordTarget && (
        <ChangeSiblingPasswordModal
          sibling={passwordTarget}
          onClose={() => setPasswordTarget(null)}
          onSaved={() => setPasswordChangedFor(passwordTarget.name)}
        />
      )}
    </div>
  );
}
