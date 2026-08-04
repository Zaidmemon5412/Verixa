import useAuth from '../../auth/hooks/useAuth';
import { User, Mail, Shield, Smartphone, Key } from 'lucide-react';

/**
 * ProfilePage Shell Placeholder component.
 * Route: /profile
 */
export const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Account & Security Profile</h1>
        <p className="text-xs text-slate-400">Manage account credentials, authentication settings, and preferences.</p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 space-y-6">
        <div className="flex items-center space-x-4 border-b border-white/5 pb-6">
          <div className="w-14 h-14 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-300 font-bold text-xl">
            {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{user?.full_name || 'Active User'}</h3>
            <p className="text-xs text-slate-400">@{user?.username || 'user'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex items-center space-x-3">
            <Mail className="w-5 h-5 text-brand-400" />
            <div>
              <span className="text-slate-400 block">Email Address</span>
              <span className="font-semibold text-white">{user?.email || 'N/A'}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex items-center space-x-3">
            <Smartphone className="w-5 h-5 text-brand-400" />
            <div>
              <span className="text-slate-400 block">Phone</span>
              <span className="font-semibold text-white">{user?.phone || 'Not configured'}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex items-center space-x-3">
            <Shield className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="text-slate-400 block">Session Status</span>
              <span className="font-semibold text-emerald-400">Authenticated (JWT)</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex items-center space-x-3">
            <Key className="w-5 h-5 text-brand-400" />
            <div>
              <span className="text-slate-400 block">Account Role</span>
              <span className="font-semibold text-white">{user?.role || 'User'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
