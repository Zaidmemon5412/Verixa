import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';

/**
 * NotFound Component (404 Page).
 * Rendered when a user navigates to an invalid or missing route.
 */
export const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100 select-none">
      <div className="max-w-md w-full glass-panel p-8 rounded-2xl border border-white/5 text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shadow-xl shadow-brand-500/10">
          <FileQuestion className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">404</h1>
          <h2 className="text-lg font-bold text-slate-200">Page Not Found</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The page or resource you requested could not be located. It may have been moved, renamed, or is temporarily unavailable.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto py-2.5 px-4 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-brand-500/10"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>

          <Link
            to="/dashboard"
            className="w-full sm:w-auto py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/5 text-slate-300 font-semibold text-xs flex items-center justify-center space-x-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
