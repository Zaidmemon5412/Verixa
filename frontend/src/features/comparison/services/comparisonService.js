import { propertyService } from '../../properties/services/propertyService';

export const comparisonService = {
  /**
   * Fetches Page 1 catalog slice for quick comparison suggestions without downloading all records.
   */
  async getAllProperties() {
    try {
      const cached = propertyService.getCachedPropertiesPage({ ordering: 'newest' }, { page: 1, pageSize: 48 });
      if (cached?.results?.length > 0 && !cached.fromStorage) {
        return cached.results;
      }
      const pageData = await propertyService.getPropertiesPage(
        { ordering: 'newest' },
        { page: 1, pageSize: 48 }
      );
      return pageData?.results || [];
    } catch (err) {
      console.error('Error fetching properties for comparison:', err);
      return [];
    }
  },

  /**
   * Fetches only the selected comparison property IDs in parallel (cached first).
   * @param {Array<string>} ids
   */
  async getPropertiesByIds(ids = []) {
    if (!ids || ids.length === 0) return [];
    try {
      const resolved = await Promise.all(
        ids.map(async (id) => {
          const cached = propertyService.getCachedProperty(id);
          if (cached && cached._isFullDetail) return cached;
          try {
            const fetched = await propertyService.getPropertyById(id);
            return fetched || cached || null;
          } catch (e) {
            console.warn(`Failed to fetch property details for ID ${id}`, e);
            return cached || null;
          }
        })
      );
      return resolved.filter(Boolean);
    } catch (err) {
      console.error('Error fetching comparison properties by IDs:', err);
      return [];
    }
  },
};

export default comparisonService;
