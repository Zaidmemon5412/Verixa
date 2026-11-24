import { propertyService } from '../../features/properties/services/propertyService';
import { builderService } from '../../features/builders/services/builderService';
import { localityService } from '../../features/localities/services/localityService';
import { marketService } from '../../features/market/services/marketService';

const prefetchedPaths = new Set();
const dataWarmedKeys = new Set();

const ROUTE_CHUNKS = [
  { match: (p) => p === '/', load: () => import('../../features/landing/pages/LandingPage'), warmKey: 'landing' },
  {
    match: (p) => /^\/properties\/.+/.test(p),
    load: () => import('../../features/properties/pages/PropertyDetailPage'),
    warmKey: 'property_detail',
  },
  {
    match: (p) => p === '/properties',
    load: () => import('../../features/properties/pages/PropertiesPage'),
    warmKey: 'properties',
    warm: () => propertyService.prefetchInitialPage(),
  },
  {
    match: (p) => /^\/builders\/.+/.test(p),
    load: () => import('../../features/builders/pages/BuilderDetailsPage'),
    warmKey: 'builder_detail',
  },
  {
    match: (p) => p === '/builders',
    load: () => import('../../features/builders/pages/BuildersPage'),
    warmKey: 'builders',
    warm: () => builderService.getBuilders(),
  },
  {
    match: (p) => /^\/localities\/.+/.test(p),
    load: () => import('../../features/localities/pages/LocalityDetailsPage'),
    warmKey: 'locality_detail',
  },
  {
    match: (p) => p === '/localities',
    load: () => import('../../features/localities/pages/LocalitiesPage'),
    warmKey: 'localities',
    warm: () => localityService.getLocalities(),
  },
  {
    match: (p) => p === '/market',
    load: () => import('../../features/market/pages/MarketTrendsPage'),
    warmKey: 'market',
    warm: () => marketService.getMarketTrends({ city: 'Ahmedabad', locality: 'All', timeframe: '6M' }),
  },
  {
    match: (p) => p === '/comparison',
    load: () => import('../../features/comparison/pages/ComparisonPage'),
    warmKey: 'comparison',
    warm: () => propertyService.prefetchInitialPage(),
  },
  {
    match: (p) => /^\/guides\/.+/.test(p),
    load: () => import('../../features/guides/pages/GuideDetailPage'),
    warmKey: 'guide_detail',
  },
  {
    match: (p) => p === '/guides',
    load: () => import('../../features/guides/pages/GuidesPage'),
    warmKey: 'guides',
  },
];

/**
 * Preloads the matching React lazy chunk and optionally pre-warms its API data on hover/touch.
 */
export function prefetchRoute(routePath) {
  if (!routePath || typeof window === 'undefined') return;
  const cleanPath = String(routePath).split('?')[0].split('#')[0] || '/';
  const entry = ROUTE_CHUNKS.find((item) => item.match(cleanPath));
  if (!entry) return;

  if (!prefetchedPaths.has(entry.warmKey)) {
    prefetchedPaths.add(entry.warmKey);
    entry.load().catch(() => {
      prefetchedPaths.delete(entry.warmKey);
    });
  }

  if (entry.warm && !dataWarmedKeys.has(entry.warmKey)) {
    dataWarmedKeys.add(entry.warmKey);
    Promise.resolve(entry.warm()).catch(() => {});
  }
}

export default prefetchRoute;
