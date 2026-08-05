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

    // 2. Fetch API endpoint GET /api/locations/localities/:id/
    try {
      const response = await apiClient.get(`/locations/localities/${idOrSlug}/`);
      const apiItem = response?.data?.data || response?.data || response;

      if (apiItem && (apiItem.locality_id || apiItem.id || apiItem.name)) {
        const meta = staticMatch || LOCALITIES.find(
          (l) => l.name.toLowerCase() === (apiItem.name || '').toLowerCase()
        ) || LOCALITIES[0];

        return {
          ...meta,
          id: apiItem.locality_id || apiItem.id || meta.id,
          slug: apiItem.slug || meta.slug || String(apiItem.name || '').toLowerCase().replace(/\s+/g, '-'),
          name: apiItem.name || meta.name,
          city: apiItem.city || meta.city || 'Ahmedabad',
          state: apiItem.state || meta.state || 'Gujarat',
          latitude: apiItem.latitude != null ? parseFloat(apiItem.latitude) : meta.latitude,
          longitude: apiItem.longitude != null ? parseFloat(apiItem.longitude) : meta.longitude,
        };
      }
    } catch (err) {
      // Endpoint 404 or missing, proceed with static match fallback
    }

    return staticMatch || LOCALITIES[0];
  }
};
