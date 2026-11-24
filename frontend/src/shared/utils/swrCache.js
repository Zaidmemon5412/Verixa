export const SWR_PREFIX = 'verixa_swr_v1_';
export const DEFAULT_SWR_TTL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Read a timestamped JSON entry from localStorage if still within TTL.
 */
export function readSwr(key, ttlMs = DEFAULT_SWR_TTL_MS) {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.timestamp !== 'number') return null;
    if (Date.now() - parsed.timestamp > ttlMs) {
      window.localStorage.removeItem(key);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

/**
 * Persist a JSON entry with current timestamp to localStorage, ignoring quota errors.
 */
export function writeSwr(key, data) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), data }));
  } catch {
    // Ignore storage quota or private browsing restrictions
  }
}
