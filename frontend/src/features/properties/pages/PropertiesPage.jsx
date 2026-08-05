import React, { useState, useEffect, useRef } from 'react';
import { Building2, Sparkles, Filter, CheckCircle2, RotateCcw, Loader2 } from 'lucide-react';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyFilters } from '../components/PropertyFilters';
import { propertyService } from '../services/propertyService';
import { localityService } from '../../localities/services/localityService';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { Button } from '../../../shared/components/ui/button';

const BATCH_SIZE = 30;

export function PropertiesPage({ onSelectProject, wishlist = [], onToggleWishlist }) {
  const [projects, setProjects] = useState([]);
  const [localities, setLocalities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(BATCH_SIZE);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocality, setSelectedLocality] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const bottomSentinelRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setDisplayLimit(BATCH_SIZE);
      try {
        const [propsData, locsData] = await Promise.all([
          propertyService.getProperties({
            search: searchQuery,
            locality: selectedLocality,
            status: selectedStatus,
          }),
          localityService.getLocalities(),
        ]);
        setProjects(propsData);
        setLocalities(locsData);
      } catch (err) {
        console.error('Failed to load property list:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [searchQuery, selectedLocality, selectedStatus]);

  // Infinite Scroll Observer
  useEffect(() => {
    if (loading || displayLimit >= projects.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          setLoadingMore(true);
          setTimeout(() => {
            setDisplayLimit((prev) => Math.min(prev + BATCH_SIZE, projects.length));
            setLoadingMore(false);
          }, 300);
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
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
  }, [loading, displayLimit, projects.length, loadingMore]);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedLocality('All');
    setSelectedStatus('All');
    setDisplayLimit(BATCH_SIZE);
  };

  const hasActiveFilters = searchQuery || selectedLocality !== 'All' || selectedStatus !== 'All';

  const filterSummaryText = [
    searchQuery ? `Search: "${searchQuery}"` : null,
    selectedLocality !== 'All' ? `Locality: ${selectedLocality}` : null,
    selectedStatus !== 'All' ? `Status: ${selectedStatus}` : null,
  ]
    .filter(Boolean)
    .join(' • ');

  const visibleProjects = projects.slice(0, displayLimit);
  const hasMore = displayLimit < projects.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>RERA & Title Audited Registry</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Verified Properties</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Explore verified residential projects backed by ML decision analytics and legal title search
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <PropertyFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedLocality={selectedLocality}
        setSelectedLocality={setSelectedLocality}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        localities={localities}
        onReset={handleReset}
      />

      {/* Dynamic Results Summary Bar */}
      {!loading && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 py-1.5 border-b pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-extrabold text-foreground">
              Showing {projects.length} {projects.length === 1 ? 'Property' : 'Properties'}
            </span>
            {hasActiveFilters && (
              <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 flex items-center gap-1">
                <span>Matching:</span>
                <span className="font-bold">{filterSummaryText}</span>
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="text-xs text-muted-foreground hover:text-foreground underline flex items-center gap-1 w-fit"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear Filter</span>
            </button>
          )}
        </div>
      )}

      {/* Content Section with Loading, Empty & Grid States */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border rounded-2xl p-4 space-y-3">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="border border-dashed rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto bg-card">
          <div className="p-4 rounded-full bg-muted w-fit mx-auto text-muted-foreground">
            <Building2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold">No Matching Properties Found</h3>
          <p className="text-xs text-muted-foreground">
            No properties found matching your search filter "{filterSummaryText}". Try resetting your filters.
          </p>
          <Button onClick={handleReset} variant="outline" className="rounded-xl">
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {visibleProjects.map((project) => (
              <PropertyCard
                key={project.id}
                project={project}
                onSelect={onSelectProject}
                onToggleWishlist={onToggleWishlist}
                isWishlisted={wishlist.includes(project.id)}
              />
            ))}
          </div>

          {/* Infinite Scroll Sentinel & Batch Loader Indicator */}
          {hasMore && (
            <div ref={bottomSentinelRef} className="py-8 text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-card shadow-sm text-xs font-semibold text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>Loading more properties... ({visibleProjects.length} / {projects.length})</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PropertiesPage;

