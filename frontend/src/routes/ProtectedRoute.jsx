import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute
 *
 * Props:
 *   allowedRoles – optional array of role strings e.g. ['ADMIN','SUNDAY_SCHOOL_TEACHER']
 *                  When omitted, any authenticated user is allowed (existing behaviour).
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, initialized } = useAuth();
  const location = useLocation();

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-church-blue border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // If allowedRoles is specified, enforce it
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <p className="text-5xl mb-4">🔒</p>
        <h1 className="text-2xl font-bold text-church-blue mb-2">Access Denied</h1>
        <p className="text-gray-500">You don't have permission to view this page.</p>
      </div>
    );
  }

  return children;
}
