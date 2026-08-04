import { useLocation } from 'react-router-dom';
import { Search, Bell, ShieldCheck, HelpCircle } from 'lucide-react';
import useAuth from '../../features/auth/hooks/useAuth';

/**
 * DashboardHeader Component for DashboardLayout.
 * Top bar displaying current section breadcrumb, global search, notifications badge.
 */
export const DashboardHeader = () => {
  const { user } = useAuth();
  const location = useLocation();

  const getBreadcrumbTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Intelligence Dashboard';
      case '/profile':
        return 'Account & Profile Settings';
      case '/comparison':
        return 'Decision Matrix & Comparison';
      case '/reports':
        return 'Verified Reports Archive';
      default:
        return 'Dashboard Workspace';
    }
  };

  return (
    <header className="h-16 border-b border-white/5 bg-slate-950/60 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Title / Breadcrumb */}
      <div>
        <h1 className="text-sm font-extrabold text-white tracking-tight flex items-center space-x-2">
          <span>{getBreadcrumbTitle()}</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400">
            Active Session
          </span>
        </h1>
      </div>

      {/* Action Items */}
      <div className="flex items-center space-x-3">
        {/* Placeholder Search */}
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Search reports or properties..."
            className="w-56 pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
        </div>

        {/* Notifications Button Placeholder */}
        <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 relative transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
        </button>

        {/* Support Help Placeholder */}
        <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
