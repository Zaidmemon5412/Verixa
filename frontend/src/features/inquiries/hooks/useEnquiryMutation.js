import { useState, useCallback } from 'react';
import inquiryService from '../services/inquiryService';
import { getFriendlyErrorMessage } from '../../../shared/utils/errors';

export const useEnquiryMutation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const mutateAsync = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await inquiryService.createEnquiry(formData);
      setSuccess(true);
      return res;
    } catch (err) {
      const msg = getFriendlyErrorMessage(err) || 'Failed to submit enquiry request.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  }, []);

  return {
    mutateAsync,
    loading,
    error,
    success,
    reset
  };
};

export default useEnquiryMutation;
