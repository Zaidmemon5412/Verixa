import { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout wrappers
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Guard & Performance components
import ProtectedRoute from '../../shared/components/ProtectedRoute';
import PublicRoute from '../../features/auth/components/PublicRoute';
import AppSuspense from '../../shared/components/AppSuspense';
import { PageSkeleton, CardSkeleton, ListSkeleton, TableSkeleton } from '../../shared/components/skeletons';

// Route-Based Lazy Loaded Features
const Login = lazy(() => import('../../features/auth/pages/Login'));
const Register = lazy(() => import('../../features/auth/pages/Register'));
const ForgotPassword = lazy(() => import('../../features/auth/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('../../features/auth/pages/ResetPassword'));

const LandingPage = lazy(() => import('../../features/landing/pages/LandingPage'));
const PropertiesPage = lazy(() => import('../../features/properties/pages/PropertiesPage'));
const PropertyDetailPage = lazy(() => import('../../features/properties/pages/PropertyDetailPage'));
const BuildersPage = lazy(() => import('../../features/builders/pages/BuildersPage'));
const BuilderDetailPage = lazy(() => import('../../features/builders/pages/BuilderDetailPage'));

const Dashboard = lazy(() => import('../../features/dashboard/pages/Dashboard'));
const ProfilePage = lazy(() => import('../../features/profile/pages/ProfilePage'));
const PropertyComparison = lazy(() => import('../../features/comparison/pages/PropertyComparison'));
const ReportsPage = lazy(() => import('../../features/reports/pages/ReportsPage'));

const NotFound = lazy(() => import('../../shared/components/NotFound'));

/**
 * AppRoutes configures nested routing structures with route-based code splitting and global Suspense fallbacks.
 */
export const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Public Main Layout Routes */}
      <Route element={<MainLayout />}>
        <Route
          path="/"
          element={
            <AppSuspense fallback={<PageSkeleton />}>
              <LandingPage />
            </AppSuspense>
          }
        />
        <Route
          path="/properties"
          element={
            <AppSuspense fallback={<CardSkeleton count={3} />}>
              <PropertiesPage />
            </AppSuspense>
          }
        />
        <Route
          path="/property/:id"
          element={
            <AppSuspense fallback={<PageSkeleton />}>
              <PropertyDetailPage />
            </AppSuspense>
          }
        />
        <Route
          path="/builders"
          element={
            <AppSuspense fallback={<CardSkeleton count={3} />}>
              <BuildersPage />
            </AppSuspense>
          }
        />
        <Route
          path="/builder/:id"
          element={
            <AppSuspense fallback={<PageSkeleton />}>
              <BuilderDetailPage />
            </AppSuspense>
          }
        />
      </Route>

      {/* 2. Public Authentication Routes */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <AppSuspense>
                <Login />
              </AppSuspense>
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <AppSuspense>
                <Register />
              </AppSuspense>
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <AppSuspense>
                <ForgotPassword />
              </AppSuspense>
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <AppSuspense>
                <ResetPassword />
              </AppSuspense>
            </PublicRoute>
          }
        />
      </Route>

      {/* 3. Protected Dashboard Workspace Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/dashboard"
          element={
            <AppSuspense fallback={<PageSkeleton />}>
              <Dashboard />
            </AppSuspense>
          }
        />
        <Route
          path="/profile"
          element={
            <AppSuspense fallback={<PageSkeleton />}>
              <ProfilePage />
            </AppSuspense>
          }
        />
        <Route
          path="/comparison"
          element={
            <AppSuspense fallback={<TableSkeleton rows={4} cols={3} />}>
              <PropertyComparison />
            </AppSuspense>
          }
        />
        <Route
          path="/reports"
          element={
            <AppSuspense fallback={<ListSkeleton rows={4} />}>
              <ReportsPage />
            </AppSuspense>
          }
        />
      </Route>

      {/* 4. Fallback Routes */}
      <Route
        path="/404"
        element={
          <AppSuspense>
            <NotFound />
          </AppSuspense>
        }
      />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default AppRoutes;
