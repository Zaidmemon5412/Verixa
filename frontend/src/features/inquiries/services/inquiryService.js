import apiClient from '../../../shared/services/apiClient';

export const inquiryService = {
  /**
   * Submits a property enquiry or site visit request to POST /api/enquiries/
   * @param {object} payload - Form inputs
   * @returns {Promise<object>} API response
   */
  async createEnquiry({
    propertyId,
    fullName,
    phone,
    email,
    type = 'Site Visit',
    preferredDate = '',
    preferredTime = '',
    message = ''
  }) {
    if (!propertyId) {
      throw new Error('Property ID is required for submitting an enquiry.');
    }

    const formattedMessage = [
      `Inquiry Type: ${type === 'site_visit' ? 'Site Visit' : 'Callback Request'}`,
      `Full Name: ${fullName}`,
      `Phone Number: ${phone}`,
      `Email: ${email}`,
      preferredDate ? `Preferred Date: ${preferredDate}` : null,
      preferredTime ? `Preferred Time: ${preferredTime}` : null,
      message ? `Message: ${message}` : null
    ].filter(Boolean).join('\n');

    const body = {
      property_id: propertyId,
      message: formattedMessage
    };

    const response = await apiClient.post('/enquiries/', body);
    return response;
  }
};

export default inquiryService;
