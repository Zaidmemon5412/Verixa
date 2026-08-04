import apiClient from '../../../shared/services/axios';
import { API_ENDPOINTS } from '../../../shared/services/endpoints';

/**
 * Service to handle authentication and user API interactions.
 * Components must interact with this layer, not directly with Axios.
 */
export const authService = {
  /**
   * Log in user with credentials.
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<object>} Response containing user profile and tokens
   */
  login: async (email, password) => {
    const response = await apiClient.post(API_ENDPOINTS.LOGIN, { email, password });
    return response.data;
  },

  /**
   * Register a new user account.
   * @param {object} userData - Form values for name, email, phone, passwords
   * @returns {Promise<object>} Response containing registered user data
   */
  register: async (userData) => {
    const response = await apiClient.post(API_ENDPOINTS.REGISTER, userData);
    return response.data;
  },

  /**
   * Log out active session and blacklist the refresh token.
   * @param {string} refreshToken - The active JWT refresh token to blacklist
   * @returns {Promise<object>} Log out success response
   */
  logout: async (refreshToken) => {
    const response = await apiClient.post(API_ENDPOINTS.LOGOUT, { refresh: refreshToken });
    return response.data;
  },

  /**
   * Fetch details of currently logged-in user profile.
   * @returns {Promise<object>} User profile details response
   */
  getProfile: async () => {
    const response = await apiClient.get(API_ENDPOINTS.PROFILE);
    return response.data;
  },

  /**
   * Send password reset email request.
   * @param {string} email - Email address to request password reset for
   * @returns {Promise<object>} Response message
   */
  forgotPassword: async (email) => {
    const response = await apiClient.post(API_ENDPOINTS.FORGOT_PASSWORD, { email });
    return response.data;
  },

  /**
   * Verify validity of a password reset token.
   * @param {string} uid - Base64 encoded user ID
   * @param {string} token - Password reset token
   * @returns {Promise<object>} Verification status
   */
  verifyResetToken: async (uid, token) => {
    const response = await apiClient.get(
      `${API_ENDPOINTS.RESET_PASSWORD_VERIFY}?uid=${encodeURIComponent(uid)}&token=${encodeURIComponent(token)}`
    );
    return response.data;
  },

  /**
   * Reset user password with valid token.
   * @param {object} payload - { uid, token, new_password, confirm_password }
   * @returns {Promise<object>} Password reset response
   */
  resetPassword: async (payload) => {
    const response = await apiClient.post(API_ENDPOINTS.RESET_PASSWORD, payload);
    return response.data;
  },

  /**
   * Verify the integrity of the access token with the backend.
   * @param {string} token - Access token to verify
   * @returns {Promise<object>} Success confirmation response
   */
  verifyToken: async (token) => {
    const response = await apiClient.post(API_ENDPOINTS.TOKEN_VERIFY, { token });
    return response.data;
  },

  /**
   * Manually request a refreshed access token.
   * @param {string} refresh - The refresh token
   * @returns {Promise<object>} Response containing a new access token
   */
  refreshToken: async (refresh) => {
    const response = await apiClient.post(API_ENDPOINTS.TOKEN_REFRESH, { refresh });
    return response.data;
  },
};

export default authService;
