import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { FullPageLoader } from '../../../shared/components/Loader';

/**
 * Route protector that restricts page access to unauthenticated users.
 * Redirects logged-in users back to their target dashboards or homepage root.
 */
export const PublicRoute = ({ children }) => {
  const { isAuthenticated, initialized } = useAuth();
  const location = useLocation();

  if (!initialized) {
    return <FullPageLoader message="Verifying session..." />;
  }

  if (isAuthenticated) {
    // Redirect authenticated user to their destination, or dashboard root by default
    const redirectTarget = location.state?.from?.pathname || '/';
    return <Navigate to={redirectTarget} replace />;
  }

  return children;
};

export default PublicRoute;
