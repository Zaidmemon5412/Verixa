import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import useAuth from '../../features/auth/hooks/useAuth';
import { FullPageLoader } from './Loader';

/**
 * Route protector that restricts page access to authenticated users.
 * Redirects unauthorized requests to /login and saves original location state to restore after login.
 */
export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, initialized, user } = useAuth();
  const location = useLocation();

  if (!initialized) {
    return <FullPageLoader message="Verifying security credentials..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role || 'User';
    const isAuthorized = allowedRoles.some(
      (role) => role.toLowerCase() === userRole.toLowerCase()
    );
    
    if (!isAuthorized) {
      return <Navigate to="/" replace />;
    }
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
