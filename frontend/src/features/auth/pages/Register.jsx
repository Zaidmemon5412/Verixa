import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Eye, EyeOff, User, Mail, Phone, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { ButtonLoader } from '../../../shared/components/Loader';
import { getFriendlyErrorMessage } from '../../../shared/utils/errors';

/**
 * Registration Screen component.
 * Allows new users to create accounts.
 * Required Flow: Register -> Account Created -> Show Success Toast -> Redirect to /login
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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    if (validationErrors[id]) {
      setValidationErrors((prev) => ({ ...prev, [id]: null }));
    }
  };

  /**
   * Run local validation checks prior to backend submission.
   */
  const validate = () => {
    const errors = {};
    if (!formData.full_name.trim()) {
      errors.full_name = 'Full name is required.';
    }

    if (!formData.username.trim()) {
      errors.username = 'Username is required.';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must contain at least 8 characters.';
    }

    if (!formData.confirm_password) {
      errors.confirm_password = 'Please confirm your password.';
    } else if (formData.password !== formData.confirm_password) {
      errors.confirm_password = 'Confirm password does not match.';
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
      console.error('Registration error:', err);
      const dataErrors = err.response?.data?.data || err.response?.data;
      if (dataErrors && typeof dataErrors === 'object') {
        const errorList = {};
        Object.keys(dataErrors).forEach((key) => {
          if (key !== 'success' && key !== 'message') {
            const errorVal = dataErrors[key];
            errorList[key] = Array.isArray(errorVal) ? errorVal[0] : String(errorVal);
          }
        });
        setValidationErrors(errorList);
      }
      const errorMessage = getFriendlyErrorMessage(err) || 'Registration failed. Please check field details.';
      toast.error(errorMessage);
    }
  };

  return (
    <div id="register-page" className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-extrabold text-foreground select-none tracking-tight">
          Create Your Account
        </h2>
        <p className="text-xs text-muted-foreground font-medium">
          Join Verixa to unlock RERA legal audits, builder delay indices & ML price tools
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Full Name Field */}
        <div>
          <label htmlFor="full_name" className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${validationErrors.full_name ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'}`}>
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
              <User className="w-4 h-4" />
            </div>
            <input
              id="full_name"
              type="text"
              value={formData.full_name}
              onChange={handleChange}
              disabled={loading}
              aria-invalid={Boolean(validationErrors.full_name)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border text-foreground placeholder:text-muted-foreground focus:outline-none transition-all text-sm font-medium ${
                validationErrors.full_name
                  ? 'border-rose-500 dark:border-rose-400 focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500'
                  : 'border-input focus:ring-2 focus:ring-primary/40 focus:border-primary'
              }`}
              placeholder="John Doe"
              required
            />
          </div>
          {validationErrors.full_name && (
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>{validationErrors.full_name}</span>
            </p>
          )}
        </div>

        {/* Username Field */}
        <div>
          <label htmlFor="username" className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${validationErrors.username ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'}`}>
            Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
              <User className="w-4 h-4" />
            </div>
            <input
              id="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              aria-invalid={Boolean(validationErrors.username)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border text-foreground placeholder:text-muted-foreground focus:outline-none transition-all text-sm font-medium ${
                validationErrors.username
                  ? 'border-rose-500 dark:border-rose-400 focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500'
                  : 'border-input focus:ring-2 focus:ring-primary/40 focus:border-primary'
              }`}
              placeholder="johndoe"
              required
            />
          </div>
          {validationErrors.username && (
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>{validationErrors.username}</span>
            </p>
          )}
        </div>

        {/* Email Address Field */}
        <div>
          <label htmlFor="email" className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${validationErrors.email ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'}`}>
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              aria-invalid={Boolean(validationErrors.email)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border text-foreground placeholder:text-muted-foreground focus:outline-none transition-all text-sm font-medium ${
                validationErrors.email
                  ? 'border-rose-500 dark:border-rose-400 focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500'
                  : 'border-input focus:ring-2 focus:ring-primary/40 focus:border-primary'
              }`}
              placeholder="john@domain.com"
              required
            />
          </div>
          {validationErrors.email && (
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>{validationErrors.email}</span>
            </p>
          )}
        </div>

        {/* Phone Field */}
        <div>
          <label htmlFor="phone" className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
            Phone Number (Optional)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
              <Phone className="w-4 h-4" />
            </div>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm font-medium"
              placeholder="+91 9876543210"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${validationErrors.password ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'}`}>
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              aria-invalid={Boolean(validationErrors.password)}
              className={`w-full pl-10 pr-11 py-2.5 rounded-xl bg-background border text-foreground placeholder:text-muted-foreground focus:outline-none transition-all text-sm font-medium ${
                validationErrors.password
                  ? 'border-rose-500 dark:border-rose-400 focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500'
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
          {validationErrors.password && (
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>{validationErrors.password}</span>
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirm_password" className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${validationErrors.confirm_password ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'}`}>
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="confirm_password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirm_password}
              onChange={handleChange}
              disabled={loading}
              aria-invalid={Boolean(validationErrors.confirm_password)}
              className={`w-full pl-10 pr-11 py-2.5 rounded-xl bg-background border text-foreground placeholder:text-muted-foreground focus:outline-none transition-all text-sm font-medium ${
                validationErrors.confirm_password
                  ? 'border-rose-500 dark:border-rose-400 focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500'
                  : 'border-input focus:ring-2 focus:ring-primary/40 focus:border-primary'
              }`}
              placeholder="Repeat password"
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
          {validationErrors.confirm_password && (
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>{validationErrors.confirm_password}</span>
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-xl shadow-primary/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 mt-3"
        >
          {loading ? (
            <ButtonLoader text="Creating Account..." />
          ) : (
            <span className="flex items-center gap-2">
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </button>
      </form>

      {/* Sign In Link */}
      <div className="mt-6 text-center text-xs text-muted-foreground border-t border-border/80 pt-5 font-medium">
        Already have an account?{' '}
        <Link to="/login" className="text-primary font-bold hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default Register;
