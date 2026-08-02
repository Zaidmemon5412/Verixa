import ForgotPasswordForm from '../components/ForgotPasswordForm';

/**
 * Forgot Password Page component.
 * Route: /forgot-password
 */
export const ForgotPassword = () => {
  return (
    <div id="forgot-password-page">
      <h2 className="text-xl font-extrabold text-white mb-2 text-center select-none tracking-tight">
        Forgot Password?
      </h2>
      <p className="text-xs text-slate-400 text-center mb-6 leading-relaxed select-none">
        Enter your registered email address below to receive password reset instructions.
      </p>

      <ForgotPasswordForm />
    </div>
  );
};

export default ForgotPassword;
