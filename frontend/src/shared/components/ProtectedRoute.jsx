import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../features/auth/hooks/useAuth';
import { FullPageLoader } from './Loader';

/**
 * Route protector that restricts page access to authenticated users.
 * Redirects unauthorized requests to /login and saves original query paths.
 */
export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, initialized, user } = useAuth();
  const location = useLocation();

  if (!initialized) {
    return <FullPageLoader message="Loading platform credentials..." />;
  }

  if (!isAuthenticated) {
    // Redirect to login and save the location state to restore it after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Future-ready Role-Based Authorization
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role || 'User';
    const isAuthorized = allowedRoles.some(
      (role) => role.toLowerCase() === userRole.toLowerCase()
    );
    
    if (!isAuthorized) {
      // Redirect unauthorized users to the main dashboard
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
