import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import AppRoutes from './app/router/AppRoutes';
import ErrorBoundary from './shared/components/ErrorBoundary';

/**
 * Root Application component.
 * Configures React Router, Global Error Boundary, Toast Notifications, and Theme Sync.
 */
export default function App() {
  const [isDark, setIsDark] = useState(false);

  // Sync dark mode class with root html element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <ErrorBoundary>
      <Router>
        <AppRoutes />
        
        {/* Toast Alert stack configured globally */}
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          toastClassName="glass-panel border border-white/5 bg-slate-900/90 text-slate-100 text-sm font-sans"
        />
      </Router>
    </ErrorBoundary>
  );
}
