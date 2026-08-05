import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Building2, ArrowLeft } from 'lucide-react';

/**
 * AuthLayout Component.
 * Dedicated isolated layout wrapper for authentication pages: Login, Register, Forgot Password, Reset Password.
 * Displays Brand Logo, Authentication Form (<Outlet />), and Back to Home Link.
 * Completely hides Main Navbar, Main Footer, and App Shell components.
 */
export const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden selection:bg-brand-500 selection:text-white">
      {/* Background Ambient Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 z-10">
        {/* Brand Header Emblem */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2.5 group">
            <div className="w-11 h-11 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary group-hover:bg-primary/30 transition-all shadow-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold text-white tracking-tight">
              VERIXA<span className="text-primary">.</span>
            </span>
          </Link>
        </div>

        {/* Back to Home Link */}
        <div className="flex justify-between items-center text-xs">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Auth Form Card Container */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl bg-slate-900/80">
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
