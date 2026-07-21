import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

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

  return children;
}
