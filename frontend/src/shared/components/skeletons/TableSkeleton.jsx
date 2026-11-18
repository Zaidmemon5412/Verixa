import React from 'react';
import { Skeleton } from '../ui/skeleton';

/**
 * Theme-adaptive TableSkeleton component.
 * Renders pulse animations for tabular data headers and rows.
 */
export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8 animate-pulse" id="table-skeleton">
      <div className="bg-card border border-border rounded-2xl p-4 overflow-hidden shadow-xs">
        {/* Table Header */}
        <div className="flex items-center border-b border-border pb-3 px-2 space-x-4">
          {Array.from({ length: cols }).map((_, idx) => (
            <Skeleton key={idx} className="h-4 rounded flex-1" />
          ))}
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-border pt-2">
          {Array.from({ length: rows }).map((_, rIdx) => (
            <div key={rIdx} className="flex items-center py-3 px-2 space-x-4">
              {Array.from({ length: cols }).map((_, cIdx) => (
                <Skeleton key={cIdx} className="h-3.5 rounded flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TableSkeleton;
