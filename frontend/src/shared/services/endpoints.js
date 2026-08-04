/**
 * Centralized API endpoints for the Verixa application.
 * All paths are relative to the baseURL configured in the Axios client.
 */
export const API_ENDPOINTS = {
  LOGIN: '/accounts/login/',
  REGISTER: '/accounts/register/',
  LOGOUT: '/accounts/logout/',
  PROFILE: '/accounts/profile/',
  FORGOT_PASSWORD: '/accounts/forgot-password/',
  RESET_PASSWORD_VERIFY: '/accounts/reset-password/verify/',
  RESET_PASSWORD: '/accounts/reset-password/',
  TOKEN_REFRESH: '/accounts/token/refresh/',
  TOKEN_VERIFY: '/accounts/token/verify/',
};

export default API_ENDPOINTS;
