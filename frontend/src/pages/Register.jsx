import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from '../hooks/useAuth';
import { ButtonLoader } from '../components/Loader';
import { getFriendlyErrorMessage } from '../utils/errors';

/**
 * Registration Screen component.
 * Allows new users to create accounts, providing full credentials.
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
      if (response.success) {
        toast.success('Registration successful! Please login.');
        navigate('/login');
      } else {
        toast.error(response.message || 'Registration failed.');
      }
    } catch (err) {
      // Map Django nested validation failures to local input field errors
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
            className={`w-full px-4 py-2.5 rounded-lg bg-slate-950/80 border text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors text-sm ${
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
            className={`w-full px-4 py-2.5 rounded-lg bg-slate-950/80 border text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors text-sm ${
              validationErrors.username ? 'border-red-500/80' : 'border-slate-800'
            }`}
            placeholder="johndoe12"
            required
          />
          {validationErrors.username && (
            <p className="text-xs text-red-500 mt-1 font-medium">{validationErrors.username}</p>
          )}
        </div>

        {/* Email */}
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
            className={`w-full px-4 py-2.5 rounded-lg bg-slate-950/80 border text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors text-sm ${
              validationErrors.email ? 'border-red-500/80' : 'border-slate-800'
            }`}
            placeholder="name@domain.com"
            required
          />
          {validationErrors.email && (
            <p className="text-xs text-red-500 mt-1 font-medium">{validationErrors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            disabled={loading}
            className={`w-full px-4 py-2.5 rounded-lg bg-slate-950/80 border text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors text-sm ${
              validationErrors.phone ? 'border-red-500/80' : 'border-slate-800'
            }`}
            placeholder="+1 (555) 000-0000"
          />
          {validationErrors.phone && (
            <p className="text-xs text-red-500 mt-1 font-medium">{validationErrors.phone}</p>
          )}
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
            className={`w-full px-4 py-2.5 rounded-lg bg-slate-950/80 border text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors text-sm ${
              validationErrors.password ? 'border-red-500/80' : 'border-slate-800'
            }`}
            placeholder="••••••••"
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
            className={`w-full px-4 py-2.5 rounded-lg bg-slate-950/80 border text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-colors text-sm ${
              validationErrors.confirm_password ? 'border-red-500/80' : 'border-slate-800'
            }`}
            placeholder="••••••••"
            required
          />
          {validationErrors.confirm_password && (
            <p className="text-xs text-red-500 mt-1 font-medium">{validationErrors.confirm_password}</p>
          )}
        </div>

        {/* Submit Action */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-lg bg-brand-500 hover:bg-brand-600 active:bg-brand-700 disabled:bg-brand-500/50 text-white font-bold text-sm tracking-wide transition-all shadow-md shadow-brand-500/10 flex items-center justify-center cursor-pointer select-none"
          id="register-submit-button"
        >
          {loading ? <ButtonLoader label="Creating Account..." /> : 'Sign Up'}
        </button>
      </form>

      {/* Redirect Link */}
      <div className="mt-6 text-center select-none">
        <p className="text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
