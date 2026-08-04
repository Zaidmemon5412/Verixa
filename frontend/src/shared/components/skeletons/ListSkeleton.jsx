import React from 'react';

/**
 * Generic ListSkeleton component.
 * Renders pulse animations for list row items.
 */
export const ListSkeleton = ({ rows = 4 }) => {
  return (
    <div className="space-y-3 animate-pulse" id="list-skeleton">
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className="glass-panel p-4 rounded-xl border border-white/5 flex items-center justify-between"
        >
          <div className="flex items-center space-x-3 w-full">
            <div className="w-10 h-10 rounded-lg bg-slate-900/80 shrink-0" />
            <div className="space-y-2 w-1/2">
              <div className="h-4 bg-slate-800/80 rounded w-3/4" />
              <div className="h-3 bg-slate-900/80 rounded w-1/2" />
            </div>
          </div>
          <div className="h-8 w-24 rounded-lg bg-slate-800/60 shrink-0" />
        </div>
      ))}
    </div>
  );
};

export default ListSkeleton;
