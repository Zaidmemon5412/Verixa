import React from 'react';
import { Building2, RotateCcw, SearchX } from 'lucide-react';

export function EmptyState({ onReset, builderName = 'Developer' }) {
  return (
    <div className="py-16 px-6 text-center bg-white dark:bg-slate-900 rounded-3xl border border-sky-100 dark:border-slate-800 shadow-sm max-w-2xl mx-auto my-8">
      <div className="w-16 h-16 rounded-2xl bg-sky-50 dark:bg-sky-950/50 text-sky-500 flex items-center justify-center mx-auto mb-4 border border-sky-100 dark:border-sky-900/50 shadow-inner">
        <SearchX className="w-8 h-8" />
      </div>

      <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
        No Projects Match Your Search
      </h3>

      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
        We couldn't find any projects matching your active search query or status filters for <strong>{builderName}</strong>.
      </p>

      {onReset && (
        <button
          onClick={onReset}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/20 transition-all hover:gap-2.5"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset All Filters</span>
        </button>
      )}
    </div>
  );
}

export default EmptyState;
