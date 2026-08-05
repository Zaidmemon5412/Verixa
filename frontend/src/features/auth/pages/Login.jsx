import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from '../hooks/useAuth';
import { ButtonLoader } from '../../../shared/components/Loader';
import { getFriendlyErrorMessage } from '../../../shared/utils/errors';

/**
 * Login Screen component.
 * Validates credentials and logs in users, redirecting back to previous location or homepage root.
 */
export const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  /**
   * Run local validation tests before triggering service logins.
   */
  const validate = () => {
    const errors = {};
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!password) {
      errors.password = 'Password is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await login(email, password);
      toast.success('Access granted. Welcome back!');
      
      // Case A: Redirect back to protected page if state.from exists.
      // Case B: Direct login -> Redirect to '/' (homepage root).
      const destination = location.state?.from || '/';
      navigate(destination, { replace: true });
    } catch (err) {
      const errorMessage = getFriendlyErrorMessage(err);
      toast.error(errorMessage);
    }
  };

  return (
    <div id="login-page">
      <h2 className="text-xl font-extrabold text-white mb-6 text-center select-none tracking-tight">
        Sign In to Portal
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className={`w-full px-4 py-3 rounded-lg bg-slate-950/80 border text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-sm ${
              validationErrors.email ? 'border-red-500/80' : 'border-slate-800'
            }`}
            placeholder="name@domain.com"
            required
          />
          {validationErrors.email && (
            <p className="text-xs text-red-500 mt-1.5 font-medium">{validationErrors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
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
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className={`w-full px-4 py-3 rounded-lg bg-slate-950/80 border text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-sm ${
              validationErrors.password ? 'border-red-500/80' : 'border-slate-800'
            }`}
            placeholder="••••••••"
            required
          />
          {validationErrors.password && (
            <p className="text-xs text-red-500 mt-1.5 font-medium">{validationErrors.password}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-lg shadow-primary/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {loading ? <ButtonLoader text="Authenticating..." /> : <span>Sign In</span>}
        </button>
      </form>

      {/* Footer Navigation */}
      <div className="mt-6 text-center text-xs text-slate-400">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary font-bold hover:underline">
          Create Account
        </Link>
      </div>
    </div>
  );
};

export default Login;
