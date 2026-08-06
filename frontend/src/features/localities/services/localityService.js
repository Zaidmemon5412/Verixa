import apiClient from '../../../shared/services/apiClient';
import { LOCALITIES } from '../constants/localityData';

const TARGET_5_NAMES = ['gota', 'chandkheda', 'sola', 'thaltej', 'satellite'];

export const localityService = {
  async getLocalities() {
    try {
      const response = await apiClient.get('/locations/localities/');
      const rawData = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.results)
        ? response.results
        : [];

      if (rawData.length > 0) {
        // Filter raw database records strictly to the 5 target micro-markets
        const filtered = rawData.filter(item => 
          item && item.name && TARGET_5_NAMES.some(t => String(item.name).toLowerCase().includes(t))
        );

        if (filtered.length > 0) {
          const mapped = filtered.map((item, idx) => {
            const matchMeta = LOCALITIES.find(
              (l) => l.name.toLowerCase() === (item.name || '').toLowerCase() || l.slug === (item.name || '').toLowerCase().replace(/\s+/g, '-')
            ) || LOCALITIES[idx % LOCALITIES.length];

            return {
              ...matchMeta,
              id: item.locality_id || item.id || matchMeta.id,
              slug: matchMeta.slug || String(item.name || '').toLowerCase().replace(/\s+/g, '-'),
              name: matchMeta.name,
              city: item.city || matchMeta.city || 'Ahmedabad',
              state: item.state || matchMeta.state || 'Gujarat',
            };
          });

          // Ensure unique output for each of the 5 localities
          const seen = new Set();
          const uniqueRes = [];
          mapped.forEach(l => {
            if (!seen.has(l.name)) {
              seen.add(l.name);
              uniqueRes.push(l);
            }
          });
          if (uniqueRes.length > 0) return uniqueRes;
        }
      }
    } catch (err) {
      console.warn('Backend locality list fetch notice, returning 5 target micro-markets:', err);
    }
    return LOCALITIES;
  },

  async getLocalityById(idOrSlug) {
    if (!idOrSlug) return LOCALITIES[0];

    const cleanQuery = String(idOrSlug).toLowerCase().trim();

    const staticMatch = LOCALITIES.find(
      (l) => l.id === cleanQuery ||
             l.slug === cleanQuery ||
             l.name.toLowerCase() === cleanQuery ||
             l.name.toLowerCase().replace(/\s+/g, '-') === cleanQuery
    );

    try {
      const response = await apiClient.get(`/locations/localities/${idOrSlug}/analytics/`);
      const apiItem = (response?.locality_id || response?.name) ? response : (response?.data || response);

      if (apiItem && (apiItem.locality_id || apiItem.name)) {
        const meta = staticMatch || LOCALITIES.find(
          (l) => l.name.toLowerCase() === (apiItem.name || '').toLowerCase()
        ) || LOCALITIES[0];

        return {
          ...meta,
          id: apiItem.locality_id || meta.id,
          slug: meta.slug || String(apiItem.name || '').toLowerCase().replace(/\s+/g, '-'),
          name: meta.name || apiItem.name,
          city: apiItem.city || meta.city,
          state: apiItem.state || meta.state,
          avgPrice: apiItem.avgPrice || meta.avgPrice,
          psf: apiItem.psf || meta.psf,
          growthScore: apiItem.growthScore || meta.growthScore,
        };
      }
    } catch (err) {
      // Return static match on API error
    }

    return staticMatch || LOCALITIES[0];
  }
};

export default localityService;
