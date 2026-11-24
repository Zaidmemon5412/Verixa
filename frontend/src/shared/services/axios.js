import axios from 'axios';
import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken, clearTokens } from '../utils/token';
import { API_ENDPOINTS } from './endpoints';
import {
  FALLBACK_DIRECT_API_URL,
  resolveApiConfig,
  shouldAttachAuthHeader,
  shouldRetryDirectOrigin,
} from './apiConfig';

const { baseURL: API_BASE_URL, useSameOriginProxy } = resolveApiConfig({
  localOrigin: 'http://localhost:8000',
});

// Create Axios Instance (60s timeout to accommodate Render free-tier cold start)
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor to attach active JWT Bearer token only when required
apiClient.interceptors.request.use(
  (config) => {
    if (shouldAttachAuthHeader(config)) {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else if (config.headers?.Authorization) {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Queue arrays to store pending failed requests during refresh executions
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor to capture 401 response and attempt silent auto-refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (shouldRetryDirectOrigin(error, useSameOriginProxy)) {
      originalRequest._retriedDirect = true;
      originalRequest.baseURL = FALLBACK_DIRECT_API_URL;
      return apiClient(originalRequest);
    }

    // Avoid recursion if token refresh call itself returns a 401
    if (originalRequest?.url === API_ENDPOINTS.TOKEN_REFRESH) {
      clearTokens();
      window.dispatchEvent(new Event('auth:logout'));
      return Promise.reject(error);
    }

    // Capture 401 Unauthorized status codes (skip public auth endpoints like login/register)
    const reqUrl = String(originalRequest?.url || '');
    const isPublicAuthCall =
      reqUrl.includes('/accounts/login') ||
      reqUrl.includes('/accounts/register') ||
      reqUrl.includes('/accounts/forgot-password') ||
      reqUrl.includes('/accounts/reset-password');

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isPublicAuthCall) {
      if (isRefreshing) {
        // Enqueue request while refresh is actively in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearTokens();
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(error);
      }

      isRefreshing = true;

      try {
        // Invoke API token refresh endpoint (use a separate standard axios client to prevent loops)
        let response;
        try {
          response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.TOKEN_REFRESH}`, {
            refresh: refreshToken,
          });
        } catch (refreshHttpErr) {
          const st = refreshHttpErr?.response?.status;
          const isNonJson404 =
            st === 404 &&
            (typeof refreshHttpErr?.response?.data !== 'object' || refreshHttpErr?.response?.data === null);
          if (useSameOriginProxy && (!st || st === 502 || st === 503 || st === 504 || isNonJson404)) {
            response = await axios.post(`${FALLBACK_DIRECT_API_URL}${API_ENDPOINTS.TOKEN_REFRESH}`, {
              refresh: refreshToken,
            });
          } else {
            throw refreshHttpErr;
          }
        }

        const newAccessToken = response.data.access;
        setAccessToken(newAccessToken);

        // Save rotated refresh token if provided by backend
        if (response.data.refresh) {
          setRefreshToken(response.data.refresh);
        }

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        isRefreshing = false;

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        clearTokens();
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(refreshError);
      }
    }

    // Surface structured rate-limit metadata on HTTP 429 responses
    if (error.response?.status === 429) {
      const retryAfter =
        error.response.data?.retry_after ||
        error.response.headers?.['retry-after'] ||
        null;
      error.isRateLimited = true;
      error.retryAfter = retryAfter;
      window.dispatchEvent(
        new CustomEvent('api:rate-limited', {
          detail: {
            message:
              error.response.data?.message ||
              (retryAfter
                ? `Too many requests. Please wait ${retryAfter} seconds.`
                : 'Too many requests. Please slow down and try again shortly.'),
            retryAfter,
          },
        })
      );
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
