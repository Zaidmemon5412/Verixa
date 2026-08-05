import apiClient from '../../../shared/services/apiClient';
import { LOCALITIES } from '../constants/localityData';


export const localityService = {
  async getLocalities() {
    try {
      const response = await apiClient.get('/locations/localities/');
      const rawData = response?.data?.results || response?.data || response;
      if (Array.isArray(rawData) && rawData.length > 0) {
        return rawData.map((item, idx) => {
          const matchMeta = LOCALITIES.find(
            (l) => l.name.toLowerCase() === (item.name || '').toLowerCase() || l.slug === (item.name || '').toLowerCase().replace(/\s+/g, '-')
          ) || LOCALITIES[idx % LOCALITIES.length];

          return {
            ...matchMeta,
            id: item.locality_id || item.id || matchMeta.id,
            slug: item.slug || matchMeta.slug || String(item.name || '').toLowerCase().replace(/\s+/g, '-'),
            name: item.name || matchMeta.name,
            city: item.city || matchMeta.city || 'Ahmedabad',
            state: item.state || matchMeta.state || 'Gujarat',
            latitude: item.latitude != null ? parseFloat(item.latitude) : matchMeta.latitude,
            longitude: item.longitude != null ? parseFloat(item.longitude) : matchMeta.longitude,
          };
        });
      }
    } catch (err) {
      console.warn('Backend locality list fetch warning, falling back to rich metadata:', err);
    }
    return LOCALITIES;
  },

  async getLocalityById(idOrSlug) {
    if (!idOrSlug) return LOCALITIES[0];

    const cleanQuery = String(idOrSlug).toLowerCase().trim();

    // 1. Check local static metadata first for exact ID/slug/name match
    const staticMatch = LOCALITIES.find(
      (l) => l.id === cleanQuery ||
             l.slug === cleanQuery ||
             l.name.toLowerCase() === cleanQuery ||
             l.name.toLowerCase().replace(/\s+/g, '-') === cleanQuery
    );

    // 2. Fetch API live analytics endpoint GET /api/locations/localities/:id/analytics/
    try {
      const response = await apiClient.get(`/locations/localities/${idOrSlug}/analytics/`);
      const apiItem = response?.data || response;

      if (apiItem && (apiItem.locality_id || apiItem.name)) {
        const meta = staticMatch || LOCALITIES.find(
          (l) => l.name.toLowerCase() === (apiItem.name || '').toLowerCase()
        ) || LOCALITIES[0];

        return {
          ...meta,
          id: apiItem.locality_id || meta.id,
          slug: meta.slug || String(apiItem.name || '').toLowerCase().replace(/\s+/g, '-'),
          name: apiItem.name || meta.name,
          city: apiItem.city || meta.city,
          state: apiItem.state || meta.state,
          avgPrice: apiItem.avgPrice || meta.avgPrice,
          psf: apiItem.psf || meta.psf,
          growthScore: apiItem.growthScore || meta.growthScore,
          traffic: apiItem.traffic || meta.traffic,
          trafficDesc: apiItem.trafficDesc || meta.trafficDesc,
          scorecard: apiItem.scorecard || meta.scorecard,
          verdict: apiItem.verdict || meta.verdict,
          verdictSummary: apiItem.verdictSummary || meta.verdictSummary,
          infra: apiItem.infra || meta.infra,
        };
      }
    } catch (err) {
      // Endpoint 404 or missing, proceed with static match fallback
    }


    return staticMatch || LOCALITIES[0];
  }
};
