/**
 * Centralized API endpoints for the Verixa application.
 * All paths are relative to the baseURL configured in the Axios client.
 */
export const API_ENDPOINTS = {
  LOGIN: '/accounts/login/',
  REGISTER: '/accounts/register/',
  LOGOUT: '/accounts/logout/',
  PROFILE: '/accounts/profile/',
  TOKEN_REFRESH: '/accounts/token/refresh/',
  TOKEN_VERIFY: '/accounts/token/verify/',
};

export default API_ENDPOINTS;
