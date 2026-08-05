import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { ButtonLoader } from '../../../shared/components/Loader';
import { getFriendlyErrorMessage } from '../../../shared/utils/errors';

/**
 * Sign In Screen Component.
 * Implements real-estate portal authentication with field validation,
 * password visibility toggling, error state feedback, and return-path redirection.
 */
export const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  /**
   * Field validation check prior to API submission.
   */
  const validate = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await login(email.trim(), password);
      toast.success('Access granted. Welcome back to Verixa!');
      
      const destination = location.state?.from || '/';
      navigate(destination, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      let errorMsg = 'Invalid email or password.';
      if (err.response?.data?.detail) {
        errorMsg = err.response.data.detail;
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else {
        errorMsg = getFriendlyErrorMessage(err) || 'Invalid email or password.';
      }

      setValidationErrors({
        auth: errorMsg,
        email: ' ',
        password: ' '
      });
      toast.error(errorMsg);
    }
  };

  return (
    <div id="login-page" className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-extrabold text-white select-none tracking-tight">
          Sign In to Portal
        </h2>
        <p className="text-xs text-slate-400">
          Enter your credentials to access verified properties & AI decision tools
        </p>
      </div>

      {validationErrors.auth && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span>{validationErrors.auth}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (validationErrors.email) {
                  setValidationErrors((prev) => ({ ...prev, email: null, auth: null }));
                }
              }}
              disabled={loading}
              aria-invalid={Boolean(validationErrors.email)}
              className={`w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/80 border text-slate-100 placeholder-slate-600 focus:outline-none transition-all text-sm ${
                validationErrors.email
                  ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500'
                  : 'border-slate-800 focus:ring-2 focus:ring-primary/40 focus:border-primary'
              }`}
              placeholder="name@domain.com"
              required
            />
          </div>
          {validationErrors.email && validationErrors.email.trim() && (
            <p className="text-xs text-rose-500 mt-1.5 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{validationErrors.email}</span>
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-primary hover:underline font-semibold transition-colors select-none"
              id="forgot-password-link"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (validationErrors.password) {
                  setValidationErrors((prev) => ({ ...prev, password: null, auth: null }));
                }
              }}
              disabled={loading}
              aria-invalid={Boolean(validationErrors.password)}
              className={`w-full pl-10 pr-11 py-3 rounded-xl bg-slate-950/80 border text-slate-100 placeholder-slate-600 focus:outline-none transition-all text-sm ${
                validationErrors.password
                  ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500'
                  : 'border-slate-800 focus:ring-2 focus:ring-primary/40 focus:border-primary'
              }`}
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {validationErrors.password && validationErrors.password.trim() && (
            <p className="text-xs text-rose-500 mt-1.5 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{validationErrors.password}</span>
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-xl shadow-primary/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <ButtonLoader text="Signing In..." />
          ) : (
            <span className="flex items-center gap-2">
              <span>Sign In to Portal</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </button>
      </form>

      {/* Footer Navigation */}
      <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-800/80 pt-5">
        Don't have an account yet?{' '}
        <Link to="/register" className="text-primary font-bold hover:underline">
          Create Account
        </Link>
      </div>
    </div>
  );
};

export default Login;
