import React, { lazy, useCallback } from 'react';
import { Routes, Route, Navigate, useParams, useNavigate, useLocation } from 'react-router-dom';


// Layout wrappers (MainLayout eager for shell; AuthLayout isolated & lazy)
import MainLayout from '../layouts/MainLayout';
const AuthLayout = lazy(() => import('../layouts/AuthLayout'));

// Guard & Performance components
import ProtectedRoute from '../../shared/components/ProtectedRoute';
import PublicRoute from '../../features/auth/components/PublicRoute';
import AppSuspense from '../../shared/components/AppSuspense';
import {
  PageSkeleton,
  ListSkeleton,
  LandingPageSkeleton,
  PropertiesPageSkeleton,
  PropertyDetailSkeleton,
  BuildersPageSkeleton,
  BuilderDetailSkeleton,
  LocalitiesPageSkeleton,
  LocalityDetailSkeleton,
  MarketTrendsSkeleton,
  ComparisonPageSkeleton,
  GuidesPageSkeleton,
  GuideDetailSkeleton,
  ProfilePageSkeleton,
} from '../../shared/components/skeletons';

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
const GuidesPage = lazy(() => import('../../features/guides/pages/GuidesPage'));
const GuideDetailPage = lazy(() => import('../../features/guides/pages/GuideDetailPage'));

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
  const handleBack = useCallback(() => navigate('/properties'), [navigate]);
  const handleSelectBuilder = useCallback((bId) => navigate(`/builders/${bId}`), [navigate]);

  return (
    <PropertyDetailPage
      projectId={id}
      isLegalView={isLegalView}
      onBack={handleBack}
      onSelectBuilder={handleSelectBuilder}
    />
  );
}

function PropertiesPageWrapper() {
  const navigate = useNavigate();
  const handleSelectProject = useCallback((id, view) => {
    if (view === 'legal') {
      navigate(`/properties/${id}/legal`);
    } else {
      navigate(`/properties/${id}`);
    }
  }, [navigate]);

  return (
    <PropertiesPage
      onSelectProject={handleSelectProject}
    />
  );
}


function BuildersPageWrapper() {
  const navigate = useNavigate();
  const handleSelectBuilder = useCallback((bId) => navigate(`/builders/${bId}`), [navigate]);
  return (
    <BuildersPage
      onSelectBuilder={handleSelectBuilder}
    />
  );
}

function ParamRedirect({ toPrefix, suffix = '' }) {
  const { id } = useParams();
  return <Navigate to={`${toPrefix}/${id}${suffix}`} replace />;
}

function BuilderDetailsPageWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();
  const handleSelectProject = useCallback((pId) => navigate(`/properties/${pId}`), [navigate]);
  const handleBack = useCallback(() => navigate('/builders'), [navigate]);
  return (
    <BuilderDetailsPage
      builderId={id}
      onSelectProject={handleSelectProject}
      onBack={handleBack}
    />
  );
}

function LocalityDetailsPageWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();
  const handleSelectProject = useCallback((pId) => navigate(`/properties/${pId}`), [navigate]);

  return (
    <LocalityDetailsPage
      localityId={id}
      onSelectProject={handleSelectProject}
    />
  );
}

function ComparisonPageWrapper() {
  const navigate = useNavigate();
  const handleSelectProject = useCallback((id) => navigate(`/properties/${id}`), [navigate]);
  return (
    <ComparisonPage
      onSelectProject={handleSelectProject}
    />
  );
}


function LandingPageWrapper() {
  const navigate = useNavigate();
  const handleNavigate = useCallback((path, id) => {
    if (path === 'detail' && id) navigate(`/properties/${id}`);
    else if (path === 'builder' && id) navigate(`/builders/${id}`);
    else if (path === 'projects') navigate('/properties');
    else if (path === 'builders') navigate('/builders');
    else if (path === 'localities') navigate('/localities');
    else if (path === 'compare') navigate('/comparison');
    else if (path === 'market') navigate('/market');
    else navigate(path.startsWith('/') ? path : `/${path}`);
  }, [navigate]);
  const handleSelectProject = useCallback((id) => navigate(`/properties/${id}`), [navigate]);

  return (
    <LandingPage
      onNavigate={handleNavigate}
      onSelectProject={handleSelectProject}
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
            <AppSuspense fallback={<LandingPageSkeleton />}>
              <LandingPageWrapper />
            </AppSuspense>
          }
        />
        <Route
          path="/properties"
          element={
            <AppSuspense fallback={<PropertiesPageSkeleton />}>
              <PropertiesPageWrapper />
            </AppSuspense>
          }
        />
        <Route
          path="/properties/:id"
          element={
            <AppSuspense fallback={<PropertyDetailSkeleton />}>
              <PropertyDetailPageWrapper />
            </AppSuspense>
          }
        />
        <Route
          path="/properties/:id/legal"
          element={
            <AppSuspense fallback={<PropertyDetailSkeleton />}>
              <PropertyDetailPageWrapper />
            </AppSuspense>
          }
        />
        <Route
          path="/property/:id"
          element={<ParamRedirect toPrefix="/properties" />}
        />
        <Route
          path="/property/:id/legal"
          element={<ParamRedirect toPrefix="/properties" suffix="/legal" />}
        />

        <Route
          path="/builders"
          element={
            <AppSuspense fallback={<BuildersPageSkeleton />}>
              <BuildersPageWrapper />
            </AppSuspense>
          }
        />
        <Route
          path="/builders/:id"
          element={
            <AppSuspense fallback={<BuilderDetailSkeleton />}>
              <BuilderDetailsPageWrapper />
            </AppSuspense>
          }
        />
        <Route
          path="/builder/:id"
          element={<ParamRedirect toPrefix="/builders" />}
        />
        <Route
          path="/localities"
          element={
            <AppSuspense fallback={<LocalitiesPageSkeleton />}>
              <LocalitiesPage />
            </AppSuspense>
          }
        />
        <Route
          path="/locality/:id"
          element={<ParamRedirect toPrefix="/localities" />}
        />
        <Route
          path="/localities/:id"
          element={
            <AppSuspense fallback={<LocalityDetailSkeleton />}>
              <LocalityDetailsPageWrapper />
            </AppSuspense>
          }
        />

        <Route
          path="/market"
          element={
            <AppSuspense fallback={<MarketTrendsSkeleton />}>
              <MarketTrendsPage />
            </AppSuspense>
          }
        />
        <Route
          path="/market-trends"
          element={<Navigate to="/market" replace />}
        />
        <Route
          path="/market/trends"
          element={<Navigate to="/market" replace />}
        />
        <Route
          path="/comparison"
          element={
            <AppSuspense fallback={<ComparisonPageSkeleton />}>
              <ComparisonPageWrapper />
            </AppSuspense>
          }
        />
        <Route
          path="/guides"
          element={
            <AppSuspense fallback={<GuidesPageSkeleton />}>
              <GuidesPage />
            </AppSuspense>
          }
        />
        <Route
          path="/guides/:slug"
          element={
            <AppSuspense fallback={<GuideDetailSkeleton />}>
              <GuideDetailPage />
            </AppSuspense>
          }
        />
      </Route>

      {/* 2. Public Authentication Routes (Isolated AuthLayout Shell) */}
      <Route
        element={
          <AppSuspense>
            <AuthLayout />
          </AppSuspense>
        }
      >
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
              <AppSuspense fallback={<ProfilePageSkeleton />}>
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
