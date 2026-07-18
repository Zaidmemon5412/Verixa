import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * Dashboard Layout component.
 * Provides the shared header, routing navigation links, and account settings / logout options.
 */
export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/', label: 'Dashboard' },
    { path: '/map', label: 'Geospatial Map' },
    { path: '/compare', label: 'Compare Matrix' },
    { path: '/verify', label: 'Deed Verification' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100" id="dashboard-layout">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-900 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-3 group">
            <span className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center font-bold text-white shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform select-none">V</span>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent select-none">Verixa</span>
          </Link>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex space-x-6 text-sm font-medium text-slate-300">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-colors duration-150 ${
                  isActive ? 'text-brand-400 font-semibold border-b-2 border-brand-500 pb-0.5' : 'text-slate-400 hover:text-brand-300'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User Identity Panel */}
        <div className="flex items-center space-x-4">
          {user && (
            <div className="hidden sm:flex flex-col text-right select-none">
              <span className="text-xs font-semibold text-slate-200">{user.full_name || user.username}</span>
              <span className="text-[10px] text-slate-500 capitalize">{user.role || 'User'}</span>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm duration-150"
            id="logout-button"
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Dynamic Route Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6" id="dashboard-main-content">
        <Outlet />
      </main>

      {/* Global Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600 select-none">
        &copy; {new Date().getFullYear()} Verixa Technologies. All rights reserved. Startup Property verification system.
      </footer>
    </div>
  );
};

export default DashboardLayout;
