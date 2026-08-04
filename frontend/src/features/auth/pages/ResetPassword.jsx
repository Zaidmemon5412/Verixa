import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import authService from '../services/authService';
import ResetPasswordForm from '../components/ResetPasswordForm';
import ExpiredLinkCard from '../components/ExpiredLinkCard';
import { InlineLoader } from '../../../shared/components/Loader';

/**
 * Reset Password Page component.
 * Route: /reset-password?uid=xxx&token=yyyy
 * Verifies reset token automatically on mount.
 */
export const ResetPassword = () => {
  const [searchParams] = useSearchParams();

  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const verifyToken = async () => {
      if (!token) {
        if (isMounted) {
          setTokenValid(false);
          setVerifying(false);
        }
        return;
      }

      try {
        const response = await authService.verifyResetToken(uid || '', token);
        if (isMounted) {
          if (response.success || response.data?.valid) {
            setTokenValid(true);
          } else {
            setTokenValid(false);
          }
        }
      } catch {
        if (isMounted) {
          setTokenValid(false);
        }
      } finally {
        if (isMounted) {
          setVerifying(false);
        }
      }
    };

    verifyToken();

    return () => {
      isMounted = false;
    };
  }, [uid, token]);

  if (verifying) {
    return (
      <div className="py-8 text-center space-y-4 select-none" id="verifying-token-screen">
        <InlineLoader size="lg" className="mx-auto" />
        <p className="text-sm font-medium text-slate-300 animate-pulse">
          Verifying security token...
        </p>
      </div>
    );
  }

  if (!tokenValid) {
    return <ExpiredLinkCard />;
  }

  return (
    <div id="reset-password-page">
      <h2 className="text-xl font-extrabold text-white mb-2 text-center select-none tracking-tight">
        Set New Password
      </h2>
      <p className="text-xs text-slate-400 text-center mb-6 leading-relaxed select-none">
        Please enter a strong new password for your Verixa account.
      </p>

      <ResetPasswordForm uid={uid || ''} token={token} />
    </div>
  );
};

export default ResetPassword;
