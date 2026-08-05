import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from '../hooks/useAuth';
import { ButtonLoader } from '../../../shared/components/Loader';
import { getFriendlyErrorMessage } from '../../../shared/utils/errors';

/**
 * Registration Screen component.
 * Allows new users to create accounts.
 * Required Flow: Register -> Account Created -> Show Success Toast -> Redirect to /login
 * (Does NOT auto-login, create sessions, or store tokens).
 */
export const Register = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
  });

  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  /**
   * Run local criteria checks prior to backend submission.
   */
  const validate = () => {
    const errors = {};
    if (!formData.full_name.trim()) {
      errors.full_name = 'Full name is required';
    }
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    }
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }
    if (formData.password !== formData.confirm_password) {
      errors.confirm_password = 'Passwords do not match';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const response = await register(formData);
      if (response.success || response.data) {
        toast.success('Account created successfully! Please sign in with your credentials.');
        navigate('/login');
      } else {
        toast.error(response.message || 'Registration failed.');
      }
    } catch (err) {
      const dataErrors = err.response?.data?.data || err.response?.data;
      if (dataErrors && typeof dataErrors === 'object') {
        const errorList = {};
        Object.keys(dataErrors).forEach((key) => {
          if (key !== 'success' && key !== 'message') {
            const errorVal = dataErrors[key];
            errorList[key] = Array.isArray(errorVal) ? errorVal[0] : errorVal;
          }
        });
        setValidationErrors(errorList);
      }
      const errorMessage = getFriendlyErrorMessage(err);
      toast.error(errorMessage);
    }
  };

  return (
    <div id="register-page">
      <h2 className="text-xl font-extrabold text-white mb-6 text-center select-none tracking-tight">
        Create Your Account
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Full Name */}
        <div>
          <label htmlFor="full_name" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Full Name
          </label>
          <input
            id="full_name"
            type="text"
            value={formData.full_name}
            onChange={handleChange}
            disabled={loading}
            className={`w-full px-3.5 py-2.5 rounded-lg bg-slate-950/80 border text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-sm ${
              validationErrors.full_name ? 'border-red-500/80' : 'border-slate-800'
            }`}
            placeholder="John Doe"
            required
          />
          {validationErrors.full_name && (
            <p className="text-xs text-red-500 mt-1 font-medium">{validationErrors.full_name}</p>
          )}
        </div>

        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            disabled={loading}
            className={`w-full px-3.5 py-2.5 rounded-lg bg-slate-950/80 border text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-sm ${
              validationErrors.username ? 'border-red-500/80' : 'border-slate-800'
            }`}
            placeholder="johndoe"
            required
          />
          {validationErrors.username && (
            <p className="text-xs text-red-500 mt-1 font-medium">{validationErrors.username}</p>
          )}
        </div>

        {/* Email Address */}
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            className={`w-full px-3.5 py-2.5 rounded-lg bg-slate-950/80 border text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-sm ${
              validationErrors.email ? 'border-red-500/80' : 'border-slate-800'
            }`}
            placeholder="john@domain.com"
            required
          />
          {validationErrors.email && (
            <p className="text-xs text-red-500 mt-1 font-medium">{validationErrors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Phone Number (Optional)
          </label>
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-sm"
            placeholder="+91 9876543210"
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            className={`w-full px-3.5 py-2.5 rounded-lg bg-slate-950/80 border text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-sm ${
              validationErrors.password ? 'border-red-500/80' : 'border-slate-800'
            }`}
            placeholder="Min 8 characters"
            required
          />
          {validationErrors.password && (
            <p className="text-xs text-red-500 mt-1 font-medium">{validationErrors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirm_password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Confirm Password
          </label>
          <input
            id="confirm_password"
            type="password"
            value={formData.confirm_password}
            onChange={handleChange}
            disabled={loading}
            className={`w-full px-3.5 py-2.5 rounded-lg bg-slate-950/80 border text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-sm ${
              validationErrors.confirm_password ? 'border-red-500/80' : 'border-slate-800'
            }`}
            placeholder="Repeat password"
            required
          />
          {validationErrors.confirm_password && (
            <p className="text-xs text-red-500 mt-1 font-medium">{validationErrors.confirm_password}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-lg shadow-primary/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
        >
          {loading ? <ButtonLoader text="Creating Account..." /> : <span>Create Account</span>}
        </button>
      </form>

      {/* Sign In Navigation */}
      <div className="mt-6 text-center text-xs text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="text-primary font-bold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default Register;
