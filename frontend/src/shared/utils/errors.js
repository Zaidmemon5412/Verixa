/**
 * Parses Axios/HTTP errors and returns a user-friendly error string.
 * Ensures backend stack traces or database errors are not shown raw.
 *
 * @param {object} error - The caught Axios error object
 * @returns {string} User-friendly error message
 */
export const getFriendlyErrorMessage = (error) => {
  if (!error) {
    return 'An unexpected error occurred.';
  }

  // Network connection failures (server unreachable)
  if (error.message === 'Network Error' || !error.response) {
    return 'Network connection failed. Please check that the backend service is running and online.';
  }

  const { status, data } = error.response;

  // Extract nested DRF validation error lists/messages if present
  if (data && typeof data === 'object') {
    // If backend returns a direct response message: { success: false, message: "..." }
    if (data.message && typeof data.message === 'string') {
      return data.message;
    }

    // If backend returns detail in data: { data: { detail: "..." } }
    if (data.data?.detail && typeof data.data.detail === 'string') {
      return data.data.detail;
    }

    // If backend returns serializing validation list error dictionary: { data: { email: ["..."] } }
    if (data.data && typeof data.data === 'object') {
      const fieldErrors = data.data;
      const firstFieldKey = Object.keys(fieldErrors)[0];
      if (firstFieldKey) {
        const errorsList = fieldErrors[firstFieldKey];
        const errorDetail = Array.isArray(errorsList) ? errorsList[0] : errorsList;
        if (typeof errorDetail === 'string') {
          const capitalizedField = firstFieldKey.charAt(0).toUpperCase() + firstFieldKey.slice(1).replace('_', ' ');
          return `${capitalizedField}: ${errorDetail}`;
        }
      }
    }

    // Check if errors are in standard serializing validation format directly under response: { email: ["..."] }
    const directKeys = Object.keys(data).filter(key => key !== 'success' && key !== 'message');
    if (directKeys.length > 0) {
      const firstDirectKey = directKeys[0];
      const errorsList = data[firstDirectKey];
      const errorDetail = Array.isArray(errorsList) ? errorsList[0] : errorsList;
      if (typeof errorDetail === 'string') {
        const capitalizedField = firstDirectKey.charAt(0).toUpperCase() + firstDirectKey.slice(1).replace('_', ' ');
        return `${capitalizedField}: ${errorDetail}`;
      }
    }
  }

  // Map HTTP status codes to standard friendly messages
  switch (status) {
    case 400:
      return 'Invalid request details. Please check the values entered.';
    case 401:
      return 'Incorrect email or password. Please verify your credentials.';
    case 403:
      return 'Access denied. You do not have permission to access this page.';
    case 404:
      return 'Requested resource was not found on the server.';
    case 422:
      return 'Could not process submitted input data due to semantic issues.';
    case 500:
      return 'Internal server error occurred. Please try again in a few moments.';
    default:
      return 'An error occurred while communicating with the server. Please try again.';
  }
};

export default getFriendlyErrorMessage;
