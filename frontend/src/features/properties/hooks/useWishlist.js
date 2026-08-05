import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from '../../auth/hooks/useAuth';
import savedPropertyService from '../services/savedPropertyService';
import { getFriendlyErrorMessage } from '../../../shared/utils/errors';

export function useWishlist() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [savedIds, setSavedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savedProperties, setSavedProperties] = useState([]);

  // Fetch initial saved properties list if user is logged in
  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setSavedIds([]);
      setSavedProperties([]);
      return;
    }
    setLoading(true);
    try {
      const list = await savedPropertyService.getSavedProperties();
      setSavedProperties(list || []);
      const ids = (list || []).map((p) => String(p.id || p.property_id)).filter(Boolean);
      setSavedIds(ids);
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isWishlisted = useCallback(
    (propertyId) => {
      if (!propertyId) return false;
      const targetStr = String(propertyId);
      return savedIds.includes(targetStr);
    },
    [savedIds]
  );

  const toggleWishlist = useCallback(
    async (propertyId) => {
      if (!propertyId) return;
      const targetId = String(propertyId);

      // Auth Guard
      if (!user) {
        toast.info('Please sign in to save properties to your wishlist.');
        navigate('/login', { state: { from: location.pathname } });
        return;
      }

      const currentlySaved = savedIds.includes(targetId);

      // 1. Optimistic UI update
      setSavedIds((prev) =>
        currentlySaved ? prev.filter((id) => id !== targetId) : [...prev, targetId]
      );

      try {
        if (currentlySaved) {
          await savedPropertyService.removeSavedProperty(targetId);
          toast.info('Property removed from your wishlist.');
        } else {
          await savedPropertyService.saveProperty(targetId);
          toast.success('Property saved to your wishlist!');
        }
        // Refresh saved properties list
        fetchWishlist();
      } catch (err) {
        // Rollback optimistic state on error
        setSavedIds((prev) =>
          currentlySaved ? [...prev, targetId] : prev.filter((id) => id !== targetId)
        );
        const errorMsg = getFriendlyErrorMessage(err) || 'Failed to update wishlist.';
        toast.error(errorMsg);
      }
    },
    [user, savedIds, navigate, location.pathname, fetchWishlist]
  );

  return {
    savedIds,
    savedProperties,
    loading,
    isWishlisted,
    toggleWishlist,
    refetchWishlist: fetchWishlist,
  };
}

export default useWishlist;
