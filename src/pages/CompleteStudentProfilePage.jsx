import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import {
  StudentAcademicProfileFields,
  STUDENT_ACADEMIC_INITIAL,
  buildStudentAcademicPayload,
  isStudentAcademicFormValid,
} from '@/components/dashboard/StudentAcademicProfileFields';
import { ApiErrorList } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useCompleteStudentProfile } from '@/hooks/useStudentAccount';
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

export function CompleteStudentProfilePage() {
  const t = useT();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState(STUDENT_ACADEMIC_INITIAL);
  const [touched, setTouched] = useState(false);

  const studentId = user?.student?.id;
  const completeProfile = useCompleteStudentProfile(studentId);

  if (!user) return <Navigate to="/login" replace />;
  if (!user.student) return <Navigate to="/" replace />;

  const handleSubmit = () => {
    setTouched(true);
    if (!isStudentAcademicFormValid(form)) return;

    completeProfile.mutate(buildStudentAcademicPayload(form), {
      onSuccess: () => navigate('/dashboard/student', { replace: true }),
    });
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

          <StudentAcademicProfileFields form={form} setForm={setForm} touched={touched} />

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
