import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { FullPageLoader } from '../../../shared/components/Loader';

/**
 * Route protector that restricts page access to unauthenticated users.
 * Redirects logged-in users back to their previous target location or homepage root.
 */
export const PublicRoute = ({ children }) => {
  const { isAuthenticated, initialized } = useAuth();
  const location = useLocation();

  if (!initialized) {
    return <FullPageLoader message="Verifying session..." />;
  }

  if (isAuthenticated) {
    const redirectTarget = location.state?.from || '/';
    return <Navigate to={redirectTarget} replace />;
  }

  return children ? children : <Outlet />;
};

export default PublicRoute;
