import axios from 'axios';
import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken, clearTokens } from '../utils/token';
import { API_ENDPOINTS } from './endpoints';

const rawEnvUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_BASE_URL = rawEnvUrl.endsWith('/api')
  ? rawEnvUrl
  : `${rawEnvUrl.replace(/\/+$/, '')}/api`;

// Create Axios Instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor to automatically attach active JWT Bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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

    // Avoid recursion if token refresh call itself returns a 401
    if (originalRequest.url === API_ENDPOINTS.TOKEN_REFRESH) {
      clearTokens();
      window.dispatchEvent(new Event('auth:logout'));
      return Promise.reject(error);
    }

    // Capture 401 Unauthorized status codes
    if (error.response?.status === 401 && !originalRequest._retry) {
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
        const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.TOKEN_REFRESH}`, {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;
        setAccessToken(newAccessToken);
        
        // Save rotated refresh token if provided by backend
        if (response.data.refresh) {
          setRefreshToken(response.data.refresh);
        }

        apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
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
