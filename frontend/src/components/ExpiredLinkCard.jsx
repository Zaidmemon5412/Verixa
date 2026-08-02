import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

/**
 * ExpiredLinkCard component.
 * Rendered when a password reset token is invalid, used, or expired.
 */
export const ExpiredLinkCard = () => {
  return (
    <div className="text-center py-4 space-y-5 select-none" id="expired-link-card">
      <div className="mx-auto w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-extrabold text-white tracking-tight">
          Reset Link Expired or Invalid
        </h3>
        <p className="text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
          This password reset link is invalid, corrupt, or has already expired. For security reasons, password reset links can only be used once.
        </p>
      </div>

      <div className="pt-3 space-y-3">
        <Link
          to="/forgot-password"
          className="w-full py-3 px-4 rounded-lg bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-bold text-sm tracking-wide transition-all shadow-md shadow-brand-500/10 flex items-center justify-center space-x-2 cursor-pointer"
          id="request-new-link-button"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Request New Link</span>
        </Link>

        <Link
          to="/login"
          className="inline-flex items-center justify-center w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 font-semibold transition-colors space-x-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </div>
    </div>
  );
};

export default ExpiredLinkCard;
