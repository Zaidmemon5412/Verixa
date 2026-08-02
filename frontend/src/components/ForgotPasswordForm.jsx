import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Mail, CheckCircle2, ArrowLeft, RefreshCw } from 'lucide-react';
import authService from '../services/authService';
import { ButtonLoader } from './Loader';
import { getFriendlyErrorMessage } from '../utils/errors';

/**
 * ForgotPasswordForm component.
 * Manages entering email, form validation, submit loading state, error handling,
 * and displaying success message upon submission.
 */
export const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (val) => {
    if (!val) {
      return 'Email address is required.';
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(val.trim())) {
      return 'Please enter a valid email address.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      return;
    }

    setEmailError('');
    setLoading(true);

    try {
      await authService.forgotPassword(email.trim());
      setSubmitted(true);
      toast.success('Password reset email sent if account exists.');
    } catch (err) {
      const msg = getFriendlyErrorMessage(err);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-4 space-y-5 select-none" id="forgot-password-success-card">
        <div className="mx-auto w-14 h-14 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shadow-lg shadow-brand-500/10">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-white tracking-tight">Check Your Inbox</h3>
          <p className="text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
            If an account exists for <span className="font-semibold text-brand-300">{email}</span>, we have sent a password reset link to your email address.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
          Did not receive the email? Check your spam folder or try resending.
        </div>

        <div className="pt-2 space-y-3">
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="w-full py-3 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-colors flex items-center justify-center space-x-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Resend Email</span>
          </button>

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
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate id="forgot-password-form">
      {/* Email Input Field */}
      <div>
        <label htmlFor="forgot-email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Mail className="w-4 h-4" />
          </div>
          <input
            id="forgot-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError('');
            }}
            disabled={loading}
            autoFocus
            className={`w-full pl-10 pr-4 py-3 rounded-lg bg-slate-950/80 border text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors text-sm ${
              emailError ? 'border-red-500/80' : 'border-slate-800'
            }`}
            placeholder="name@example.com"
            required
          />
        </div>
        {emailError && (
          <p className="text-xs text-red-400 mt-1.5 font-medium">{emailError}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 rounded-lg bg-brand-500 hover:bg-brand-600 active:bg-brand-700 disabled:bg-brand-500/50 text-white font-bold text-sm tracking-wide transition-all shadow-md shadow-brand-500/10 flex items-center justify-center cursor-pointer select-none"
        id="forgot-password-submit-button"
      >
        {loading ? <ButtonLoader label="Sending Reset Link..." /> : 'Send Reset Link'}
      </button>

      {/* Back to Login Link */}
      <div className="text-center pt-2">
        <Link
          to="/login"
          className="inline-flex items-center text-xs text-slate-400 hover:text-slate-200 font-semibold transition-colors space-x-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
