import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks';
import { UserRole } from '../../types/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  /** 
   * Required role to access this route. 
   * If provided, user must have this exact role.
   */
  requiredRole?: UserRole;
  /** 
   * List of allowed roles. 
   * If provided, user must have one of these roles.
   */
  allowedRoles?: UserRole[];
  /**
   * Optional redirect path if not authorized.
   * Defaults to '/auth/login'
   */
  redirectTo?: string;
}

/**
 * ProtectedRoute Component
 * 
 * Wraps routes that require authentication. Checks if user is logged in
 * and optionally verifies user role. Redirects to login page if not authenticated,
 * preserving the intended destination for post-login redirect.
 * 
 * @example
 * // Basic authentication check
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 * 
 * @example
 * // Role-based protection
 * <ProtectedRoute requiredRole={UserRole.ADMIN}>
 *   <AdminPanel />
 * </ProtectedRoute>
 * 
 * @example
 * // Multiple allowed roles
 * <ProtectedRoute allowedRoles={[UserRole.CREATOR, UserRole.ADMIN]}>
 *   <CourseCreation />
 * </ProtectedRoute>
 */
export default function ProtectedRoute({
  children,
  requiredRole,
  allowedRoles,
  redirectTo = '/auth/login',
}: Readonly<ProtectedRouteProps>) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading...</p>
          <p className="text-gray-500 text-sm mt-2">
            Verifying your authentication
          </p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // Check role-based access if requiredRole is specified
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-red-600 text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h1>
            <p className="text-gray-600 mb-6">
              You don't have permission to access this page.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Required role: <span className="font-semibold">{requiredRole}</span>
              <br />
              Your role: <span className="font-semibold">{user?.role}</span>
            </p>
            <div className="space-y-2">
              <button
                onClick={() => globalThis.history.back()}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Go Back
              </button>
              <Navigate to="/" replace />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has one of the allowed roles
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAllowedRole = allowedRoles.includes(user?.role as UserRole);
    
    if (!hasAllowedRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="text-red-600 text-6xl mb-4">🚫</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Access Denied
              </h1>
              <p className="text-gray-600 mb-6">
                You don't have permission to access this page.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Allowed roles:{' '}
                <span className="font-semibold">
                  {allowedRoles.join(', ')}
                </span>
                <br />
                Your role: <span className="font-semibold">{user?.role}</span>
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => globalThis.history.back()}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Go Back
                </button>
                <Navigate to="/" replace />
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // User is authenticated and authorized - render children
  return <>{children}</>;
}
