import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { Camera, GraduationCap, KeyRound, UserRound, Trash2, Eye, EyeOff } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import {
  StudentAcademicProfileFields,
  STUDENT_ACADEMIC_INITIAL,
  buildStudentAcademicPayload,
  isStudentAcademicFormValid,
  hasStudentAcademicFieldError,
} from '@/components/dashboard/StudentAcademicProfileFields';
import { ApiErrorList, Avatar, Skeleton, PasswordInputActions } from '@/components/ui';
import { SmoothSelect } from '@/components/dashboard/SmoothSelect';
import { TimezoneField } from '@/components/dashboard/TimezoneField';
import { useAuth } from '@/hooks/useAuth';
import { useUploadAvatar, useDeleteAvatar, useUpdateProfile, useUpdatePassword } from '@/hooks/useProfile';
import { useCompleteStudentProfile, useMyStudentProfile } from '@/hooks/useStudentAccount';
import { queryKeys } from '@/api/queryKeys';
import { useT } from '@/hooks/useT';

const PROFILE_FIELD_LABELS = { name: 'الاسم', phone: 'رقم الهاتف', whatsapp: 'واتساب', gender: 'الجنس' };
const profileErrorLabel = (path) => PROFILE_FIELD_LABELS[path] ?? path;

/** أرقام فقط مع بادئة + اختيارية واحدة — يطابق قاعدة UpdateMyProfileRequest في الباك اند. */
const PHONE_PATTERN = /^\+?[0-9]{7,24}$/;

/** يمنع ظهور أي حرف/رمز أثناء الكتابة: يُبقي الأرقام فقط، مع + واحدة في البداية إن وُجدت. */
function sanitizePhoneInput(raw) {
  const cleaned = raw.replace(/[^\d+]/g, '');
  return cleaned.startsWith('+') ? '+' + cleaned.slice(1).replace(/\+/g, '') : cleaned.replace(/\+/g, '');
}

/** رسالة الخطأ الفورية، أو null. القيمة الفارغة مقبولة (الحقل اختياري). */
function phoneFieldError(value, invalidMessage) {
  if (!value) return null;
  return PHONE_PATTERN.test(value) ? null : invalidMessage;
}

const PASSWORD_FIELD_LABELS = { current_password: 'كلمة المرور الحالية', password: 'كلمة المرور الجديدة' };
const passwordErrorLabel = (path) => PASSWORD_FIELD_LABELS[path] ?? path;

const ACADEMIC_FIELD_LABELS = {
  education_type: 'نوع التعليم',
  curriculum_id: 'المنهج',
  stage_id: 'المرحلة',
  grade: 'الصف',
  university_id: 'الجامعة',
  major_id: 'التخصص',
  academic_level: 'المستوى الأكاديمي',
  course_field_id: 'مجال الدورة',
  level: 'المستوى',
};
const academicErrorLabel = (path) => ACADEMIC_FIELD_LABELS[path] ?? path;

