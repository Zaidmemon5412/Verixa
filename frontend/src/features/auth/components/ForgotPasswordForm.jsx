import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Mail, CheckCircle2, ArrowLeft, RefreshCw, AlertCircle, ArrowRight } from 'lucide-react';
import authService from '../services/authService';
import { ButtonLoader } from '../../../shared/components/Loader';
import { getFriendlyErrorMessage } from '../../../shared/utils/errors';

/**
 * ForgotPasswordForm Component.
 * Manages email submission for password reset links with theme tokens, error borders,
 * loading feedback, and success confirmation state.
 */
export const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (val) => {
    if (!val.trim()) {
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
      toast.success('Password reset email sent if an account exists.');
    } catch (err) {
      console.error('Forgot password error:', err);
      const msg = getFriendlyErrorMessage(err) || 'Failed to send reset link. Please check your email.';
      toast.error(msg);
      setEmailError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-4 space-y-5 select-none" id="forgot-password-success-card">
        <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-xl">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-foreground tracking-tight">Check Your Inbox</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed font-medium">
            If an account exists for <span className="font-bold text-primary">{email}</span>, we have sent password reset instructions to your email address.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-background border border-border text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto font-medium">
          Did not receive the email? Check your spam folder or try resending below.
        </div>

        <div className="pt-2 space-y-3">
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="w-full py-3 px-4 rounded-xl bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold text-sm transition-colors flex items-center justify-center space-x-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <RefreshCw className="w-4 h-4 text-primary" />
            <span>Resend Reset Email</span>
          </button>

          <Link
            to="/login"
            className="inline-flex items-center justify-center w-full py-2.5 text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors space-x-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
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
        <label htmlFor="forgot-email" className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
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
            aria-invalid={Boolean(emailError)}
            className={`w-full pl-10 pr-4 py-3 rounded-xl bg-background border text-foreground placeholder:text-muted-foreground focus:outline-none transition-all text-sm font-medium ${
              emailError
                ? 'border-destructive focus:ring-2 focus:ring-destructive/30 focus:border-destructive'
                : 'border-input focus:ring-2 focus:ring-primary/40 focus:border-primary'
            }`}
            placeholder="name@domain.com"
            required
          />
        </div>
        {emailError && (
          <p className="text-xs text-destructive mt-1.5 font-semibold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{emailError}</span>
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-xl shadow-primary/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {loading ? (
          <ButtonLoader text="Sending Reset Link..." />
        ) : (
          <span className="flex items-center gap-2">
            <span>Send Reset Instructions</span>
            <ArrowRight className="w-4 h-4" />
          </span>
        )}
      </button>

      {/* Back to Sign In */}
      <div className="mt-4 text-center border-t border-border/80 pt-4">
        <Link to="/login" className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
          <ArrowLeft className="w-3.5 h-3.5 text-primary" />
          <span>Back to Sign In</span>
        </Link>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
