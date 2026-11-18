import React from 'react';
import { Skeleton } from '../ui/skeleton';

/**
 * Theme-adaptive ListSkeleton component.
 * Renders pulse animations matching ReportsPage / list views.
 */
export const ListSkeleton = ({ rows = 4 }) => {
  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8 space-y-5 animate-pulse" id="list-skeleton">
      <div className="space-y-2">
        <Skeleton className="h-7 w-56 rounded-xl" />
        <Skeleton className="h-4 w-80 max-w-full rounded-lg" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, idx) => (
          <div
            key={idx}
            className="bg-card border border-border p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-center space-x-3 w-full">
              <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
              <div className="space-y-2 flex-1 max-w-md">
                <Skeleton className="h-4 w-3/4 rounded-lg" />
                <Skeleton className="h-3 w-1/2 rounded-lg" />
              </div>
            </div>
            <Skeleton className="h-8 w-full sm:w-28 rounded-lg shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListSkeleton;
