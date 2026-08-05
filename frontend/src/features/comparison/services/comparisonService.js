import { propertyService } from '../../properties/services/propertyService';

export const comparisonService = {
  /**
   * Fetches all live properties for comparison catalog.
   */
  async getAllProperties() {
    try {
      const properties = await propertyService.getProperties();
      return properties || [];
    } catch (err) {
      console.error('Error fetching properties for comparison:', err);
      return [];
    }
  },

  /**
   * Fetches specific properties by array of IDs.
   * @param {Array<string>} ids 
   */
  async getPropertiesByIds(ids = []) {
    if (!ids || ids.length === 0) return [];
    try {
      const all = await this.getAllProperties();
      const mappedMap = new Map(all.map(p => [String(p.id), p]));
      
      const results = [];
      for (const id of ids) {
        if (mappedMap.has(String(id))) {
          results.push(mappedMap.get(String(id)));
        } else {
          try {
            const single = await propertyService.getPropertyById(id);
            if (single) results.push(single);
          } catch (e) {
            console.warn(`Failed to fetch property details for ID ${id}`, e);
          }
        }
      }
      return results;
    } catch (err) {
      console.error('Error fetching comparison properties by IDs:', err);
      return [];
    }
  }
};

export default comparisonService;
