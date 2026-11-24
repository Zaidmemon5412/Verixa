import apiClient from '../../../shared/services/apiClient';
import { LOCALITIES } from '../constants/localityData';
import { readSwr, writeSwr, SWR_PREFIX } from '../../../shared/utils/swrCache';

const TARGET_6_NAMES = ['satellite', 'thaltej', 'gota', 'chandkheda', 'sola', 'maninagar'];
const MEMORY_CACHE_TTL_MS = 5 * 60 * 1000;

let localitiesListCache = null;
let pendingLocalitiesRequest = null;
const localityDetailCache = new Map();
const pendingLocalityDetailRequests = new Map();

function findStaticLocalityMatch(idOrSlug) {
  if (!idOrSlug) return LOCALITIES[0];
  const cleanQuery = String(idOrSlug).toLowerCase().trim();
  return (
    LOCALITIES.find(
      (l) =>
        String(l.id).toLowerCase() === cleanQuery ||
        l.slug === cleanQuery ||
        l.name.toLowerCase() === cleanQuery ||
        l.name.toLowerCase().replace(/\s+/g, '-') === cleanQuery
    ) || null
  );
}

export const localityService = {
  getCachedLocalities() {
    if (localitiesListCache && Date.now() - localitiesListCache.timestamp < MEMORY_CACHE_TTL_MS) {
      return localitiesListCache.data;
    }
    const swr = readSwr(`${SWR_PREFIX}localities_list`);
    if (Array.isArray(swr) && swr.length > 0) {
      localitiesListCache = { timestamp: Date.now(), data: swr };
      return swr;
    }
    return LOCALITIES;
  },

  getCachedLocalityById(idOrSlug) {
    const cleanKey = String(idOrSlug || '1').toLowerCase().trim();
    const cached = localityDetailCache.get(cleanKey);
    if (cached && Date.now() - cached.timestamp < MEMORY_CACHE_TTL_MS) {
      return cached.data;
    }
    const swr = readSwr(`${SWR_PREFIX}locality_${cleanKey}`);
    if (swr) {
      localityDetailCache.set(cleanKey, { timestamp: Date.now(), data: swr });
      return swr;
    }
    return findStaticLocalityMatch(idOrSlug) || LOCALITIES[0];
  },

  async getLocalities({ forceRefresh = false } = {}) {
    if (!forceRefresh && localitiesListCache && Date.now() - localitiesListCache.timestamp < MEMORY_CACHE_TTL_MS) {
      return localitiesListCache.data;
    }
    if (pendingLocalitiesRequest) return pendingLocalitiesRequest;

    pendingLocalitiesRequest = (async () => {
      try {
        const response = await apiClient.get('/locations/localities/');
        const rawData = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.data)
          ? response.data.data
          : Array.isArray(response?.data?.data?.results)
          ? response.data.data.results
          : Array.isArray(response?.data?.results)
          ? response.data.results
          : Array.isArray(response?.results)
          ? response.results
          : [];

        if (rawData.length > 0) {
          const resultsMap = new Map();

          for (const target of TARGET_6_NAMES) {
            const primaryItem =
              rawData.find((item) => {
                if (!item || !item.name) return false;
                const n = String(item.name).toLowerCase().trim();
                return n === `${target}, ahmedabad` || n === target;
              }) ||
              rawData.find((item) => {
                if (!item || !item.name) return false;
                const n = String(item.name).toLowerCase().trim();
                return n.startsWith(`${target},`) || n.startsWith(target);
              });

            if (primaryItem) {
              const matchMeta =
                LOCALITIES.find(
                  (l) =>
                    l.name.toLowerCase() === (primaryItem.name || '').toLowerCase().replace(/,\s*ahmedabad/i, '') ||
                    l.slug ===
                      (primaryItem.name || '')
                        .toLowerCase()
                        .replace(/,\s*ahmedabad/i, '')
                        .replace(/\s+/g, '-')
                ) || LOCALITIES.find((l) => l.slug === target);

              const merged = {
                ...matchMeta,
                ...primaryItem,
                id: primaryItem.locality_id || primaryItem.id || matchMeta?.id,
                slug: matchMeta?.slug || target,
                name: matchMeta?.name || primaryItem.name.replace(/,\s*ahmedabad/i, ''),
                city: primaryItem.city || matchMeta?.city || 'Ahmedabad',
                state: primaryItem.state || matchMeta?.state || 'Gujarat',
                avgPrice: primaryItem.avgPrice || matchMeta?.avgPrice,
                avgPriceNum: primaryItem.avgPriceNum !== undefined ? primaryItem.avgPriceNum : matchMeta?.avgPriceNum,
                image:
                  matchMeta?.image ||
                  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=600&fit=crop&auto=format',
              };

              resultsMap.set(merged.slug, merged);
            }
          }

          if (resultsMap.size > 0) {
            const finalList = Array.from(resultsMap.values());
            localitiesListCache = { timestamp: Date.now(), data: finalList };
            writeSwr(`${SWR_PREFIX}localities_list`, finalList);
            return finalList;
          }
        }
      } catch (err) {
        console.warn('Backend locality list fetch notice, returning target micro-markets:', err);
      } finally {
        pendingLocalitiesRequest = null;
      }
      return readSwr(`${SWR_PREFIX}localities_list`) || LOCALITIES;
    })();

    return pendingLocalitiesRequest;
  },

  async getLocalityById(idOrSlug) {
    if (!idOrSlug) return LOCALITIES[0];

    const cleanQuery = String(idOrSlug).toLowerCase().trim();
    const mem = localityDetailCache.get(cleanQuery);
    if (mem && Date.now() - mem.timestamp < MEMORY_CACHE_TTL_MS) {
      return mem.data;
    }

    if (pendingLocalityDetailRequests.has(cleanQuery)) {
      return pendingLocalityDetailRequests.get(cleanQuery);
    }

    const staticMatch = findStaticLocalityMatch(idOrSlug);

    const fetchPromise = (async () => {
      try {
        const response = await apiClient.get(`/locations/localities/${idOrSlug}/analytics/`);
        const apiItem =
          response?.locality_id || response?.name || response?.avgPrice
            ? response
            : response?.data || response;

        if (apiItem && (apiItem.locality_id || apiItem.name || apiItem.avgPrice)) {
          const meta =
            staticMatch ||
            LOCALITIES.find(
              (l) =>
                l.name.toLowerCase() === (apiItem.name || '').toLowerCase().replace(/,\s*ahmedabad/i, '') ||
                l.slug ===
                  (apiItem.name || '')
                    .toLowerCase()
                    .replace(/,\s*ahmedabad/i, '')
                    .replace(/\s+/g, '-')
            ) ||
            LOCALITIES[0];

          const merged = {
            ...meta,
            ...apiItem,
            id: apiItem.locality_id || meta?.id,
            slug:
              meta?.slug ||
              String(apiItem.name || '')
                .toLowerCase()
                .replace(/,\s*ahmedabad/i, '')
                .replace(/\s+/g, '-'),
            name: meta?.name || apiItem.name.replace(/,\s*ahmedabad/i, ''),
            city: apiItem.city || meta?.city || 'Ahmedabad',
            state: apiItem.state || meta?.state || 'Gujarat',
            avgPrice: apiItem.avgPrice || meta?.avgPrice,
            avgPriceNum: apiItem.avgPriceNum !== undefined ? apiItem.avgPriceNum : meta?.avgPriceNum,
            image:
              meta?.image ||
              'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=600&fit=crop&auto=format',
          };

          localityDetailCache.set(cleanQuery, { timestamp: Date.now(), data: merged });
          if (merged.slug) {
            localityDetailCache.set(String(merged.slug).toLowerCase(), { timestamp: Date.now(), data: merged });
          }
          writeSwr(`${SWR_PREFIX}locality_${cleanQuery}`, merged);
          return merged;
        }
      } catch {
        // Return static match on API error
      } finally {
        pendingLocalityDetailRequests.delete(cleanQuery);
      }

      return staticMatch || LOCALITIES[0];
    })();

    pendingLocalityDetailRequests.set(cleanQuery, fetchPromise);
    return fetchPromise;
  },
};

export default localityService;
