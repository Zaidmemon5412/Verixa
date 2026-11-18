import React from 'react';
import { Skeleton } from '../ui/skeleton';

/**
 * Theme-adaptive CardSkeleton component.
 * Supports inline usage (default) or standalone full-page route fallback (`standalone={true}`).
 */
export const CardSkeleton = ({ count = 3, standalone = false }) => {
  const grid = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse" id="card-skeleton">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bg-card border border-border p-4 sm:p-5 rounded-2xl space-y-4 shadow-xs">
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-5 w-2/3 rounded-lg" />
          <Skeleton className="h-3.5 w-1/2 rounded-lg" />
          <Skeleton className="h-9 rounded-xl w-full" />
        </div>
      ))}
    </div>
  );

  if (standalone) {
    return (
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8 space-y-6">
        {grid}
      </div>
    );
  }

  return grid;
};

export default CardSkeleton;
