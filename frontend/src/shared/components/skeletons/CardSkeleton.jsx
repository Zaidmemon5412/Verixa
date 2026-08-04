import React from 'react';

/**
 * Generic CardSkeleton component.
 * Renders pulse animations for individual card items.
 */
export const CardSkeleton = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse" id="card-skeleton">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="glass-panel p-5 rounded-2xl space-y-4 border border-white/5">
          <div className="h-40 rounded-xl bg-slate-900/80" />
          <div className="h-4 bg-slate-800/80 rounded w-2/3" />
          <div className="h-3 bg-slate-900/80 rounded w-1/3" />
          <div className="h-9 rounded-lg bg-slate-800/50 w-full" />
        </div>
      ))}
    </div>
  );
};

export default CardSkeleton;
