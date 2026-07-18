import { Outlet } from 'react-router-dom';

/**
 * Authentication Layout component.
 * Standardizes visual aesthetics for Login and Registration screens with premium styles.
 */
export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 relative overflow-hidden px-4">
      {/* Visual background glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Brand Header Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="h-12 w-12 rounded-xl bg-brand-500 flex items-center justify-center font-extrabold text-white shadow-lg shadow-brand-500/25 mb-3 text-2xl select-none">
            V
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent select-none">
            Verixa
          </h1>
          <p className="text-slate-400 text-sm mt-1 text-center font-medium select-none">
            Property Decision & Verification Platform
          </p>
        </div>

        {/* Content Panel (Glassmorphism design matching index.css styles) */}
        <div className="glass-panel rounded-2xl shadow-2xl p-8 border border-white/5 bg-slate-900/60 backdrop-blur-xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
