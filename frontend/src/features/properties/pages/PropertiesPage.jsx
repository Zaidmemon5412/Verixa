import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Building2, Sparkles, Filter, CheckCircle2, RotateCcw, Loader2 } from 'lucide-react';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyFilters } from '../components/PropertyFilters';
import { propertyService } from '../services/propertyService';
import { localityService } from '../../localities/services/localityService';
import useWishlist from '../hooks/useWishlist';
import usePropertyComparison from '../../comparison/hooks/usePropertyComparison';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { Button } from '../../../shared/components/ui/button';
import { SEOHead } from '../../../shared/components/SEOHead';
import { buildBreadcrumbSchema, buildItemListSchema } from '../../../shared/utils/seoUtils';

const PAGE_SIZE = 24;
const COLD_START_GRACE_MS = 900;
const KNOWN_LOCALITIES = ['Gota', 'Chandkheda', 'Sola', 'Thaltej', 'Satellite', 'Maninagar'];
const KNOWN_TYPES = ['Apartment', 'Villa', 'Plot', 'Penthouse', 'Studio'];
const STATUS_FROM_PARAM = {
  ready: 'Ready to Move',
  'ready-to-move': 'Ready to Move',
  'ready to move': 'Ready to Move',
  under_construction: 'Under Construction',
  'under-construction': 'Under Construction',
  'under construction': 'Under Construction',
  new: 'New Launch',
  'new-launch': 'New Launch',
  'new launch': 'New Launch',
};
const STATUS_TO_PARAM = {
  'Ready to Move': 'ready',
  'Under Construction': 'under_construction',
  'New Launch': 'new',
};

function parseSearchParams(params) {
  const rawSearch = params.get('search') || '';
  const rawLoc = params.get('locality') || '';
  const matchedLoc =
    KNOWN_LOCALITIES.find((l) => l.toLowerCase() === rawLoc.trim().toLowerCase()) || 'All';

  const rawType = params.get('type') || '';
  const matchedType =
    KNOWN_TYPES.find((t) => t.toLowerCase() === rawType.trim().toLowerCase()) || 'All';

  const rawStatus = params.get('status') || '';
  const matchedStatus = STATUS_FROM_PARAM[rawStatus.trim().toLowerCase()] || 'All';

  const rawBhk = params.get('bhk') || '';
  const parsedBhk = rawBhk
    ? rawBhk
        .split(',')
        .map((v) => String(v).replace(/[^0-9]/g, ''))
        .filter((n) => ['1', '2', '3', '4'].includes(n))
        .map((n) => `${n} BHK`)
    : [];

  return {
    search: rawSearch,
    locality: matchedLoc,
    type: matchedType,
    status: matchedStatus,
    bhk: [...new Set(parsedBhk)],
  };
}

