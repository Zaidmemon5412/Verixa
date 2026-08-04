import { Outlet, Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';

/**
 * AuthLayout Component.
 * Used for authentication flows: Login, Register, Forgot Password, Reset Password.
 * Structure: Centered Authentication Glass Container + Outlet
 */
export const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden selection:bg-brand-500 selection:text-white">
      {/* Dynamic Background Glow Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 z-10">
        {/* Brand Header Emblem */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 group-hover:bg-brand-500/30 transition-all shadow-lg shadow-brand-500/10">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-2xl font-extrabold text-white tracking-tight">
              VERIXA<span className="text-brand-400">.</span>
            </span>
          </Link>
        </div>

        {/* Centered Auth Card Container */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl">
          <Outlet />
        </div>

        {/* Security Tagline */}
        <div className="text-center text-[11px] text-slate-500">
          Encrypted Authentication • Verixa Real Estate Platform
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
