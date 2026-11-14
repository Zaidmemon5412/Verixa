import axios from 'axios';
import { getAccessToken } from '../utils/token';

const isLocalBrowser =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const defaultBackendOrigin = isLocalBrowser
  ? 'http://127.0.0.1:8000'
  : 'https://verixa-backend-hwqz.onrender.com';

const envCandidate = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '';
const rawEnvUrl =
  !isLocalBrowser && (envCandidate.includes('localhost') || envCandidate.includes('127.0.0.1') || !envCandidate)
    ? defaultBackendOrigin
    : envCandidate || defaultBackendOrigin;

const resolvedBaseUrl = rawEnvUrl.endsWith('/api')
  ? rawEnvUrl
  : `${rawEnvUrl.replace(/\/+$/, '')}/api`;

const apiClient = axios.create({
  baseURL: resolvedBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
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
