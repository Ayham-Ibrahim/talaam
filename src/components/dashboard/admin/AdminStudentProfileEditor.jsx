import { useEffect, useState } from 'react';
import { Camera, Check, Trash2, UserCog } from 'lucide-react';
import {
  StudentAcademicProfileFields,
  STUDENT_ACADEMIC_INITIAL,
  buildStudentAcademicPayload,
  isStudentAcademicFormValid,
  hasStudentAcademicFieldError,
} from '@/components/dashboard/StudentAcademicProfileFields';
import { ApiErrorList, Avatar } from '@/components/ui';
import {
  useAdminUpdateStudentProfile,
  useAdminUploadStudentAvatar,
  useAdminDeleteStudentAvatar,
} from '@/hooks/useAdminStudents';
import { useT } from '@/hooks/useT';

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

/**
 * يتيح للأدمن إكمال/تعديل الملف الأكاديمي لطالب نيابة عنه — يوازي
 * AdminTeacherProfileEditor تماماً من ناحية الفلسفة: نفس مسار الباك اند الذي
 * يستخدمه الطالب لنفسه بالضبط (StudentController::update)، والتوسيع الوحيد
 * كان في StudentPolicy::update للسماح للأدمن به أيضاً. يعيد استخدام نفس
 * StudentAcademicProfileFields المشترك مع CompleteStudentProfilePage/StudentSettingsPage
 * حرفياً — حقل واحد يتغيّر، تتحدّث كل الأماكن الثلاثة معاً.
 */
export function AdminStudentProfileEditor({ studentId, student }) {
  const t = useT();
  const updateProfile = useAdminUpdateStudentProfile(studentId);
  const uploadAvatar = useAdminUploadStudentAvatar(studentId);
  const deleteAvatar = useAdminDeleteStudentAvatar(studentId);

  const [form, setForm] = useState(STUDENT_ACADEMIC_INITIAL);
  const [touched, setTouched] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (student && !hydrated) {
      setForm({
        education_type: student.education_type ?? '',
        curriculum_id: student.curriculum_id ?? '',
        stage_id: student.stage_id ?? '',
        grade: student.grade ?? '',
        university_id: student.university_id ?? '',
        major_id: student.major_id ?? '',
        academic_level: student.academic_level ?? '',
        course_field_id: student.course_field_id ?? '',
        level: student.level ?? '',
        birth_date: student.birth_date ?? '',
        guardian_name: student.guardian_name ?? '',
        guardian_phone: student.guardian_phone ?? '',
      });
      setHydrated(true);
    }
  }, [student, hydrated]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadAvatar.mutate(file);
  };

  const handleSave = () => {
    setTouched(true);
    if (!isStudentAcademicFormValid(form)) return;
    updateProfile.mutate(buildStudentAcademicPayload(form), {
      onSuccess: () => {
        setSuccessMessage(t('dashboard.adminStudentDetail.profileEditor.saveSuccess'));
        setTimeout(() => setSuccessMessage(''), 4000);
      },
    });
  };

  return (
    <div className="rounded-2xl border border-[#F2F2F7] bg-white p-5 shadow-card sm:p-6">
      <div className="mb-5 flex items-center justify-end gap-2 border-b border-line/60 pb-4 text-right">
        <div>
          <h3 className="text-base font-bold text-ink">{t('dashboard.adminStudentDetail.profileEditor.title')}</h3>
          <p className="mt-0.5 text-sm text-ink-soft">{t('dashboard.adminStudentDetail.profileEditor.subtitle')}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
          <UserCog size={18} />
        </div>
      </div>

      <div className="mb-6 flex flex-col items-center gap-3 border-b border-line/60 pb-6 text-center">
        <div className="relative">
          <Avatar name={student.name} src={student.avatar_path} size="lg" />
          <label className="absolute -bottom-1 -left-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-card hover:bg-primary-hover">
            <Camera size={13} />
            <input type="file" accept="image/png,image/jpeg" onChange={handleAvatarChange} className="hidden" />
          </label>
          {student.avatar_path && (
            <button
              type="button"
              onClick={() => deleteAvatar.mutate()}
              disabled={deleteAvatar.isPending}
              title={t('dashboard.adminStudentDetail.profileEditor.removePhoto')}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-accent-pink shadow-card hover:bg-accent-pink/10 disabled:opacity-50"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
        {uploadAvatar.isPending && <span className="text-xs text-ink-soft">{t('dashboard.adminStudentDetail.profileEditor.uploadingPhoto')}</span>}
        {uploadAvatar.isError && <ApiErrorList error={uploadAvatar.error} labelFor={() => null} className="text-xs" />}
        {deleteAvatar.isError && <ApiErrorList error={deleteAvatar.error} labelFor={() => null} className="text-xs" />}
      </div>

      {updateProfile.isError && <ApiErrorList error={updateProfile.error} labelFor={academicErrorLabel} className="mb-4" />}

      <StudentAcademicProfileFields form={form} setForm={setForm} touched={touched} />

      <button
        type="button"
        disabled={updateProfile.isPending || hasStudentAcademicFieldError(form)}
        onClick={handleSave}
        className="mt-4 w-full rounded-xl border-2 border-primary py-3 text-sm font-medium text-primary transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        <span className="inline-flex items-center justify-center gap-1.5">
          <Check size={16} />
          {updateProfile.isPending
            ? t('dashboard.adminStudentDetail.profileEditor.saving')
            : t('dashboard.adminStudentDetail.profileEditor.saveProfile')}
        </span>
      </button>
      {successMessage && (
        <div className="mt-2 rounded-btn bg-success-light px-4 py-2.5 text-xs font-medium text-success">
          {successMessage}
        </div>
      )}
    </div>
  );
}