function SectionCard({ icon: Icon, title, hint, children }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-card">
      <h2 className="flex items-center gap-2 font-bold text-ink">
        <Icon size={20} className="text-primary" />
        {title}
      </h2>
      {hint && <p className="mt-1 text-sm text-ink-soft">{hint}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

export function StudentSettingsPage() {
  const t = useT();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const studentId = user?.student?.id;

  const { data: profile, isLoading: profileLoading } = useMyStudentProfile(studentId);
  const uploadAvatar = useUploadAvatar();
  const deleteAvatar = useDeleteAvatar();
  const updateProfile = useUpdateProfile();
  const updatePassword = useUpdatePassword();
  const updateAcademicProfile = useCompleteStudentProfile(studentId);

  const [basicForm, setBasicForm] = useState({ name: '', phone: '', whatsapp: '', gender: '', timezone: '', timezoneAuto: true });
  const [academicForm, setAcademicForm] = useState(STUDENT_ACADEMIC_INITIAL);
  const [academicTouched, setAcademicTouched] = useState(false);
  const [academicHydrated, setAcademicHydrated] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [basicBlurred, setBasicBlurred] = useState({ phone: false, whatsapp: false });
  const [basicHydrated, setBasicHydrated] = useState(false);

  // نملأ النموذج مرّة واحدة بعد توفّر user واكتمال تحميل ملف الطالب (مصدر
  // whatsapp/gender). سابقاً كان يُعاد ملؤه عند كل تغيّر في user — وبعد الحفظ
  // يتغيّر user (updateUser) فيُعاد ضبط whatsapp/gender من نسخة profile
  // المخزَّنة القديمة (لم تُبطَّل)، فتُمسح القيمتان اللتان أدخلهما المستخدم للتوّ.
  useEffect(() => {
    if (basicHydrated || !user || profileLoading) return;
    setBasicForm({
      name: user.name ?? '',
      phone: user.phone ?? '',
      whatsapp: profile?.whatsapp ?? '',
      gender: profile?.gender ?? '',
      timezone: user.timezone ?? '',
      timezoneAuto: user.timezone_auto ?? true,
    });
    setBasicHydrated(true);
  }, [user, profile, profileLoading, basicHydrated]);

  useEffect(() => {
    if (profile && !academicHydrated) {
      setAcademicForm({
        education_type: profile.education_type ?? '',
        curriculum_id: profile.curriculum_id ?? '',
        stage_id: profile.stage_id ?? '',
        grade: profile.grade ?? '',
        university_id: profile.university_id ?? '',
        major_id: profile.major_id ?? '',
        academic_level: profile.academic_level ?? '',
        course_field_id: profile.course_field_id ?? '',
        level: profile.level ?? '',
        birth_date: profile.birth_date ?? '',
        guardian_name: profile.guardian_name ?? '',
        guardian_phone: profile.guardian_phone ?? '',
      });
      setAcademicHydrated(true);
    }
  }, [profile, academicHydrated]);

  if (!user) return <Navigate to="/login" replace />;

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadAvatar.mutate(file);
  };

  const phoneError = phoneFieldError(basicForm.phone.trim(), t('studentSettings.phoneInvalid'));
  const whatsappError = phoneFieldError(basicForm.whatsapp.trim(), t('studentSettings.whatsappInvalid'));
  const showPhoneError = basicBlurred.phone && Boolean(phoneError);
  const showWhatsappError = basicBlurred.whatsapp && Boolean(whatsappError);

  const handleSaveBasic = () => {
    setBasicBlurred({ phone: true, whatsapp: true });
    if (phoneError || whatsappError) return;
    updateProfile.mutate(
      {
        name: basicForm.name.trim(),
        phone: basicForm.phone.trim() || null,
        whatsapp: basicForm.whatsapp.trim() || null,
        gender: basicForm.gender || null,
        timezone: basicForm.timezone || null,
        timezone_auto: basicForm.timezoneAuto,
      },
      {
        // whatsapp/gender يُحفظان على users لكن UserResource (رد التحديث) لا
        // يُعيدهما، فذاكرة ملف الطالب تبقى قديمة — نُبطلها كي يجلبها أي إعادة
        // تحميل/دخول لاحق من الخادم بقيمها المحفوظة فعلاً.
        onSuccess: () =>
          queryClient.invalidateQueries({ queryKey: queryKeys.students.myProfile(studentId) }),
      }
    );
  };

  const handleSaveAcademic = () => {
    setAcademicTouched(true);
    if (!isStudentAcademicFormValid(academicForm)) return;
    updateAcademicProfile.mutate(buildStudentAcademicPayload(academicForm));
  };

  const passwordSameAsCurrent =
    passwordForm.password !== '' && passwordForm.password === passwordForm.current_password;
  const isPasswordValid =
    passwordForm.current_password !== '' &&
    passwordForm.password.length >= 8 &&
    passwordForm.password === passwordForm.password_confirmation &&
    !passwordSameAsCurrent;

  const handleSavePassword = () => {
    setPasswordTouched(true);
    if (!isPasswordValid) return;
    updatePassword.mutate(passwordForm, {
      onSuccess: () => {
        setPasswordForm({ current_password: '', password: '', password_confirmation: '' });
        setPasswordTouched(false);
      },
    });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Basic account info + avatar */}
        <SectionCard icon={UserRound} title={t('studentSettings.basicInfoTitle')} hint={t('studentSettings.basicInfoHint')}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar name={user.name} src={user.avatar} size="lg" />
                <label className="absolute -bottom-1 -left-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-card hover:bg-primary-hover">
                  <Camera size={13} />
                  <input type="file" accept="image/png,image/jpeg" onChange={handleAvatarChange} className="hidden" />
                </label>
                {user.avatar && (
                  <button
                    type="button"
                    onClick={() => deleteAvatar.mutate()}
                    disabled={deleteAvatar.isPending}
                    title={t('studentSettings.removePhoto')}
                    className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-accent-pink shadow-card hover:bg-accent-pink/10 disabled:opacity-50"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
              {uploadAvatar.isPending && <span className="text-xs text-ink-soft">{t('studentSettings.uploading')}</span>}
              {deleteAvatar.isPending && <span className="text-xs text-ink-soft">{t('studentSettings.deletingAvatar')}</span>}
            </div>
            {uploadAvatar.isError && <ApiErrorList error={uploadAvatar.error} labelFor={() => null} />}
            {deleteAvatar.isError && <ApiErrorList error={deleteAvatar.error} labelFor={() => null} />}

            {updateProfile.isError && <ApiErrorList error={updateProfile.error} labelFor={profileErrorLabel} />}

            <div className="grid grid-cols-1 gap-4 text-right sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-ink">{t('studentSettings.nameLabel')}</span>
                <input
                  type="text"
                  maxLength={150}
                  value={basicForm.name}
                  onChange={(e) => setBasicForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-btn border border-line bg-white p-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-ink">{t('studentSettings.phoneLabel')}</span>
                <input
                  type="tel"
                  inputMode="tel"
                  dir="ltr"
                  maxLength={25}
                  value={basicForm.phone}
                  onChange={(e) => setBasicForm((prev) => ({ ...prev, phone: sanitizePhoneInput(e.target.value) }))}
                  onBlur={() => setBasicBlurred((prev) => ({ ...prev, phone: true }))}
                  aria-invalid={showPhoneError}
                  className={`w-full rounded-btn border bg-white p-3 text-sm text-ink focus:outline-none focus:ring-2 ${
                    showPhoneError
                      ? 'border-accent-pink focus:border-accent-pink focus:ring-accent-pink/20'
                      : 'border-line focus:border-primary focus:ring-primary/20'
                  }`}
                />
                {showPhoneError ? (
                  <span className="text-xs text-accent-pink">{phoneError}</span>
                ) : (
                  <span className="text-xs text-ink-soft">{t('studentSettings.phoneHint')}</span>
                )}
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-ink">{t('studentSettings.whatsappLabel')}</span>
                <input
                  type="tel"
                  inputMode="tel"
                  dir="ltr"
                  maxLength={25}
                  value={basicForm.whatsapp}
                  onChange={(e) => setBasicForm((prev) => ({ ...prev, whatsapp: sanitizePhoneInput(e.target.value) }))}
                  onBlur={() => setBasicBlurred((prev) => ({ ...prev, whatsapp: true }))}
                  aria-invalid={showWhatsappError}
                  className={`w-full rounded-btn border bg-white p-3 text-sm text-ink focus:outline-none focus:ring-2 ${
                    showWhatsappError
                      ? 'border-accent-pink focus:border-accent-pink focus:ring-accent-pink/20'
                      : 'border-line focus:border-primary focus:ring-primary/20'
                  }`}
                />
                {showWhatsappError ? (
                  <span className="text-xs text-accent-pink">{whatsappError}</span>
                ) : (
                  <span className="text-xs text-ink-soft">{t('studentSettings.phoneHint')}</span>
                )}
              </label>
              <SmoothSelect
                label={t('studentSettings.genderLabel')}
                value={basicForm.gender}
                onChange={(v) => setBasicForm((prev) => ({ ...prev, gender: v }))}
                options={[
                  { value: 'male', label: t('studentSettings.genderMale') },
                  { value: 'female', label: t('studentSettings.genderFemale') },
                ]}
                placeholder="—"
              />
            </div>

            {/* مخفي بطلب صريح — إبقاء المنطقة الزمنية تلقائية دوماً (اكتشاف صامت من App.jsx عبر
                useSyncTimezone) بلا خيار تثبيت يدوي ظاهر للمستخدم. الحقل والحالة والحمولة أدناه
                (basicForm.timezone/timezoneAuto) أُبقيت كما هي لإعادة التفعيل لاحقاً بسهولة. */}
            {/* <TimezoneField
              timezone={basicForm.timezone}
              auto={basicForm.timezoneAuto}
              onChange={({ auto, timezone }) => setBasicForm((prev) => ({ ...prev, timezoneAuto: auto, timezone }))}
            /> */}

            <button
              type="button"
              disabled={updateProfile.isPending || basicForm.name.trim() === '' || showPhoneError || showWhatsappError}
              onClick={handleSaveBasic}
              className="w-fit rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {updateProfile.isPending ? t('studentSettings.saving') : t('studentSettings.save')}
            </button>
          </div>
        </SectionCard>

        {/* Academic profile */}
        <SectionCard icon={GraduationCap} title={t('studentSettings.academicTitle')} hint={t('studentSettings.academicHint')}>
          {profileLoading ? (
            <Skeleton className="h-40 rounded-2xl" />
          ) : (
            <>
              {updateAcademicProfile.isError && (
                <ApiErrorList error={updateAcademicProfile.error} labelFor={academicErrorLabel} className="mb-4" />
              )}
              <StudentAcademicProfileFields form={academicForm} setForm={setAcademicForm} touched={academicTouched} />
              <button
                type="button"
                disabled={updateAcademicProfile.isPending || hasStudentAcademicFieldError(academicForm)}
                onClick={handleSaveAcademic}
                className="mt-4 w-fit rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {updateAcademicProfile.isPending ? t('studentSettings.saving') : t('studentSettings.save')}
              </button>
            </>
          )}
        </SectionCard>

        {/* Password */}
        <SectionCard icon={KeyRound} title={t('studentSettings.passwordTitle')} hint={t('studentSettings.passwordHint')}>
          <div className="flex flex-col gap-4">
            {updatePassword.isError && <ApiErrorList error={updatePassword.error} labelFor={passwordErrorLabel} />}
            {updatePassword.isSuccess && (
              <div className="rounded-btn bg-success-light px-4 py-3 text-sm text-success">
                {t('studentSettings.passwordChanged')}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 text-right sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-ink">{t('studentSettings.currentPasswordLabel')}</span>
                <div className="flex items-center gap-2">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    dir="ltr"
                    maxLength={255}
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, current_password: e.target.value }))}
                    className={`w-full rounded-btn border bg-white p-3 text-sm text-ink focus:outline-none focus:ring-2 ${
                      passwordTouched && passwordForm.current_password === ''
                        ? 'border-accent-pink focus:ring-accent-pink/30'
                        : 'border-line focus:border-primary focus:ring-primary/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((v) => !v)}
                    title={showCurrentPassword ? t('common.hidePassword') : t('common.showPassword')}
                    aria-label={showCurrentPassword ? t('common.hidePassword') : t('common.showPassword')}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-btn border border-line text-ink-soft hover:bg-line/40 hover:text-primary"
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>
              <div />
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-ink">{t('studentSettings.newPasswordLabel')}</span>
                <div className="flex items-center gap-2">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    dir="ltr"
                    maxLength={255}
                    value={passwordForm.password}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, password: e.target.value }))}
                    aria-invalid={passwordTouched && (passwordForm.password.length < 8 || passwordSameAsCurrent)}
                    className={`w-full rounded-btn border bg-white p-3 text-sm text-ink focus:outline-none focus:ring-2 ${
                      passwordTouched && (passwordForm.password.length < 8 || passwordSameAsCurrent)
                        ? 'border-accent-pink focus:ring-accent-pink/30'
                        : 'border-line focus:border-primary focus:ring-primary/20'
                    }`}
                  />
                  <PasswordInputActions
                    visible={showNewPassword}
                    onToggleVisible={() => setShowNewPassword((v) => !v)}
                    onGenerate={(generated) => {
                      // نملأ التأكيد أيضاً بنفس القيمة — كلمة مرور مولَّدة عشوائياً
                      // في حقل التأكيد وحده ستُنتج عدم تطابق دائماً وإلا.
                      setPasswordForm((prev) => ({ ...prev, password: generated, password_confirmation: generated }));
                      setShowNewPassword(true);
                      setShowConfirmPassword(true);
                    }}
                  />
                </div>
                {passwordSameAsCurrent ? (
                  <span className="text-xs text-accent-pink">{t('studentSettings.passwordSameAsCurrent')}</span>
                ) : (
                  <span className="text-xs text-ink-soft">{t('studentSettings.passwordHintText')}</span>
                )}
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-ink">{t('studentSettings.confirmPasswordLabel')}</span>
                <div className="flex items-center gap-2">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    dir="ltr"
                    maxLength={255}
                    value={passwordForm.password_confirmation}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, password_confirmation: e.target.value }))}
                    className={`w-full rounded-btn border bg-white p-3 text-sm text-ink focus:outline-none focus:ring-2 ${
                      passwordTouched && passwordForm.password !== passwordForm.password_confirmation
                        ? 'border-accent-pink focus:ring-accent-pink/30'
                        : 'border-line focus:border-primary focus:ring-primary/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    title={showConfirmPassword ? t('common.hidePassword') : t('common.showPassword')}
                    aria-label={showConfirmPassword ? t('common.hidePassword') : t('common.showPassword')}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-btn border border-line text-ink-soft hover:bg-line/40 hover:text-primary"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>
            </div>

            <button
              type="button"
              disabled={updatePassword.isPending}
              onClick={handleSavePassword}
              className="w-fit rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {updatePassword.isPending ? t('studentSettings.saving') : t('studentSettings.changePassword')}
            </button>
          </div>
        </SectionCard>
      </div>
    </DashboardLayout>
  );
}
