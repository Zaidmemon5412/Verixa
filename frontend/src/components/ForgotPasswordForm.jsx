import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import authService from '../services/authService';
import { ButtonLoader } from './Loader';
import { getFriendlyErrorMessage } from '../utils/errors';

/**
 * ForgotPasswordForm component.
 * Renders the email input form and success state for password reset requests.
 */
export const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState('');

  const validate = () => {
    if (!email || !email.trim()) {
      setValidationError('Email address is required.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setValidationError('Please enter a valid email address.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      setSubmitted(true);
      toast.success('Password reset email sent!');
    } catch (err) {
      const errorMsg = getFriendlyErrorMessage(err);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-4 space-y-5 select-none" id="forgot-password-success">
        <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white tracking-tight">Check Your Inbox</h3>
          <p className="text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
            If an account matching <span className="font-semibold text-brand-400">{email}</span> exists, we have sent a password reset link to your email address.
          </p>
        </div>
        <p className="text-xs text-slate-500">
          Didn&apos;t receive the email? Check your spam folder or try submitting again.
        </p>
        <div className="pt-4 flex flex-col space-y-3">
          <button
            onClick={() => {
              setSubmitted(false);
              setEmail('');
            }}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
          >
            Resend Email
          </button>
          <Link
            to="/login"
            className="inline-flex items-center justify-center text-xs text-brand-400 hover:text-brand-300 font-semibold transition-colors space-x-1"
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
      <div>
        <label htmlFor="reset-email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Registered Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Mail className="w-4 h-4" />
          </div>
          <input
            id="reset-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (validationError) setValidationError('');
            }}
            disabled={loading}
            autoFocus
            className={`w-full pl-10 pr-4 py-3 rounded-lg bg-slate-950/80 border text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors text-sm ${
              validationError ? 'border-red-500/80' : 'border-slate-800'
            }`}
            placeholder="name@domain.com"
            required
          />
        </div>
        {validationError && (
          <p className="text-xs text-red-400 mt-1.5 font-medium">{validationError}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 rounded-lg bg-brand-500 hover:bg-brand-600 active:bg-brand-700 disabled:bg-brand-500/50 text-white font-bold text-sm tracking-wide transition-all shadow-md shadow-brand-500/10 flex items-center justify-center cursor-pointer select-none"
        id="forgot-password-submit-button"
      >
        {loading ? <ButtonLoader label="Sending Reset Link..." /> : 'Send Reset Link'}
      </button>

      <div className="text-center pt-2 select-none">
        <Link
          to="/login"
          className="inline-flex items-center text-xs text-slate-400 hover:text-slate-200 font-medium transition-colors space-x-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
