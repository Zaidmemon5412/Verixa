import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import AppRoutes from './app/router/AppRoutes';
import ErrorBoundary from './shared/components/ErrorBoundary';

/**
 * Root Application component.
 * Configures Global Error Boundary, router contexts, and global toast notifications.
 */
export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AppRoutes />
        
        {/* Toast Alert stack configured globally with styling matching dark panel themes */}
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
