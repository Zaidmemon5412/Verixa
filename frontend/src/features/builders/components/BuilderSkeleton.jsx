import React from 'react';

export function BuilderSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-pulse">
      
      {/* Hero Skeleton */}
      <div className="rounded-3xl bg-slate-200/80 dark:bg-slate-800/80 p-8 h-64 flex flex-col justify-between" />

      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 p-4" />
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="h-16 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 p-4" />

      {/* Projects Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 h-96" />
        ))}
      </div>

    </div>
  );
}

export default BuilderSkeleton;
