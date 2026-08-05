import { useAuth } from '@/hooks/useAuth';
import { CompleteTeacherProfilePage } from '@/pages/CompleteTeacherProfilePage';
import { CompleteStudentProfilePage } from '@/pages/CompleteStudentProfilePage';

/** فرع بحسب الدور — نفس نمط TeacherPackagesPage (تفرّع حسب isCenter) */
export function CompleteProfilePage() {
  const { user } = useAuth();
  return user?.role === 'teacher' ? <CompleteTeacherProfilePage /> : <CompleteStudentProfilePage />;
}
