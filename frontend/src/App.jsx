import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import AppRoutes from './app/router/AppRoutes';
import ErrorBoundary from './shared/components/ErrorBoundary';
import { ThemeProvider } from './shared/context/ThemeContext';

/**
 * Root Application component.
 * Configures React Router, Global Error Boundary, Toast Notifications, and Theme Sync.
 */
export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
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
