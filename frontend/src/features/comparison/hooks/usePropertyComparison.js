import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from '../../auth/hooks/useAuth';
import comparisonService from '../services/comparisonService';

const STORAGE_KEY = 'verixa_comparison_ids';
const COMPARISON_SYNC_EVENT = 'verixa:comparison-sync';

export function usePropertyComparison(initialIds = [], options = {}) {
  const { loadCatalog = true, loadCompared = true } = options;
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize state from LocalStorage or initialIds
  const [selectedIds, setSelectedIds] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(String);
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved comparison IDs:', e);
    }
    return initialIds.map(String);
  });

  const [allProperties, setAllProperties] = useState([]);
  const [comparedProperties, setComparedProperties] = useState([]);
  const [loading, setLoading] = useState(() => Boolean(loadCompared && selectedIds.length > 0));
  const [error, setError] = useState(null);

  // Listen to cross-component comparison sync events
  useEffect(() => {
    const handleSync = (event) => {
      const nextIds = Array.isArray(event?.detail) ? event.detail.map(String) : [];
      setSelectedIds((prev) => {
        if (prev.length === nextIds.length && prev.every((v, i) => v === nextIds[i])) {
          return prev;
        }
        return nextIds;
      });
    };

    window.addEventListener(COMPARISON_SYNC_EVENT, handleSync);
    return () => window.removeEventListener(COMPARISON_SYNC_EVENT, handleSync);
  }, []);

  // Sync selectedIds to LocalStorage and notify peer hooks
  useEffect(() => {
    try {
      const serialized = JSON.stringify(selectedIds);
      if (localStorage.getItem(STORAGE_KEY) !== serialized) {
        localStorage.setItem(STORAGE_KEY, serialized);
        window.dispatchEvent(new CustomEvent(COMPARISON_SYNC_EVENT, { detail: selectedIds }));
      }
    } catch (e) {
      console.warn('Failed to save comparison IDs to localStorage:', e);
    }
  }, [selectedIds]);

  // Load lightweight property suggestions only when requested (e.g. ComparisonPage)
  useEffect(() => {
    if (!loadCatalog) return undefined;
    let isCancelled = false;

    async function loadCatalogItems() {
      try {
        const props = await comparisonService.getAllProperties();
        if (!isCancelled) setAllProperties(props || []);
      } catch (err) {
        console.error('Failed to load property catalog:', err);
        if (!isCancelled) setError('Failed to fetch property list.');
      }
    }
    loadCatalogItems();
    return () => {
      isCancelled = true;
    };
  }, [loadCatalog]);

  // Fetch details for currently selected IDs only when comparison matrix is mounted
  useEffect(() => {
    if (!loadCompared) {
      setLoading(false);
      return undefined;
    }
    let isCancelled = false;

    async function fetchCompared() {
      if (selectedIds.length === 0) {
        setComparedProperties([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const list = await comparisonService.getPropertiesByIds(selectedIds);
        if (!isCancelled) setComparedProperties(list);
      } catch (err) {
        console.error('Failed to fetch compared properties:', err);
        if (!isCancelled) setError('Failed to load comparison data.');
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }
    fetchCompared();
    return () => {
      isCancelled = true;
    };
  }, [loadCompared, selectedIds]);

  // Add property to comparison (Max 4) - Requires Authentication
  const addProperty = useCallback(
    (id) => {
      if (!user) {
        toast.info('Please sign in to compare properties.');
        navigate('/login', { state: { from: location.pathname } });
        return;
      }
      const targetId = String(id);
      setSelectedIds((prev) => {
        if (prev.includes(targetId) || prev.length >= 4) return prev;
        return [...prev, targetId];
      });
    },
    [user, navigate, location.pathname]
  );

  // Remove property from comparison
  const removeProperty = useCallback((id) => {
    const targetId = String(id);
    setSelectedIds((prev) => prev.filter((item) => String(item) !== targetId));
  }, []);

  // Replace property at specific slot index - Requires Authentication
  const replaceProperty = useCallback(
    (slotIndex, newId) => {
      if (!user) {
        toast.info('Please sign in to compare properties.');
        navigate('/login', { state: { from: location.pathname } });
        return;
      }
      const targetId = String(newId);
      setSelectedIds((prev) => {
        if (prev.includes(targetId)) return prev;
        const next = [...prev];
        if (slotIndex >= 0 && slotIndex < next.length) {
          next[slotIndex] = targetId;
        } else if (next.length < 4) {
          next.push(targetId);
        }
        return next;
      });
    },
    [user, navigate, location.pathname]
  );

  // Clear all selections
  const clearAll = useCallback(() => {
    setSelectedIds([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent(COMPARISON_SYNC_EVENT, { detail: [] }));
    } catch (e) {
      console.warn('Failed to clear comparison IDs:', e);
    }
  }, []);

  // Calculate best-value highlights across compared properties
  const bestValues = useMemo(() => {
    if (!comparedProperties || comparedProperties.length === 0) return {};

    let lowestPriceObj = null;
    let lowestPsfObj = null;
    let largestAreaObj = null;
    let highestTrustObj = null;
    let highestInvestObj = null;

    comparedProperties.forEach((p) => {
      if (p.priceNum > 0 && (!lowestPriceObj || p.priceNum < lowestPriceObj.priceNum)) {
        lowestPriceObj = p;
      }

      const psfNum = parseFloat(String(p.pricePerSqft || '').replace(/[^0-9.]/g, '')) || 0;
      if (psfNum > 0 && (!lowestPsfObj || psfNum < (lowestPsfObj.psfNum || Infinity))) {
        lowestPsfObj = { ...p, psfNum };
      }

      if (p.areaNum > 0 && (!largestAreaObj || p.areaNum > largestAreaObj.areaNum)) {
        largestAreaObj = p;
      }

      if (p.trustScore != null && (!highestTrustObj || p.trustScore > highestTrustObj.trustScore)) {
        highestTrustObj = p;
      }

      if (p.investScore != null && (!highestInvestObj || p.investScore > highestInvestObj.investScore)) {
        highestInvestObj = p;
      }
    });

    return {
      lowestPriceId: lowestPriceObj?.id,
      lowestPsfId: lowestPsfObj?.id,
      largestAreaId: largestAreaObj?.id,
      highestTrustId: highestTrustObj?.id,
      highestInvestId: highestInvestObj?.id,
    };
  }, [comparedProperties]);

  return {
    allProperties,
    selectedIds,
    comparedProperties,
    loading,
    error,
    bestValues,
    addProperty,
    removeProperty,
    replaceProperty,
    clearAll,
  };
}

export default usePropertyComparison;
