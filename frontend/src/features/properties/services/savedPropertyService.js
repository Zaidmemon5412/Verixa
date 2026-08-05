import apiClient from '../../../shared/services/apiClient';
import { mapApiPropertyToUi } from './propertyService';

export const savedPropertyService = {
  /**
   * Retrieves the authenticated user's saved properties list.
   * @returns {Promise<Array>} Array of mapped UI property objects
   */
  async getSavedProperties() {
    try {
      const response = await apiClient.get('/accounts/saved-properties/');
      
      let rawResults = [];
      const resData = response?.data || response;

      if (resData?.results && Array.isArray(resData.results)) {
        rawResults = resData.results;
      } else if (Array.isArray(resData)) {
        rawResults = resData;
      }

      const mappedList = rawResults.map((item) => {
        const propObj = item.property_details || item.property || item;
        return mapApiPropertyToUi(propObj);
      }).filter(Boolean);

      return mappedList;
    } catch (error) {
      console.error('Error fetching saved properties:', error);
      throw error;
    }
  },

  /**
   * Saves a property to the user's wishlist.
   * @param {string} propertyId 
   */
  async saveProperty(propertyId) {
    if (!propertyId) throw new Error('Property ID is required.');
    const response = await apiClient.post('/accounts/saved-properties/', {
      property_id: propertyId
    });
    return response;
  },

  /**
   * Removes a saved property from the user's wishlist.
   * @param {string} propertyId 
   */
  async removeSavedProperty(propertyId) {
    if (!propertyId) throw new Error('Property ID is required.');
    const response = await apiClient.delete(`/accounts/saved-properties/${propertyId}/`);
    return response;
  }
};

export default savedPropertyService;
