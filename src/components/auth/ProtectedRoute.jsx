import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

/**
 * معلم: لا وصول للوحة التحكم إلا بحالة verified — active_unverified (لم يُكمل/يُرسِل
 * بعد)، pending_verification (بانتظار قرار الأدمن)، rejected، وsuspended كلها
 * محجوزة على /complete-profile (الذي يعرض الشاشة المناسبة لكل حالة بنفسه).
 * طالب: محجوز حتى يُكمل بياناته الأكاديمية (education_type=null).
 */
function hasIncompleteProfile(user) {
  if (!user) return false;
  if (user.role === 'teacher') return user.teacher && user.teacher.status !== 'verified';
  if (user.role === 'student') return user.student && user.student.education_type == null;
  return false;
}

/** Guards a route by auth state, and optionally by role (e.g. role="teacher") */
export function ProtectedRoute({ role, children }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user?.role !== role) {
    return <Navigate to="/" replace />;
  }

  if (hasIncompleteProfile(user) && location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" replace />;
  }

  return children;
}
