import { useState, useEffect, useMemo, useCallback } from 'react';
import comparisonService from '../services/comparisonService';

const STORAGE_KEY = 'verixa_comparison_ids';

export function usePropertyComparison(initialIds = []) {
  // Initialize state from LocalStorage or initialIds (NO random default forced)
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync selectedIds to LocalStorage whenever selection updates
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedIds));
    } catch (e) {
      console.warn('Failed to save comparison IDs to localStorage:', e);
    }
  }, [selectedIds]);

  // Load all available properties for search dropdown
  useEffect(() => {
    async function loadCatalog() {
      try {
        const props = await comparisonService.getAllProperties();
        setAllProperties(props || []);
      } catch (err) {
        console.error('Failed to load property catalog:', err);
        setError('Failed to fetch property list.');
      }
    }
    loadCatalog();
  }, []);

  // Fetch details for currently selected IDs
  useEffect(() => {
    async function fetchCompared() {
      if (selectedIds.length === 0) {
        setComparedProperties([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const list = await comparisonService.getPropertiesByIds(selectedIds);
        setComparedProperties(list);
      } catch (err) {
        console.error('Failed to fetch compared properties:', err);
        setError('Failed to load comparison data.');
      } finally {
        setLoading(false);
      }
    }
    fetchCompared();
  }, [selectedIds]);

  // Add property to comparison (Max 4)
  const addProperty = useCallback((id) => {
    const targetId = String(id);
    setSelectedIds((prev) => {
      if (prev.includes(targetId) || prev.length >= 4) return prev;
      return [...prev, targetId];
    });
  }, []);

  // Remove property from comparison
  const removeProperty = useCallback((id) => {
    const targetId = String(id);
    setSelectedIds((prev) => prev.filter((item) => String(item) !== targetId));
  }, []);

  // Replace property at specific slot index
  const replaceProperty = useCallback((slotIndex, newId) => {
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
  }, []);

  // Clear all selections
  const clearAll = useCallback(() => {
    setSelectedIds([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
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
      // Lowest Price
      if (p.priceNum > 0 && (!lowestPriceObj || p.priceNum < lowestPriceObj.priceNum)) {
        lowestPriceObj = p;
      }

      // Lowest PSF
      const psfNum = parseFloat(String(p.pricePerSqft || '').replace(/[^0-9.]/g, '')) || 0;
      if (psfNum > 0 && (!lowestPsfObj || psfNum < (lowestPsfObj.psfNum || Infinity))) {
        lowestPsfObj = { ...p, psfNum };
      }

      // Largest Area
      if (p.areaNum > 0 && (!largestAreaObj || p.areaNum > largestAreaObj.areaNum)) {
        largestAreaObj = p;
      }

      // Highest Trust Score
      if (p.trustScore != null && (!highestTrustObj || p.trustScore > highestTrustObj.trustScore)) {
        highestTrustObj = p;
      }

      // Highest Investment Score
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
