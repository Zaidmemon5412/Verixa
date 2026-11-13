import axios from 'axios';
import { getAccessToken } from '../utils/token';

const rawEnvUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const resolvedBaseUrl = rawEnvUrl.endsWith('/api')
  ? rawEnvUrl
  : `${rawEnvUrl.replace(/\/+$/, '')}/api`;

const apiClient = axios.create({
  baseURL: resolvedBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

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

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
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
