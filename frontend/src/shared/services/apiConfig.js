const RENDER_ORIGIN = 'https://verixa-backend-hwqz.onrender.com';
export const FALLBACK_DIRECT_API_URL = `${RENDER_ORIGIN}/api`;

const AUTH_REQUIRED_PATH_PREFIXES = [
  '/accounts/',
  '/enquiries/',
  '/inquiries/',
  '/comparisons/',
  '/reports/',
  '/saved',
];

/**
 * Resolve primary API baseURL (same-origin `/api` Edge proxy on Vercel deployments,
 * direct origin in local/custom environments).
 */
export function resolveApiConfig({ localOrigin = 'http://127.0.0.1:8000' } = {}) {
  const isBrowser = typeof window !== 'undefined';
  const hostname = isBrowser ? window.location.hostname : '';
  const isLocalBrowser = hostname === 'localhost' || hostname === '127.0.0.1';
  const isVercelDeployment = isBrowser && hostname.endsWith('.vercel.app');

  const envCandidate = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '';
  const isCustomExternalEnv =
    Boolean(envCandidate) &&
    !envCandidate.includes('localhost') &&
    !envCandidate.includes('127.0.0.1') &&
    !envCandidate.includes('verixa-backend-hwqz.onrender.com');

  const useSameOriginProxy = isVercelDeployment && !isCustomExternalEnv;

  if (useSameOriginProxy) {
    return { baseURL: '/api', useSameOriginProxy: true };
  }

  const defaultOrigin = isLocalBrowser ? localOrigin : RENDER_ORIGIN;
  const rawEnvUrl =
    !isLocalBrowser && (envCandidate.includes('localhost') || envCandidate.includes('127.0.0.1') || !envCandidate)
      ? defaultOrigin
      : envCandidate || defaultOrigin;

  const normalized = rawEnvUrl.endsWith('/api')
    ? rawEnvUrl
    : `${rawEnvUrl.replace(/\/+$/, '')}/api`;

  return { baseURL: normalized, useSameOriginProxy: false };
}

/**
 * Only attach Bearer Authorization on non-GET mutations or private/user GET routes
 * so Vercel Edge CDN serves cached responses on public GETs even when logged in.
 */
export function shouldAttachAuthHeader(config) {
  const method = String(config?.method || 'get').toLowerCase();
  if (method !== 'get') return true;
  const url = String(config?.url || '').toLowerCase();
  return AUTH_REQUIRED_PATH_PREFIXES.some((prefix) => url.includes(prefix));
}

/**
 * Fallback to direct Render origin if Vercel Edge rewrite times out (502/504) during cold start.
 */
export function shouldRetryDirectOrigin(error, useSameOriginProxy) {
  const originalRequest = error?.config;
  const status = error?.response?.status;
  return Boolean(
    useSameOriginProxy &&
      originalRequest &&
      !originalRequest._retriedDirect &&
      (status === 502 || status === 504)
  );
}
