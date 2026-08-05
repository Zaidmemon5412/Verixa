import React from 'react';
import { ArrowLeftRight, Building2, Sparkles, Layers, Trash2 } from 'lucide-react';
import usePropertyComparison from '../hooks/usePropertyComparison';
import { PropertySearchSelector } from '../components/PropertySearchSelector';
import { ComparisonMatrixTable } from '../components/ComparisonMatrixTable';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { Card } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';

export function ComparisonPage({ initialSelectedIds = [], onSelectProject }) {
  const {
    allProperties,
    selectedIds,
    comparedProperties,
    loading,
    bestValues,
    addProperty,
    removeProperty,
    replaceProperty,
    clearAll,
  } = usePropertyComparison(initialSelectedIds);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Header & Context Description */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary mb-2 border border-primary/20">
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>VERIXA DYNAMIC COMPARISON MATRIX</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Property Comparison Engine</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl font-medium">
            Compare live properties side-by-side on price, rates per sq.ft, carpet area, legal compliance, ratings, and amenity offerings.
          </p>
        </div>

        {/* Selected Count Indicator & Clear Action */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold px-3 py-1.5 rounded-xl bg-card border border-border text-foreground shadow-sm flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-primary" />
            <span>Comparing {selectedIds.length} / 4 Slots</span>
          </span>
          {selectedIds.length > 0 && (
            <Button
              onClick={clearAll}
              variant="outline"
              size="sm"
              className="text-xs rounded-xl gap-1 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </Button>
          )}
        </div>
      </div>

      {/* Global Search & Autocomplete Property Selector Bar */}
      <Card className="rounded-3xl border bg-card p-6 shadow-sm">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Add Property to Comparison</span>
            </label>
            <span className="text-xs text-muted-foreground font-medium">Search by Property Name, Builder, or Locality</span>
          </div>

          <PropertySearchSelector
            allProperties={allProperties}
            selectedIds={selectedIds}
            onAddProperty={addProperty}
          />
        </div>
      </Card>

      {/* Loading Skeleton View */}
      {loading ? (
        <Card className="rounded-3xl border p-8 space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold text-primary animate-pulse">
            <Building2 className="w-4 h-4 animate-bounce" />
            <span>Fetching live database property specifications...</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </Card>
      ) : (
        /* Main Side-by-Side Dynamic Comparison Matrix Table */
        <ComparisonMatrixTable
          comparedProperties={comparedProperties}
          allProperties={allProperties}
          selectedIds={selectedIds}
          bestValues={bestValues}
          onRemoveProperty={removeProperty}
          onReplaceProperty={replaceProperty}
          onAddProperty={addProperty}
          onSelectProject={onSelectProject}
        />
      )}
    </div>
  );
}

export default ComparisonPage;
