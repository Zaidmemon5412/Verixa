import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import AppRoutes from './routes/AppRoutes';

/**
 * Root Application component.
 * Sets up routing contexts and registers the global ToastContainer notification alert stack.
 */
export default function App() {
  return (
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
  );
}
