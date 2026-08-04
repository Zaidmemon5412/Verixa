import React from 'react';

/**
 * Generic PageSkeleton component.
 * Renders pulse animations for headers, sub-text, and content layout grids.
 */
export const PageSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse select-none" id="page-skeleton">
      {/* Header Banner */}
      <div className="space-y-2">
        <div className="h-7 bg-slate-800/60 rounded-lg w-1/3" />
        <div className="h-4 bg-slate-900/60 rounded-lg w-1/2" />
      </div>

      {/* Primary Grid Layout Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {[1, 2, 3].map((idx) => (
          <div key={idx} className="glass-panel p-6 rounded-2xl space-y-4 border border-white/5">
            <div className="h-36 bg-slate-900/80 rounded-xl" />
            <div className="h-4 bg-slate-800/60 rounded w-3/4" />
            <div className="h-3 bg-slate-900/60 rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PageSkeleton;