export function PropertiesPage({ onSelectProject, wishlist = [], onToggleWishlist }) {
  const { isWishlisted: checkIsWishlisted, toggleWishlist: defaultToggleWishlist } = useWishlist();
  const { selectedIds, addProperty, removeProperty } = usePropertyComparison();

  const handleToggleCompare = (propertyId) => {
    const targetId = String(propertyId);
    if (selectedIds.includes(targetId)) {
      removeProperty(targetId);
    } else {
      addProperty(targetId);
    }
  };

  const [searchParams, setSearchParams] = useSearchParams();
  const initialFromUrl = parseSearchParams(searchParams);

  const initialCachedPage = propertyService.getCachedPropertiesPage(
    {
      search: initialFromUrl.search,
      locality: initialFromUrl.locality,
      status: initialFromUrl.status,
      property_type: initialFromUrl.type,
      bhk: initialFromUrl.bhk.length > 0 ? initialFromUrl.bhk : undefined,
      builder: 'All',
      ordering: 'newest',
    },
    { page: 1, pageSize: PAGE_SIZE }
  );

  const [projects, setProjects] = useState(initialCachedPage?.results || []);
  const [totalCount, setTotalCount] = useState(initialCachedPage?.count || 0);
  const [currentPage, setCurrentPage] = useState(initialCachedPage?.currentPage || 1);
  const [hasMore, setHasMore] = useState(Boolean(initialCachedPage?.hasNext));
  const [localities, setLocalities] = useState([]);
  const [builders, setBuilders] = useState([]);
  const [loading, setLoading] = useState(!initialCachedPage);
  const [isSyncingLive, setIsSyncingLive] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filter States (hydrated from URL query params for Programmatic SEO)
  const [searchQuery, setSearchQuery] = useState(initialFromUrl.search);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(initialFromUrl.search);
  const [selectedLocality, setSelectedLocality] = useState(initialFromUrl.locality);
  const [selectedStatus, setSelectedStatus] = useState(initialFromUrl.status);
  const [selectedType, setSelectedType] = useState(initialFromUrl.type);
  const [selectedBhk, setSelectedBhk] = useState(initialFromUrl.bhk);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minArea, setMinArea] = useState('');
  const [maxArea, setMaxArea] = useState('');
  const [selectedBuilder, setSelectedBuilder] = useState('All');
  const [selectedOrdering, setSelectedOrdering] = useState('newest');

  const bottomSentinelRef = useRef(null);
  const lastSyncedQueryRef = useRef(searchParams.toString());

  const activeFilters = useMemo(
    () => ({
      search: debouncedSearchQuery,
      locality: selectedLocality,
      status: selectedStatus,
      property_type: selectedType,
      bhk: selectedBhk.length > 0 ? selectedBhk : undefined,
      min_price: minPrice || undefined,
      max_price: maxPrice || undefined,
      min_area: minArea || undefined,
      max_area: maxArea || undefined,
      builder: selectedBuilder,
      ordering: selectedOrdering,
    }),
    [
      debouncedSearchQuery,
      selectedLocality,
      selectedStatus,
      selectedType,
      selectedBhk,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      selectedBuilder,
      selectedOrdering,
    ]
  );

  // Sync external URL query changes (e.g. clicking footer programmatic SEO links) into filter state
  useEffect(() => {
    const currentQuery = searchParams.toString();
    if (currentQuery === lastSyncedQueryRef.current) return;
    lastSyncedQueryRef.current = currentQuery;

    const parsed = parseSearchParams(searchParams);
    setSearchQuery(parsed.search);
    setDebouncedSearchQuery(parsed.search);
    setSelectedLocality(parsed.locality);
    setSelectedType(parsed.type);
    setSelectedStatus(parsed.status);
    setSelectedBhk(parsed.bhk);
  }, [searchParams]);

  // Sync filter state back to URL query parameters for shareable & crawlable filter URLs
  useEffect(() => {
    const nextParams = new URLSearchParams();
    if (debouncedSearchQuery.trim()) nextParams.set('search', debouncedSearchQuery.trim());
    if (selectedLocality !== 'All') nextParams.set('locality', selectedLocality);
    if (selectedType !== 'All') nextParams.set('type', selectedType.toLowerCase());
    if (selectedStatus !== 'All') {
      nextParams.set('status', STATUS_TO_PARAM[selectedStatus] || selectedStatus);
    }
    if (selectedBhk.length > 0) {
      const nums = selectedBhk.map((b) => String(b).replace(/[^0-9]/g, '')).filter(Boolean);
      if (nums.length > 0) nextParams.set('bhk', nums.join(','));
    }

    const nextStr = nextParams.toString();
    if (nextStr !== lastSyncedQueryRef.current) {
      lastSyncedQueryRef.current = nextStr;
      setSearchParams(nextParams, { replace: true });
    }
  }, [
    debouncedSearchQuery,
    selectedLocality,
    selectedType,
    selectedStatus,
    selectedBhk,
    setSearchParams,
  ]);

  // Ultra-fast search query input debounce (150ms delay)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 150);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Initial Filter Options Data Fetching (Builders & Localities)
  useEffect(() => {
    async function loadMeta() {
      try {
        const [locsData, metaOptions] = await Promise.all([
          localityService.getLocalities(),
          propertyService.getFilterOptions()
        ]);
        setLocalities(locsData || []);
        if (metaOptions && metaOptions.builders) {
          setBuilders(metaOptions.builders || []);
        }
      } catch (err) {
        console.warn('Failed to load filter options metadata:', err);
      }
    }
    loadMeta();
  }, []);

  // Main Property List Data Fetching on Filter Changes (Progressive Page-1 + SWR + Cold-Start Grace Fallback)
  useEffect(() => {
    let isCancelled = false;
    let coldStartTimer = null;
    let prefetchPage2Timer = null;

    const schedulePage2Prefetch = (hasNextPage) => {
      if (!hasNextPage) return;
      prefetchPage2Timer = setTimeout(() => {
        if (!isCancelled) {
          propertyService
            .getPropertiesPage(activeFilters, { page: 2, pageSize: PAGE_SIZE })
            .catch(() => {});
        }
      }, 250);
    };

    async function loadData() {
      const cached = propertyService.getCachedPropertiesPage(activeFilters, {
        page: 1,
        pageSize: PAGE_SIZE,
      });

      if (cached && Array.isArray(cached.results) && cached.results.length > 0) {
        setProjects(cached.results);
        setTotalCount(cached.count);
        setCurrentPage(cached.currentPage || 1);
        setHasMore(Boolean(cached.hasNext));
        setIsSyncingLive(false);
        setLoading(false);

        if (!cached.fromStorage) {
          schedulePage2Prefetch(cached.hasNext);
          return;
        }
      } else {
        setLoading(true);
        setIsSyncingLive(false);
        // Cold-start grace preview: if backend takes >900ms (e.g. Render wake-up for a brand-new visitor),
        // immediately show curated RERA-verified Ahmedabad listings while live DB finishes syncing.
        coldStartTimer = setTimeout(() => {
          if (isCancelled) return;
          const fallbackList = propertyService.getFallbackProperties(activeFilters);
          if (fallbackList.length > 0) {
            setProjects(fallbackList);
            setTotalCount(fallbackList.length);
            setCurrentPage(1);
            setHasMore(false);
            setIsSyncingLive(true);
            setLoading(false);
          }
        }, COLD_START_GRACE_MS);
      }

      try {
        const pageData = await propertyService.getPropertiesPage(activeFilters, {
          page: 1,
          pageSize: PAGE_SIZE,
          forceRefresh: Boolean(cached?.fromStorage),
        });
        if (coldStartTimer) clearTimeout(coldStartTimer);
        if (isCancelled) return;

        setProjects(pageData.results || []);
        setTotalCount(pageData.count || 0);
        setCurrentPage(pageData.currentPage || 1);
        setHasMore(Boolean(pageData.hasNext));
        setIsSyncingLive(false);
        setLoading(false);

        schedulePage2Prefetch(pageData.hasNext);
      } catch (err) {
        if (coldStartTimer) clearTimeout(coldStartTimer);
        if (!isCancelled) {
          console.error('Failed to load property list:', err);
          setIsSyncingLive(false);
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isCancelled = true;
      if (coldStartTimer) clearTimeout(coldStartTimer);
      if (prefetchPage2Timer) clearTimeout(prefetchPage2Timer);
    };
  }, [activeFilters]);

  const loadNextPage = useCallback(async () => {
    if (loading || loadingMore || !hasMore || isSyncingLive) return;
    const nextPage = currentPage + 1;
    setLoadingMore(true);
    try {
      const pageData = await propertyService.getPropertiesPage(activeFilters, {
        page: nextPage,
        pageSize: PAGE_SIZE,
      });
      setProjects((prev) => {
        const seen = new Set(prev.map((p) => String(p.id)));
        const fresh = (pageData.results || []).filter((p) => !seen.has(String(p.id)));
        return [...prev, ...fresh];
      });
      setCurrentPage(pageData.currentPage || nextPage);
      setTotalCount(pageData.count || 0);
      setHasMore(Boolean(pageData.hasNext));

      if (pageData.hasNext) {
        propertyService
          .getPropertiesPage(activeFilters, { page: nextPage + 1, pageSize: PAGE_SIZE })
          .catch(() => {});
      }
    } catch (err) {
      console.error('Failed to load next property page:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [activeFilters, currentPage, hasMore, isSyncingLive, loading, loadingMore]);

  // Ultra-Fast Progressive Infinite Scroll Observer (600px pre-fetching margin)
  useEffect(() => {
    if (loading || !hasMore || isSyncingLive) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          loadNextPage();
        }
      },
      { threshold: 0.05, rootMargin: '600px' }
    );

    const currentSentinel = bottomSentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [loading, hasMore, isSyncingLive, loadingMore, loadNextPage]);

  const handleReset = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setSelectedLocality('All');
    setSelectedStatus('All');
    setSelectedType('All');
    setSelectedBhk([]);
    setMinPrice('');
    setMaxPrice('');
    setMinArea('');
    setMaxArea('');
    setSelectedBuilder('All');
    setSelectedOrdering('newest');
  };

  const hasActiveFilters = Boolean(
    searchQuery ||
    selectedLocality !== 'All' ||
    selectedStatus !== 'All' ||
    selectedType !== 'All' ||
    selectedBhk.length > 0 ||
    minPrice ||
    maxPrice ||
    minArea ||
    maxArea ||
    selectedBuilder !== 'All'
  );

  const areaSummary = minArea && maxArea 
    ? `Area: ${minArea}-${maxArea} sq ft`
    : minArea 
    ? `Area: ≥ ${minArea} sq ft`
    : maxArea 
    ? `Area: ≤ ${maxArea} sq ft` 
    : null;

  const filterSummaryText = [
    searchQuery ? `Search: "${searchQuery}"` : null,
    selectedLocality !== 'All' ? `Locality: ${selectedLocality}` : null,
    selectedStatus !== 'All' ? `Status: ${selectedStatus}` : null,
    selectedType !== 'All' ? `Type: ${selectedType}` : null,
    selectedBhk.length > 0 ? `BHK: ${selectedBhk.join(', ')}` : null,
    areaSummary,
    selectedBuilder !== 'All' ? `Builder: ${selectedBuilder}` : null,
  ]
    .filter(Boolean)
    .join(' • ');


  const AREA_TEXT_CONFIG = {
    All: {
      title: "Verified Properties in Ahmedabad",
      description: "Explore verified residential projects across Gota, Chandkheda, Sola, Thaltej, Satellite & Maninagar backed by ML decision analytics and legal title search.",
    },
    Gota: {
      title: "Verified Properties in Gota",
      description: "Explore verified residential projects and high-growth apartments in Gota along the SG Highway corridor backed by ML price valuation & legal title search.",
    },
    Chandkheda: {
      title: "Verified Properties in Chandkheda",
      description: "Explore verified residential developments and upcoming townships in Chandkheda, North Ahmedabad backed by ML price valuation & legal title search.",
    },
    Sola: {
      title: "Verified Properties in Sola",
      description: "Explore premium residential apartments and modern projects in Sola along Science City Road backed by ML price valuation & legal title search.",
    },
    Thaltej: {
      title: "Verified Properties in Thaltej",
      description: "Explore luxury residential properties and high-end developments in Thaltej, West Ahmedabad backed by ML price valuation & legal title search.",
    },
    Satellite: {
      title: "Verified Properties in Satellite",
      description: "Explore prime residential apartments and commercial-adjacent living in Satellite & Prahlad Nagar belt backed by ML price valuation & legal title search.",
    },
    Maninagar: {
      title: "Verified Properties in Maninagar",
      description: "Explore verified residential properties and family apartments in Maninagar, South-East Ahmedabad backed by ML price valuation & legal title search.",
    }
  };

  const currentAreaText = AREA_TEXT_CONFIG[selectedLocality] || {
    title: `Verified Properties in ${selectedLocality}`,
    description: `Explore verified residential projects in ${selectedLocality} backed by ML decision analytics and legal title search.`
  };

  const visibleProjects = projects;
  const displayTotalCount =
    selectedLocality === 'All' && !hasActiveFilters && totalCount > 672
      ? 672
      : (totalCount || projects.length);

  const bhkPrefix = selectedBhk.length > 0 ? `${selectedBhk.join(', ')} ` : '';
  const typePrefix = selectedType !== 'All' ? `${selectedType}s ` : '';
  const statusPrefix = selectedStatus !== 'All' ? `${selectedStatus} ` : '';
  const localitySuffix = selectedLocality === 'All' ? 'Ahmedabad' : `${selectedLocality}, Ahmedabad`;
  const hasRichSegment =
    selectedBhk.length > 0 || selectedType !== 'All' || selectedStatus !== 'All';
  const pageHeading = hasRichSegment
    ? `${statusPrefix}${bhkPrefix}${typePrefix || 'Properties '}in ${selectedLocality === 'All' ? 'Ahmedabad' : selectedLocality}`
    : currentAreaText.title;

  const seoTitle =
    hasActiveFilters
      ? `${statusPrefix}${bhkPrefix}${typePrefix || 'Properties '}in ${localitySuffix} – RERA Verified`
      : 'RERA Verified Properties in Ahmedabad – Flats, Villas & Plots';
  const seoDescription = currentAreaText.description;

  let canonicalPath = '/properties';
  if (
    selectedLocality !== 'All' &&
    selectedBhk.length === 0 &&
    selectedType === 'All' &&
    selectedStatus === 'All' &&
    !debouncedSearchQuery
  ) {
    canonicalPath = `/properties?locality=${selectedLocality}`;
  } else if (
    selectedBhk.length === 1 &&
    selectedLocality === 'All' &&
    selectedType === 'All' &&
    selectedStatus === 'All' &&
    !debouncedSearchQuery
  ) {
    canonicalPath = `/properties?bhk=${String(selectedBhk[0]).replace(/[^0-9]/g, '')}`;
  } else if (
    selectedType !== 'All' &&
    selectedLocality === 'All' &&
    selectedBhk.length === 0 &&
    selectedStatus === 'All' &&
    !debouncedSearchQuery
  ) {
    canonicalPath = `/properties?type=${selectedType.toLowerCase()}`;
  }

  const catalogSchemas = [
    buildBreadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Verified Properties', path: '/properties' },
    ]),
    buildItemListSchema(
      visibleProjects.slice(0, 10).map((p) => ({
        name: p.name,
        path: `/properties/${p.slug || p.id}`,
      })),
      seoTitle
    ),
  ].filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8 space-y-5 sm:space-y-6">
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        canonicalPath={canonicalPath}
        keywords={`properties in ${localitySuffix}, RERA verified projects Ahmedabad, ${selectedBhk.length ? selectedBhk.join(', ') + ' flats' : '2 BHK 3 BHK flats'}, Verixa`}
        schema={catalogSchemas}
      />
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-primary/10 text-primary mb-2">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">RERA & Title Audited • {selectedLocality === 'All' ? 'All 6 Micro-Markets' : selectedLocality}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">{pageHeading}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
            {currentAreaText.description}
          </p>
        </div>
      </div>

      {/* Advanced Filter Toolbar */}
      <PropertyFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedLocality={selectedLocality}
        setSelectedLocality={setSelectedLocality}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedBhk={selectedBhk}
        setSelectedBhk={setSelectedBhk}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        minArea={minArea}
        setMinArea={setMinArea}
        maxArea={maxArea}
        setMaxArea={setMaxArea}
        selectedBuilder={selectedBuilder}
        setSelectedBuilder={setSelectedBuilder}
        selectedOrdering={selectedOrdering}
        setSelectedOrdering={setSelectedOrdering}
        localities={localities}
        builders={builders}
        onReset={handleReset}
      />

      {/* Dynamic Results Summary Bar */}
      {!loading && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 py-1.5 border-b pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-extrabold text-foreground">
              Showing {displayTotalCount} {displayTotalCount === 1 ? 'Property' : 'Properties'} {selectedLocality !== 'All' ? `in ${selectedLocality}` : 'across All 6 Areas'}
            </span>
            {isSyncingLive && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Syncing live registry (672+ properties)...</span>
              </span>
            )}
            {hasActiveFilters && (
              <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 flex items-center gap-1">
                <span>Matching:</span>
                <span className="font-bold">{filterSummaryText || 'Active Filters'}</span>
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="text-xs text-muted-foreground hover:text-foreground underline flex items-center gap-1 w-fit"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear All Filters</span>
            </button>
          )}
        </div>
      )}

      {/* Content Section with Loading, Empty & Grid States */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border rounded-2xl overflow-hidden bg-card shadow-sm">
              <Skeleton className="aspect-[16/10] w-full rounded-none" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-4/5" />
                <div className="grid grid-cols-2 gap-2 py-2 border-y border-border/60">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-20 rounded" />
                  <Skeleton className="h-5 w-24 rounded" />
                </div>
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <Skeleton className="h-9 w-full rounded-xl" />
                  <Skeleton className="h-9 w-full rounded-xl" />
                  <Skeleton className="h-9 w-full rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="border border-dashed rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto bg-card shadow-sm">
          <div className="p-4 rounded-full bg-muted w-fit mx-auto text-muted-foreground">
            <Building2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-foreground">No Matching Properties Found</h3>
          <p className="text-xs text-muted-foreground">
            {hasActiveFilters
              ? `No properties found matching your search filter "${filterSummaryText}". Try adjusting or resetting your filters.`
              : 'No properties available in the database currently.'}
          </p>
          {hasActiveFilters && (
            <Button onClick={handleReset} variant="outline" className="rounded-xl font-semibold">
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {visibleProjects.map((project, idx) => (
              <PropertyCard
                key={project.id}
                project={project}
                priority={idx < 3}
                onSelect={onSelectProject}
                onToggleWishlist={onToggleWishlist || defaultToggleWishlist}
                isWishlisted={checkIsWishlisted(project.id)}
                onToggleCompare={handleToggleCompare}
                isCompared={selectedIds.includes(String(project.id))}
              />
            ))}
          </div>

          {/* Infinite Scroll Sentinel & Batch Loader Indicator */}
          {hasMore && (
            <div ref={bottomSentinelRef} className="py-8 text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-card shadow-sm text-xs font-semibold text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>Loading more properties... ({visibleProjects.length} / {displayTotalCount})</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PropertiesPage;


