import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import authService from '../services/authService';
import PasswordStrength from './PasswordStrength';
import { ButtonLoader } from './Loader';
import { getFriendlyErrorMessage } from '../utils/errors';

/**
 * ResetPasswordForm component.
 * Manages entering new passwords, password strength, confirmation, and submission.
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
      errs.newPassword = 'Password must be at least 8 characters.';
    } else if (!/[A-Z]/.test(newPassword)) {
      errs.newPassword = 'Password must contain at least one uppercase letter.';
    } else if (!/[a-z]/.test(newPassword)) {
      errs.newPassword = 'Password must contain at least one lowercase letter.';
    } else if (!/\d/.test(newPassword)) {
      errs.newPassword = 'Password must contain at least one digit.';
    } else if (!/[^a-zA-Z0-9]/.test(newPassword)) {
      errs.newPassword = 'Password must contain at least one special character.';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Confirm password is required.';
    } else if (newPassword !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
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
      toast.success('Password reset successfully!');
    } catch (err) {
      const msg = getFriendlyErrorMessage(err);
      toast.error(msg);
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
      <div className="text-[#00ffff] bg-[#000000] p-4 text-center py-4 space-y-5 select-none" id="reset-password-success">
        <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-white tracking-tight">Password Reset Complete</h3>
          <p className="text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
            Your password has been updated successfully. You can now log in using your new password.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 max-w-xs mx-auto">
          <p className="text-xs text-slate-400">
            Redirecting to <span className="font-semibold text-brand-400">Sign In</span> page in{' '}
            <span className="font-extrabold text-white text-sm">{countdown}</span> seconds...
          </p>
        </div>

        <div className="pt-2">
          <Link
            to="/login"
            className="w-full py-3 px-4 rounded-lg bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-bold text-sm tracking-wide transition-all shadow-md shadow-brand-500/10 inline-flex items-center justify-center cursor-pointer"
          >
            Go to Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate id="reset-password-form">
      {/* New Password Field */}
      <div>
        <label htmlFor="new-password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          New Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
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
            autoFocus
            className={`w-full pl-10 pr-10 py-3 rounded-lg bg-slate-950/80 border text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors text-sm ${
              errors.newPassword ? 'border-red-500/80' : 'border-slate-800'
            }`}
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.newPassword && (
          <p className="text-xs text-red-400 mt-1.5 font-medium">{errors.newPassword}</p>
        )}

        {/* Live Password Strength Meter */}
        <PasswordStrength password={newPassword} />
      </div>

      {/* Confirm Password Field */}
      <div className="pt-1">
        <label htmlFor="confirm-password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Confirm New Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
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
            className={`w-full pl-10 pr-10 py-3 rounded-lg bg-slate-950/80 border text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors text-sm ${
              errors.confirmPassword ? 'border-red-500/80' : 'border-slate-800'
            }`}
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            tabIndex={-1}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-red-400 mt-1.5 font-medium">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 rounded-lg bg-brand-500 hover:bg-brand-600 active:bg-brand-700 disabled:bg-brand-500/50 text-white font-bold text-sm tracking-wide transition-all shadow-md shadow-brand-500/10 flex items-center justify-center cursor-pointer select-none"
        id="reset-password-submit-button"
      >
        {loading ? <ButtonLoader label="Updating Password..." /> : 'Reset Password'}
      </button>
    </form>
  );
};

export default ResetPasswordForm;
