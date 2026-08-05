import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Building2, ArrowLeft } from 'lucide-react';

/**
 * AuthLayout Component.
 * Dedicated isolated layout wrapper for authentication pages: Login, Register, Forgot Password, Reset Password.
 * Displays Brand Logo, Authentication Form (<Outlet />), and Back to Home Link.
 * Completely isolates from Main Navbar, Main Footer, and App Shell components.
 */
export const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background text-foreground transition-colors duration-200 relative overflow-hidden selection:bg-primary selection:text-primary-foreground">
      {/* Background Ambient Glow Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 dark:bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 z-10">
        {/* Brand Header Emblem */}
        <div className="text-center space-y-2">
          <Link
            to="/"
            className="inline-flex items-center space-x-2.5 group rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 p-1"
          >
            <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary group-hover:bg-primary/25 transition-all shadow-md">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold text-foreground tracking-tight">
              VERIXA<span className="text-primary">.</span>
            </span>
          </Link>
        </div>

        {/* Back to Home Link */}
        <div className="flex justify-between items-center text-xs">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md px-1 py-0.5"
          >
            <ArrowLeft className="w-4 h-4 text-primary" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Auth Form Card Container */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-border shadow-2xl backdrop-blur-xl bg-card/90 text-card-foreground">
          <Outlet />
        </div>

        {/* Security Tagline */}
        <div className="text-center text-[11px] text-muted-foreground font-medium">
          Encrypted Authentication • Verixa Real Estate Platform
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
