import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  GitCompare,
  FileText,
  Bookmark,
  Building2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sliders,
} from 'lucide-react';
import useAuth from '../../features/auth/hooks/useAuth';

/**
 * Sidebar Component for DashboardLayout.
 * Collapsible sidebar with active route state highlighting and user profile card.
 */
export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Profile', path: '/profile', icon: User },
    { label: 'Comparison Matrix', path: '/comparison', icon: GitCompare },
    { label: 'Reports', path: '/reports', icon: FileText },
  ];

  return (
    <aside
      className={`h-screen sticky top-0 bg-slate-950 border-r border-white/5 flex flex-col justify-between transition-all duration-300 z-30 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        {/* Top Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/5">
          {!collapsed && (
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-base font-extrabold text-white tracking-tight">
                VERIXA<span className="text-brand-400">.</span>
              </span>
            </Link>
          )}

          {collapsed && (
            <Link to="/" className="mx-auto">
              <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
                <Building2 className="w-4 h-4" />
              </div>
            </Link>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors hidden sm:block"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Group */}
        <div className="p-3 space-y-1">
          {!collapsed && (
            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 select-none">
              Workspace
            </p>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-sm shadow-brand-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  } ${collapsed ? 'justify-center px-0' : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Bottom User Action Bar */}
      <div className="p-3 border-t border-white/5 space-y-2">
        {!collapsed && (
          <div className="px-3 py-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-300 font-bold text-xs flex items-center justify-center border border-brand-500/30 shrink-0">
              {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-100 truncate">
                {user?.full_name || user?.username || 'User Profile'}
              </p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email || 'User Session'}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors ${
            collapsed ? 'justify-center px-0' : ''
          }`}
          title="Sign Out"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
