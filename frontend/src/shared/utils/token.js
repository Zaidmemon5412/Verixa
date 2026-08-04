/**
 * Utility functions for token storage and management.
 * Decouples the application code from local storage implementation.
 */

const ACCESS_TOKEN_KEY = 'verixa_access_token';
const REFRESH_TOKEN_KEY = 'verixa_refresh_token';

/**
 * Retrieve the access token from storage.
 * @returns {string|null} The active JWT access token or null
 */
export const getAccessToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Save the access token to storage.
 * @param {string} token - The JWT access token
 */
export const setAccessToken = (token) => {
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
};

/**
 * Retrieve the refresh token from storage.
 * @returns {string|null} The active JWT refresh token or null
 */
export const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Save the refresh token to storage.
 * @param {string} token - The JWT refresh token
 */
export const setRefreshToken = (token) => {
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

/**
 * Clear all authentication tokens from storage.
 */
export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};
