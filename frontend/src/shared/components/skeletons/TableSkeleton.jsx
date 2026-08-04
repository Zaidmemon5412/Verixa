import React from 'react';

/**
 * Generic TableSkeleton component.
 * Renders pulse animations for tabular data headers and rows.
 */
export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="glass-panel rounded-2xl border border-white/5 p-4 overflow-hidden animate-pulse" id="table-skeleton">
      {/* Table Header */}
      <div className="flex items-center border-b border-white/5 pb-3 px-2 space-x-4">
        {Array.from({ length: cols }).map((_, idx) => (
          <div key={idx} className="h-4 bg-slate-800/80 rounded flex-1" />
        ))}
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-white/5 pt-2">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="flex items-center py-3 px-2 space-x-4">
            {Array.from({ length: cols }).map((_, cIdx) => (
              <div key={cIdx} className="h-3.5 bg-slate-900/80 rounded flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableSkeleton;
