import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import authService from '../services/authService';
import PasswordStrength from './PasswordStrength';
import { ButtonLoader } from '../../../shared/components/Loader';
import { getFriendlyErrorMessage } from '../../../shared/utils/errors';

/**
 * ResetPasswordForm Component.
 * Manages entering new passwords with visibility toggles, strength indicators,
 * theme contrast, error state styling, and countdown redirect to login.
 */
export const ResetPasswordForm = ({ uid, token }) => {
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [errors, setErrors] = useState({});

  /**
   * Run client-side validations on new password and confirmation.
   */
  const validate = () => {
    const errs = {};
    if (!newPassword) {
      errs.newPassword = 'New password is required.';
    } else if (newPassword.length < 8) {
      errs.newPassword = 'Password must be at least 8 characters long.';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Please confirm your password.';
    } else if (newPassword !== confirmPassword) {
      errs.confirmPassword = 'Confirm password does not match.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await authService.resetPassword({
        uid,
        token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      setSuccess(true);
      toast.success('Password reset successfully! Redirecting to login...');
    } catch (err) {
      console.error('Reset password error:', err);
      const msg = getFriendlyErrorMessage(err) || 'Failed to reset password. Token may be expired.';
      toast.error(msg);
      setErrors({ auth: msg });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Automatic redirect countdown upon successful password reset.
   */
  useEffect(() => {
    let timer;
    if (success) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/login', { replace: true });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [success, navigate]);

  if (success) {
    return (
      <div className="text-center py-6 space-y-5 select-none" id="reset-password-success-card">
        <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-xl">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-foreground tracking-tight">Password Reset Complete</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed font-medium">
            Your security password has been updated successfully. You can now sign in with your new password.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-background border border-border text-xs text-muted-foreground font-medium max-w-xs mx-auto">
          Redirecting to Sign In in <span className="font-bold text-primary">{countdown}s</span>...
        </div>

        <div className="pt-2">
          <Link
            to="/login"
            className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span>Sign In Now</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate id="reset-password-form">
      {errors.auth && (
        <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-semibold flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <span>{errors.auth}</span>
        </div>
      )}

      {/* New Password Input */}
      <div>
        <label htmlFor="new-password" className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">
          New Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
            <Lock className="w-4 h-4" />
          </div>
          <input
            id="new-password"
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: null }));
            }}
            disabled={loading}
            aria-invalid={Boolean(errors.newPassword)}
            className={`w-full pl-10 pr-11 py-3 rounded-xl bg-background border text-foreground placeholder:text-muted-foreground focus:outline-none transition-all text-sm font-medium ${
              errors.newPassword
                ? 'border-destructive focus:ring-2 focus:ring-destructive/30 focus:border-destructive'
                : 'border-input focus:ring-2 focus:ring-primary/40 focus:border-primary'
            }`}
            placeholder="Min 8 characters"
            required
          />
          <button
            type="button"
            tabIndex={0}
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md h-7 my-auto"
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.newPassword && (
          <p className="text-xs text-destructive mt-1.5 font-semibold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errors.newPassword}</span>
          </p>
        )}

        {/* Password Strength Indicator */}
        <div className="mt-3">
          <PasswordStrength password={newPassword} />
        </div>
      </div>

      {/* Confirm Password Input */}
      <div>
        <label htmlFor="confirm-password" className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">
          Confirm New Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
            <Lock className="w-4 h-4" />
          </div>
          <input
            id="confirm-password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: null }));
            }}
            disabled={loading}
            aria-invalid={Boolean(errors.confirmPassword)}
            className={`w-full pl-10 pr-11 py-3 rounded-xl bg-background border text-foreground placeholder:text-muted-foreground focus:outline-none transition-all text-sm font-medium ${
              errors.confirmPassword
                ? 'border-destructive focus:ring-2 focus:ring-destructive/30 focus:border-destructive'
                : 'border-input focus:ring-2 focus:ring-primary/40 focus:border-primary'
            }`}
            placeholder="Repeat new password"
            required
          />
          <button
            type="button"
            tabIndex={0}
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={loading}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md h-7 my-auto"
            title={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-destructive mt-1.5 font-semibold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errors.confirmPassword}</span>
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
          <ButtonLoader text="Resetting Password..." />
        ) : (
          <span className="flex items-center gap-2">
            <span>Reset Password</span>
            <ArrowRight className="w-4 h-4" />
          </span>
        )}
      </button>
    </form>
  );
};

export default ResetPasswordForm;
