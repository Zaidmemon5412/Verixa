import React, { useEffect } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import AppRoutes from './app/router/AppRoutes';
import ErrorBoundary from './shared/components/ErrorBoundary';
import { ThemeProvider } from './shared/context/ThemeContext';
import { propertyService } from './features/properties/services/propertyService';

/**
 * Resets window scroll position to top on route navigation,
 * preserving in-page anchor links when a URL hash is present.
 */
function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, search, hash]);

  return null;
}

/**
 * Root Application component.
 * Configures React Router, Global Error Boundary, Toast Notifications, and Theme Sync.
 */
export default function App() {
  // Defer initial catalog & filter warming to idle time so first paint stays unblocked
  useEffect(() => {
    let idleId;
    let timerId;
    const warm = () => {
      propertyService.prefetchInitialPage();
    };

    if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(warm, { timeout: 600 });
    } else {
      timerId = setTimeout(warm, 120);
    }

    return () => {
      if (idleId !== undefined && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId);
      }
      if (timerId !== undefined) {
        clearTimeout(timerId);
      }
    };
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <ScrollToTop />
          <AppRoutes />
          
          {/* Toast Alert stack configured globally */}
          <ToastContainer
            position="bottom-right"
            autoClose={3500}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
