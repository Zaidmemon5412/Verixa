let seedDataCache;
let pendingSeedPromise = null;

/**
 * Fetches `/data/initial-catalog.json` generated at build time (deduplicated & timeout-bounded).
 * Provides instant real DB hydration when Render is cold-starting for first-time visitors.
 */
export async function getCatalogSeed() {
  if (typeof window === 'undefined') return null;
  if (seedDataCache !== undefined) return seedDataCache;
  if (pendingSeedPromise) return pendingSeedPromise;

  pendingSeedPromise = (async () => {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), 2500) : null;
    try {
      const res = await fetch('/data/initial-catalog.json', {
        signal: controller?.signal,
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        seedDataCache = null;
        return null;
      }
      const data = await res.json();
      seedDataCache = data && typeof data === 'object' ? data : null;
      return seedDataCache;
    } catch {
      seedDataCache = null;
      return null;
    } finally {
      if (timer) clearTimeout(timer);
      pendingSeedPromise = null;
    }
  })();

  return pendingSeedPromise;
}

export default getCatalogSeed;
