import React from 'react';
import { Skeleton } from '../ui/skeleton';

/**
 * Generic PageSkeleton component.
 * Renders theme-adaptive pulse animations for headers, sub-text, and content layout grids.
 */
export const PageSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8 space-y-6 animate-pulse select-none" id="page-skeleton">
      {/* Header Banner */}
      <div className="space-y-2.5">
        <Skeleton className="h-6 w-40 rounded-full" />
        <Skeleton className="h-8 w-2/3 sm:w-1/3 rounded-xl" />
        <Skeleton className="h-4 w-full sm:w-1/2 rounded-lg" />
      </div>

      {/* Primary Grid Layout Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {[1, 2, 3].map((idx) => (
          <div key={idx} className="bg-card border border-border p-5 sm:p-6 rounded-2xl space-y-4 shadow-xs">
            <Skeleton className="h-36 rounded-xl" />
            <Skeleton className="h-4 w-3/4 rounded-lg" />
            <Skeleton className="h-3 w-1/2 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PageSkeleton;
