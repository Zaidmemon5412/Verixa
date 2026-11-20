import apiClient from '../../../shared/services/apiClient';
import { createPropertySlug, extractIdFromSlug, slugify } from '../../../shared/utils/seoUtils';
import { PROJECTS } from '../constants/propertyData';

const MEMORY_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const FILTER_OPTIONS_TTL_MS = 10 * 60 * 1000; // 10 minutes
const SWR_STORAGE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const SWR_PREFIX = 'verixa_swr_v1_';
const SWR_RECENT_DETAILS_KEY = `${SWR_PREFIX}recent_details`;
const MAX_RECENT_DETAILS = 12;

function formatPrice(priceVal) {
  const num = parseFloat(priceVal);
  if (isNaN(num) || num === 0) return '₹35L – ₹1.2Cr';
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(1)} L`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
}

function cleanFurnishing(val) {
  if (!val) return 'Semi-Furnished';
  let str = String(val).trim();
  if (str.includes('(')) {
    str = str.split('(')[0].trim();
  }
  return str || 'Semi-Furnished';
}

function extractImageUrl(imgObj) {
  if (!imgObj) return null;
  if (typeof imgObj === 'string') return imgObj;
  return imgObj.image || imgObj.image_url || imgObj.file || null;
}

function extractCleanArea(item) {
  if (!item) return 'Satellite';
  const text = `${item.locality_name || ''} ${item.locality_detail?.name || ''} ${item.location || ''} ${item.locality || ''} ${item.address || ''} ${item.property_name || ''}`.toLowerCase();
  if (text.includes('gota')) return 'Gota';
  if (text.includes('chandkheda')) return 'Chandkheda';
  if (text.includes('sola')) return 'Sola';
  if (text.includes('thaltej')) return 'Thaltej';
  if (text.includes('satellite')) return 'Satellite';
  if (text.includes('maninagar')) return 'Maninagar';
  return 'Maninagar';
}

function extractArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;

  const root = val.data !== undefined ? val.data : val;
  if (Array.isArray(root)) return root;

  if (root && root.data) {
    if (Array.isArray(root.data)) return root.data;
    if (root.data.results && Array.isArray(root.data.results)) return root.data.results;
  }

  if (root && root.results && Array.isArray(root.results)) {
    return root.results;
  }

  return [];
}

function readSwr(key) {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.timestamp !== 'number') return null;
    if (Date.now() - parsed.timestamp > SWR_STORAGE_TTL_MS) {
      window.localStorage.removeItem(key);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

function writeSwr(key, data) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(
      key,
      JSON.stringify({ timestamp: Date.now(), data })
    );
  } catch {
    // Ignore storage quota / private browsing errors
  }
}

function normalizeFallbackProject(p) {
  const id = p.id;
  const locality = p.locality || 'Satellite';
  const slug = p.slug || createPropertySlug({ id, name: p.name, locality });
  return {
    ...p,
    id,
    slug,
    locality,
    city: p.city || 'Ahmedabad',
    state: p.state || 'Gujarat',
    propertyType: p.propertyType || 'Apartment',
    transactionType: p.transactionType || 'Sale',
    pricePerSqft: p.pricePerSqft || '₹6,200/sqft',
    furnishingStatus: p.furnishingStatus || 'Semi-Furnished',
    facing: p.facing || 'East',
    bathrooms: p.bathrooms || 2,
    balconies: p.balconies || 1,
    floorNumber: p.floorNumber || 4,
    totalFloors: p.totalFloors || 14,
    images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.image],
    documents: p.documents || [],
    listings: p.listings || [],
    _isFallbackPreview: true,
    _isFullDetail: false,
  };
}

const NORMALIZED_FALLBACK_PROJECTS = PROJECTS.map(normalizeFallbackProject);

export function mapApiPropertyToUi(item, { isFullDetail = false } = {}) {
  if (!item) return null;
  const legalInfo = item.legal_info || null;
  const legalStatus = legalInfo?.verification_status || 'VERIFIED';
  const priceFormatted = formatPrice(item.price);

  // Safely extract Cloudinary image URLs
  const rawImages = Array.isArray(item.images) ? item.images : [];
  const imagesList = rawImages.map(extractImageUrl).filter(Boolean);

  const primaryImg = item.primary_image || (imagesList.length > 0 ? imagesList[0] : null);
  const defaultFallbackImage = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=500&fit=crop&auto=format';
  const finalPrimaryImage = primaryImg || defaultFallbackImage;
  const finalGalleryImages = imagesList.length > 0 ? imagesList : [finalPrimaryImage];

  // Parse amenities
  let amenitiesList = ['24x7 Security', 'Car Parking', 'Power Backup', 'Gymnasium', 'Elevator', 'Clubhouse'];
  if (Array.isArray(item.amenities) && item.amenities.length > 0) {
    const rawA = item.amenities;
    if (rawA.length === 1 && typeof rawA[0] === 'string' && rawA[0].startsWith('[')) {
      try {
        amenitiesList = JSON.parse(rawA[0]);
      } catch {
        amenitiesList = rawA;
      }
    } else {
      amenitiesList = rawA.map((a) => (typeof a === 'string' ? a : (a.amenity_name || a.name))).filter(Boolean);
    }
  }

  const builderName = item.builder_name || item.company_name || item.builder_detail?.builder_name || '';
  const cleanArea = extractCleanArea(item);
  const resolvedAddress = item.address || item.location || `${item.property_name || 'Property'}, ${cleanArea}, Ahmedabad`;
  const propName = item.project_name || item.property_name || 'Unnamed Property';
  const statusStr = item.project_status || item.status || 'Ready to Move';

  const resolvedId = item.project_id || item.property_id || item.id;

  return {
    id: resolvedId,
    slug: createPropertySlug({ id: resolvedId, name: propName, locality: cleanArea }),
    name: propName,
    builder: builderName,
    builderId: item.builder || item.builder_detail?.builder_id || null,
    builderDetail: item.builder_detail || null,
    price: priceFormatted,
    priceNum: parseFloat(item.price || 0),
    pricePerSqft: item.price_per_sqft ? `₹${parseFloat(item.price_per_sqft).toLocaleString('en-IN')}/sqft` : 'N/A',
    config: item.bhk_variants || (item.bhk ? `${item.bhk} BHK` : (item.primary_bhk ? `${item.primary_bhk} BHK` : 'N/A')),
    bhkNum: item.bhk || (item.primary_bhk ? parseInt(item.primary_bhk, 10) : 0),
    propertyType: item.property_type || 'Apartment',
    transactionType: item.transaction_type || 'Sale',
    possession: statusStr,
    location: `${cleanArea}, Ahmedabad`,
    locality: cleanArea,
    city: item.locality_detail?.city || item.city || 'Ahmedabad',
    state: item.locality_detail?.state || 'Gujarat',
    localityDetail: item.locality_detail || null,
    address: resolvedAddress,
    latitude: item.latitude != null ? parseFloat(item.latitude) : (item.locality_detail?.latitude != null ? parseFloat(item.locality_detail.latitude) : null),
    longitude: item.longitude != null ? parseFloat(item.longitude) : (item.locality_detail?.longitude != null ? parseFloat(item.locality_detail.longitude) : null),

    image: finalPrimaryImage,
    images: finalGalleryImages,
    badges: [
      statusStr,
      cleanFurnishing(item.furnishing_status),
    ].filter(Boolean),
    rera: item.rera_number || item.rera || 'PR/GJ/AHM/VERIXA/2026',
    investScore: (() => {
      const seed = `${item.property_id || item.id || ''}-${item.name || item.property_name || ''}`;
      let h = 0;
      for (let i = 0; i < seed.length; i++) { h = (h << 5) - h + seed.charCodeAt(i); h |= 0; }
      const pos = Math.abs(h);
      return legalStatus === 'VERIFIED' ? (81 + ((pos + 5) % 15)) : legalStatus === 'PENDING' ? (68 + ((pos + 5) % 12)) : (50 + ((pos + 5) % 14));
    })(),
    growthScore: 82,
    rentalYield: '3.8%',
    area: item.carpet_area ? `${item.carpet_area} sq ft` : (item.builtup_area ? `${item.builtup_area} sq ft` : '1,200 sq ft'),
    areaNum: parseFloat(item.carpet_area || item.builtup_area || 1200),
    carpetArea: item.carpet_area ? String(item.carpet_area) : 'N/A',
    builtupArea: item.builtup_area ? String(item.builtup_area) : 'N/A',
    superBuiltupArea: item.super_builtup_area ? String(item.super_builtup_area) : 'N/A',
    bathrooms: item.bathrooms || 2,
    balconies: item.balconies || 1,
    floorNumber: item.floor_number || 1,
    totalFloors: item.total_floors || 5,
    facing: item.facing || 'East',
    furnishingStatus: cleanFurnishing(item.furnishing_status),
    status: statusStr,
    trustScore: (() => {
      const seed = `${item.property_id || item.id || ''}-${item.name || item.property_name || ''}`;
      let h = 0;
      for (let i = 0; i < seed.length; i++) { h = (h << 5) - h + seed.charCodeAt(i); h |= 0; }
      const pos = Math.abs(h);
      return legalStatus === 'VERIFIED' ? (88 + (pos % 11)) : legalStatus === 'PENDING' ? (72 + (pos % 10)) : (48 + (pos % 15));
    })(),
    amenities: amenitiesList,
    overview: item.project_description || item.description || `Spacious ${item.primary_bhk || item.bhk || '2, 3'} BHK development located in ${cleanArea}, Ahmedabad. Featuring modern architectural layout, low-density structural design, and RERA compliance.`,
    legalInfo: legalInfo,
    documents: item.documents || [],
    listings: item.listings || [],
    _isFullDetail: isFullDetail,
  };
}

const requestCache = new Map();
const pendingRequests = new Map();
const pageRequestCache = new Map();
const pendingPageRequests = new Map();
const propertyByIdCache = new Map();
const detailCache = new Map();
const pendingDetailRequests = new Map();

let filterOptionsCache = null;
let pendingFilterOptionsRequest = null;
let lastPrewarmAt = 0;

function buildFilterParams(filters = {}, extraParams = {}) {
  const params = new URLSearchParams();
  Object.entries(extraParams).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      params.append(k, String(v));
    }
  });

  if (filters.search) params.append('search', String(filters.search).trim());
  if (filters.locality && filters.locality !== 'All') params.append('locality', filters.locality);
  if (filters.city && filters.city !== 'All') params.append('city', filters.city);
  if (filters.builder && filters.builder !== 'All') params.append('builder', filters.builder);
  if (filters.status && filters.status !== 'All') params.append('status', filters.status);
  if (filters.property_type && filters.property_type !== 'All') params.append('property_type', filters.property_type);
  if (filters.transaction_type && filters.transaction_type !== 'All') params.append('transaction_type', filters.transaction_type);

  if (filters.bhk && filters.bhk !== 'All') {
    const rawBhkList = Array.isArray(filters.bhk) ? filters.bhk : [filters.bhk];
    const cleanedBhkList = rawBhkList
      .map((b) => String(b).replace(/[^0-9]/g, ''))
      .filter(Boolean);
    if (cleanedBhkList.length > 0) {
      params.append('bhk', cleanedBhkList.join(','));
    }
  }
  if (filters.min_price) params.append('min_price', String(filters.min_price));
  if (filters.max_price) params.append('max_price', String(filters.max_price));
  if (filters.min_area) params.append('min_area', String(filters.min_area));
  if (filters.max_area) params.append('max_area', String(filters.max_area));
  if (filters.ordering) params.append('ordering', String(filters.ordering));

  return params;
}

function indexPropertyInMemory(prop, { isFull = false } = {}) {
  if (!prop || !prop.id) return;
  const idKey = String(prop.id).toLowerCase();
  const existing = propertyByIdCache.get(idKey);
  if (existing && existing._isFullDetail && !isFull) {
    return;
  }
  const stored = isFull ? { ...prop, _isFullDetail: true } : prop;
  propertyByIdCache.set(idKey, stored);
  if (stored.slug) {
    propertyByIdCache.set(String(stored.slug).toLowerCase(), stored);
  }
  if (isFull) {
    const entry = { timestamp: Date.now(), data: stored };
    detailCache.set(idKey, entry);
    if (stored.slug) {
      detailCache.set(String(stored.slug).toLowerCase(), entry);
    }
    saveRecentDetailSwr(stored);
  }
}

function saveRecentDetailSwr(prop) {
  const existing = readSwr(SWR_RECENT_DETAILS_KEY) || [];
  const filtered = Array.isArray(existing)
    ? existing.filter((p) => String(p.id).toLowerCase() !== String(prop.id).toLowerCase())
    : [];
  const updated = [prop, ...filtered].slice(0, MAX_RECENT_DETAILS);
  writeSwr(SWR_RECENT_DETAILS_KEY, updated);
}

function findRecentDetailSwr(idOrSlug) {
  const existing = readSwr(SWR_RECENT_DETAILS_KEY);
  if (!Array.isArray(existing) || existing.length === 0) return null;
  const cleanId = extractIdFromSlug(idOrSlug).toLowerCase();
  const rawLower = String(idOrSlug).toLowerCase();
  return (
    existing.find(
      (p) =>
        String(p.id).toLowerCase() === cleanId ||
        String(p.slug || '').toLowerCase() === rawLower
    ) || null
  );
}

export const propertyService = {
  /**
   * Synchronous fallback properties for cold-start grace preview (brand-new visitors).
   */
  getFallbackProperties(filters = {}) {
    let list = NORMALIZED_FALLBACK_PROJECTS;
    if (filters.locality && filters.locality !== 'All') {
      const target = String(filters.locality).toLowerCase();
      const locMatches = list.filter((p) => String(p.locality || '').toLowerCase() === target);
      if (locMatches.length > 0) list = locMatches;
    }
    if (filters.status && filters.status !== 'All') {
      const target = String(filters.status).toLowerCase();
      const statusMatches = list.filter((p) => String(p.status || '').toLowerCase() === target);
      if (statusMatches.length > 0) list = statusMatches;
    }
    if (filters.search) {
      const q = String(filters.search).trim().toLowerCase();
      const searchMatches = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.locality.toLowerCase().includes(q) ||
          (p.builder || '').toLowerCase().includes(q)
      );
      if (searchMatches.length > 0) list = searchMatches;
    }
    return list;
  },

  /**
   * Synchronous frame-0 cache lookup (in-memory first, then localStorage SWR for page 1).
   */
  getCachedPropertiesPage(filters = {}, { page = 1, pageSize = 24 } = {}) {
    const params = buildFilterParams(filters, {
      page,
      page_size: pageSize,
      compact: 1,
    });
    const cacheKey = params.toString();

    const mem = pageRequestCache.get(cacheKey);
    if (mem && Date.now() - mem.timestamp < MEMORY_CACHE_TTL_MS) {
      return { ...mem.data, fromCache: true, fromStorage: false };
    }

    if (page === 1) {
      const swr = readSwr(`${SWR_PREFIX}page1_${cacheKey}`);
      if (swr && Array.isArray(swr.results) && swr.results.length > 0) {
        swr.results.forEach((p) => indexPropertyInMemory(p, { isFull: false }));
        return { ...swr, fromCache: true, fromStorage: true };
      }
    }

    return null;
  },

  /**
   * Fast paginated property listing with compact payload (~80% smaller) + SWR persistence.
   */
  async getPropertiesPage(filters = {}, { page = 1, pageSize = 24, forceRefresh = false } = {}) {
    const params = buildFilterParams(filters, {
      page,
      page_size: pageSize,
      compact: 1,
    });
    const cacheKey = params.toString();

    if (!forceRefresh) {
      const cachedEntry = pageRequestCache.get(cacheKey);
      if (cachedEntry && Date.now() - cachedEntry.timestamp < MEMORY_CACHE_TTL_MS) {
        return cachedEntry.data;
      }
    }

    if (pendingPageRequests.has(cacheKey)) {
      return pendingPageRequests.get(cacheKey);
    }

    const fetchPromise = (async () => {
      try {
        const response = await apiClient.get(`/properties/?${cacheKey}`);
        const root = response?.data !== undefined ? response.data : response;
        const rawResults = Array.isArray(root?.results) ? root.results : extractArray(response);
        const mapped = rawResults.map((item) => mapApiPropertyToUi(item, { isFullDetail: false })).filter(Boolean);

        mapped.forEach((p) => indexPropertyInMemory(p, { isFull: false }));

        const count = typeof root?.count === 'number' ? root.count : mapped.length;
        const totalPages =
          typeof root?.total_pages === 'number'
            ? root.total_pages
            : Math.max(1, Math.ceil(count / pageSize));
        const currentPage = typeof root?.current_page === 'number' ? root.current_page : page;
        const hasNext = Boolean(root?.next) || currentPage < totalPages;

        const payload = {
          results: mapped,
          count,
          totalPages,
          currentPage,
          hasNext,
        };

        pageRequestCache.set(cacheKey, { timestamp: Date.now(), data: payload });
        if (page === 1 && mapped.length > 0) {
          writeSwr(`${SWR_PREFIX}page1_${cacheKey}`, payload);
        }

        return payload;
      } catch (error) {
        console.error('Failed to load paginated properties from backend:', error);
        throw error;
      } finally {
        pendingPageRequests.delete(cacheKey);
      }
    })();

    pendingPageRequests.set(cacheKey, fetchPromise);
    return fetchPromise;
  },

  /**
   * Backward-compatible full-list method (used by ComparisonPage & LocalityProjects).
   * Uses compact=1 to cut response size by ~80% and indexes results for instant detail navigation.
   */
  async getProperties(filters = {}) {
    const params = buildFilterParams(filters, {
      page_size: 3000,
      compact: 1,
    });
    const cacheKey = params.toString();

    const cachedEntry = requestCache.get(cacheKey);
    if (cachedEntry && Date.now() - cachedEntry.timestamp < MEMORY_CACHE_TTL_MS) {
      return cachedEntry.data;
    }

    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey);
    }

    const fetchPromise = (async () => {
      try {
        const response = await apiClient.get(`/properties/?${cacheKey}`);
        const rawResults = extractArray(response);

        let mapped = [];
        if (rawResults.length > 0) {
          mapped = rawResults.map((item) => mapApiPropertyToUi(item, { isFullDetail: false })).filter(Boolean);
          mapped.forEach((p) => indexPropertyInMemory(p, { isFull: false }));
        }

        requestCache.set(cacheKey, { timestamp: Date.now(), data: mapped });
        return mapped;
      } catch (error) {
        console.error('Failed to load property list from backend database:', error);
        return [];
      } finally {
        pendingRequests.delete(cacheKey);
      }
    })();

    pendingRequests.set(cacheKey, fetchPromise);
    return fetchPromise;
  },

  /**
   * Synchronous frame-0 lookup for PropertyDetailPage so clicked cards open instantaneously.
   */
  getCachedProperty(idOrSlug) {
    if (!idOrSlug || idOrSlug === 'undefined' || idOrSlug === 'null') {
      return null;
    }
    const cleanId = extractIdFromSlug(idOrSlug).toLowerCase();
    const rawLower = String(idOrSlug).toLowerCase();

    const fullEntry = detailCache.get(cleanId) || detailCache.get(rawLower);
    if (fullEntry && Date.now() - fullEntry.timestamp < MEMORY_CACHE_TTL_MS) {
      return fullEntry.data;
    }

    const memSummary = propertyByIdCache.get(cleanId) || propertyByIdCache.get(rawLower);
    if (memSummary) {
      return memSummary;
    }

    const swrDetail = findRecentDetailSwr(idOrSlug);
    if (swrDetail) {
      return swrDetail;
    }

    const fallbackMatch = NORMALIZED_FALLBACK_PROJECTS.find(
      (p) =>
        String(p.id).toLowerCase() === cleanId ||
        String(p.slug).toLowerCase() === rawLower ||
        slugify(p.name) === slugify(cleanId)
    );
    return fallbackMatch || null;
  },

  /**
   * Fire-and-forget prefetch triggered on PropertyCard hover/touch.
   */
  prefetchPropertyDetail(idOrSlug) {
    if (!idOrSlug || idOrSlug === 'undefined' || idOrSlug === 'null') return;
    const cleanId = extractIdFromSlug(idOrSlug).toLowerCase();
    const existing = detailCache.get(cleanId);
    if (existing && Date.now() - existing.timestamp < MEMORY_CACHE_TTL_MS) {
      return;
    }
    if (pendingDetailRequests.has(cleanId)) {
      return;
    }
    this.getPropertyById(idOrSlug).catch(() => {});
  },

  /**
   * Lightweight app-boot warmer: wakes the Render container and pre-caches Page 1 (24 compact items) + filter options.
   */
  prefetchInitialPage() {
    const now = Date.now();
    if (now - lastPrewarmAt < MEMORY_CACHE_TTL_MS) {
      return;
    }
    lastPrewarmAt = now;
    this.getPropertiesPage({ ordering: 'newest' }, { page: 1, pageSize: 24 }).catch(() => {});
    this.getFilterOptions().catch(() => {});
  },

  async getPropertyById(id) {
    if (!id || id === 'undefined' || id === 'null') {
      return null;
    }

    const cleanId = extractIdFromSlug(id);
    const cacheKey = cleanId.toLowerCase();
    const lookupSlug = slugify(id);

    const cachedDetail = detailCache.get(cacheKey) || detailCache.get(String(id).toLowerCase());
    if (cachedDetail && Date.now() - cachedDetail.timestamp < MEMORY_CACHE_TTL_MS) {
      return cachedDetail.data;
    }

    if (pendingDetailRequests.has(cacheKey)) {
      return pendingDetailRequests.get(cacheKey);
    }

    const fetchPromise = (async () => {
      try {
        try {
          const response = await apiClient.get(`/properties/${cleanId}/`);
          const rawData = response?.data?.data || response?.data || response;

          if (rawData && (rawData.property_id || rawData.id)) {
            const mapped = mapApiPropertyToUi(rawData, { isFullDetail: true });
            indexPropertyInMemory(mapped, { isFull: true });
            return mapped;
          }
        } catch {
          // Proceed to builder project fallback
        }

        try {
          const bpResponse = await apiClient.get(`/builders/projects/${cleanId}/`);
          const rawBpData = bpResponse?.data?.data || bpResponse?.data || bpResponse;

          if (rawBpData && (rawBpData.project_id || rawBpData.id)) {
            const mapped = mapApiPropertyToUi(rawBpData, { isFullDetail: true });
            indexPropertyInMemory(mapped, { isFull: true });
            return mapped;
          }
        } catch {
          // Proceed to fallback lookup
        }

        const fallbackMatch = NORMALIZED_FALLBACK_PROJECTS.find(
          (p) =>
            String(p.id).toLowerCase() === cacheKey ||
            String(p.slug).toLowerCase() === String(id).toLowerCase() ||
            slugify(p.name) === slugify(cleanId) ||
            slugify(p.name) === lookupSlug
        );
        if (fallbackMatch) {
          return fallbackMatch;
        }

        try {
          const allDbProperties = await this.getProperties();
          if (Array.isArray(allDbProperties) && allDbProperties.length > 0) {
            const match = allDbProperties.find(
              (p) =>
                String(p.id).toLowerCase() === cacheKey ||
                String(p.slug || '').toLowerCase() === String(id).toLowerCase() ||
                slugify(p.name) === slugify(cleanId) ||
                slugify(p.name) === lookupSlug
            );
            if (match) return match;
          }
        } catch (e) {
          console.warn('Database properties list search notice:', e);
        }

        return null;
      } finally {
        pendingDetailRequests.delete(cacheKey);
      }
    })();

    pendingDetailRequests.set(cacheKey, fetchPromise);
    return fetchPromise;
  },

  async getFilterOptions() {
    if (filterOptionsCache && Date.now() - filterOptionsCache.timestamp < FILTER_OPTIONS_TTL_MS) {
      return filterOptionsCache.data;
    }

    if (pendingFilterOptionsRequest) {
      return pendingFilterOptionsRequest;
    }

    const swrKey = `${SWR_PREFIX}filter_options`;

    pendingFilterOptionsRequest = (async () => {
      try {
        const response = await apiClient.get('/properties/filter-options/');
        const data = response?.data?.data || response?.data || null;
        if (data) {
          filterOptionsCache = { timestamp: Date.now(), data };
          writeSwr(swrKey, data);
        }
        return data;
      } catch (error) {
        console.warn('Failed to load filter options:', error);
        return readSwr(swrKey);
      } finally {
        pendingFilterOptionsRequest = null;
      }
    })();

    return pendingFilterOptionsRequest;
  },
};

export default propertyService;
