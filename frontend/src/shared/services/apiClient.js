import axios from 'axios';
import { getAccessToken } from '../utils/token';
import {
  FALLBACK_DIRECT_API_URL,
  resolveApiConfig,
  shouldAttachAuthHeader,
  shouldRetryDirectOrigin,
} from './apiConfig';

const { baseURL, useSameOriginProxy } = resolveApiConfig({
  localOrigin: 'http://127.0.0.1:8000',
});

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 60000,
});

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

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (shouldRetryDirectOrigin(error, useSameOriginProxy)) {
      const retryConfig = error.config;
      retryConfig._retriedDirect = true;
      retryConfig.baseURL = FALLBACK_DIRECT_API_URL;
      return apiClient(retryConfig);
    }
    if (error?.response?.status === 429) {
      const retryAfter =
        error.response.data?.retry_after ||
        error.response.headers?.['retry-after'] ||
        null;
      error.isRateLimited = true;
      error.retryAfter = retryAfter;
    }
    console.error('API Error:', error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
