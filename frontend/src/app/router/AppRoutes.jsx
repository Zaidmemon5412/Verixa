import React, { lazy } from 'react';
import { Routes, Route, Navigate, useParams, useNavigate, useLocation } from 'react-router-dom';


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
const BuilderDetailsPage = lazy(() => import('../../features/builders/pages/BuilderDetailsPage'));
const LocalitiesPage = lazy(() => import('../../features/localities/pages/LocalitiesPage'));
const LocalityDetailsPage = lazy(() => import('../../features/localities/pages/LocalityDetailsPage'));
const ComparisonPage = lazy(() => import('../../features/comparison/pages/ComparisonPage'));

const MarketTrendsPage = lazy(() => import('../../features/market/pages/MarketTrendsPage'));

const Dashboard = lazy(() => import('../../features/dashboard/pages/Dashboard'));
const ProfilePage = lazy(() => import('../../features/profile/pages/ProfilePage'));
const ReportsPage = lazy(() => import('../../features/reports/pages/ReportsPage'));

const NotFound = lazy(() => import('../../shared/components/NotFound'));

// Route Wrapper Components for URL Parameter Passing
function PropertyDetailPageWrapper() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isLegalView = location.pathname.includes('/legal');

  return (
    <PropertyDetailPage
      projectId={id}
      isLegalView={isLegalView}
      onBack={() => navigate('/properties')}
      onSelectBuilder={(bId) => navigate(`/builders/${bId}`)}
    />
  );
}

function PropertiesPageWrapper() {
  const navigate = useNavigate();
  return (
    <PropertiesPage
      onSelectProject={(id, view) => {
        if (view === 'legal') {
          navigate(`/properties/${id}/legal`);
        } else {
          navigate(`/properties/${id}`);
        }
      }}
    />
  );
}


function BuildersPageWrapper() {
  const navigate = useNavigate();
  return (
    <BuildersPage
      onSelectBuilder={(bId) => navigate(`/builder/${bId}`)}
    />
  );
}

function BuilderDetailsPageWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <BuilderDetailsPage
      builderId={id}
      onSelectProject={(pId) => navigate(`/properties/${pId}`)}
      onBack={() => navigate('/builders')}
    />
  );
}

function LocalityDetailsPageWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <LocalityDetailsPage
      localityId={id}
      onSelectProject={(pId) => navigate(`/properties/${pId}`)}
    />
  );
}

function ComparisonPageWrapper() {
  const navigate = useNavigate();
  return (
    <ComparisonPage
      onSelectProject={(id) => navigate(`/properties/${id}`)}
    />
  );
}


function LandingPageWrapper() {
  const navigate = useNavigate();
  return (
    <LandingPage
      onNavigate={(path, id) => {
        if (path === 'detail' && id) navigate(`/properties/${id}`);
        else if (path === 'builder' && id) navigate(`/builders/${id}`);
        else if (path === 'projects') navigate('/properties');
        else if (path === 'builders') navigate('/builders');
        else if (path === 'localities') navigate('/localities');
        else if (path === 'compare') navigate('/comparison');
        else if (path === 'market') navigate('/market');
        else navigate(path.startsWith('/') ? path : `/${path}`);
      }}
      onSelectProject={(id) => navigate(`/properties/${id}`)}
    />
  );
}

export const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Public Routes Accessible Without Login (MainLayout Shell) */}
      <Route element={<MainLayout />}>
        <Route
          path="/"
          element={
            <AppSuspense fallback={<PageSkeleton />}>
              <LandingPageWrapper />
            </AppSuspense>
          }
        />
        <Route
          path="/properties"
          element={
            <AppSuspense fallback={<CardSkeleton count={6} />}>
              <PropertiesPageWrapper />
            </AppSuspense>
          }
        />
        <Route
          path="/properties/:id"
          element={
            <AppSuspense fallback={<PageSkeleton />}>
              <PropertyDetailPageWrapper />
            </AppSuspense>
          }
        />
        <Route
          path="/properties/:id/legal"
          element={
            <AppSuspense fallback={<PageSkeleton />}>
              <PropertyDetailPageWrapper />
            </AppSuspense>
          }
        />
        <Route
          path="/property/:id"
          element={
            <AppSuspense fallback={<PageSkeleton />}>
              <PropertyDetailPageWrapper />
            </AppSuspense>
          }
        />
        <Route
          path="/property/:id/legal"
          element={
            <AppSuspense fallback={<PageSkeleton />}>
              <PropertyDetailPageWrapper />
            </AppSuspense>
          }
        />

        <Route
          path="/builders"
          element={
            <AppSuspense fallback={<CardSkeleton count={4} />}>
              <BuildersPageWrapper />
            </AppSuspense>
          }
        />
        <Route
          path="/builders/:id"
          element={
            <AppSuspense fallback={<PageSkeleton />}>
              <BuilderDetailsPageWrapper />
            </AppSuspense>
          }
        />
        <Route
          path="/builder/:id"
          element={
            <AppSuspense fallback={<PageSkeleton />}>
              <BuilderDetailsPageWrapper />
            </AppSuspense>
          }
        />
        <Route
          path="/localities"
          element={
            <AppSuspense fallback={<CardSkeleton count={4} />}>
              <LocalitiesPage />
            </AppSuspense>
          }
        />
        <Route
          path="/locality/:id"
          element={
            <AppSuspense fallback={<PageSkeleton />}>
              <LocalityDetailsPageWrapper />
            </AppSuspense>
          }
        />
        <Route
          path="/localities/:id"
          element={
            <AppSuspense fallback={<PageSkeleton />}>
              <LocalityDetailsPageWrapper />
            </AppSuspense>
          }
        />

        <Route
          path="/market"
          element={
            <AppSuspense fallback={<PageSkeleton />}>
              <MarketTrendsPage />
            </AppSuspense>
          }
        />
        <Route
          path="/market-trends"
          element={
            <AppSuspense fallback={<PageSkeleton />}>
              <MarketTrendsPage />
            </AppSuspense>
          }
        />
        <Route
          path="/market/trends"
          element={
            <AppSuspense fallback={<PageSkeleton />}>
              <MarketTrendsPage />
            </AppSuspense>
          }
        />
      </Route>

      {/* 2. Public Authentication Routes (Isolated AuthLayout Shell) */}
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

      {/* 3. Protected Workspace Routes (Requires Authentication) */}
      <Route element={<MainLayout />}>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppSuspense fallback={<PageSkeleton />}>
                <Dashboard />
              </AppSuspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppSuspense fallback={<PageSkeleton />}>
                <ProfilePage />
              </AppSuspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <AppSuspense fallback={<ListSkeleton rows={4} />}>
                <ReportsPage />
              </AppSuspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/comparison"
          element={
            <ProtectedRoute>
              <AppSuspense fallback={<TableSkeleton rows={4} cols={3} />}>
                <ComparisonPageWrapper />
              </AppSuspense>
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 4. Fallback Page Not Found */}
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
