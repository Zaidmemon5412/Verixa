import { Routes, Route, Navigate } from 'react-router-dom';

// Layout wrappers
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Guard components
import ProtectedRoute from '../components/ProtectedRoute';
import PublicRoute from '../components/PublicRoute';

// Page components
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import GeospatialMap from '../pages/GeospatialMap';
import PropertyComparison from '../pages/PropertyComparison';
import DocumentVerification from '../pages/DocumentVerification';

/**
 * AppRoutes manages page routes mappings and configures accessibility protections.
 */
export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Authentication Routes (Wrapped in AuthLayout and PublicRoute) */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
      </Route>

      {/* Protected Dashboard/App Routes (Wrapped in DashboardLayout and ProtectedRoute) */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/map" element={<GeospatialMap />} />
        <Route path="/compare" element={<PropertyComparison />} />
        <Route path="/verify" element={<DocumentVerification />} />
      </Route>

      {/* Fallback Wildcard redirecting to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
