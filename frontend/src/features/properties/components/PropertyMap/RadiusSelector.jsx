import React from 'react';
import { Radar } from 'lucide-react';

const RADIUS_OPTIONS = [
  { value: 0.5, label: '500 m' },
  { value: 1, label: '1 KM' },
  { value: 2, label: '2 KM' },
  { value: 5, label: '5 KM' }
];

export function RadiusSelector({ selectedRadius, onChange }) {
  return (
    <div className="flex items-center justify-between md:justify-start gap-1.5 bg-muted/60 dark:bg-slate-900/60 p-1 rounded-xl border border-border shadow-inner w-full md:w-auto">
      <div className="flex items-center gap-1 px-2 text-xs font-bold text-muted-foreground shrink-0">
        <Radar className="w-3.5 h-3.5 text-indigo-500 animate-spin-slow" />
        <span>Radius:</span>
      </div>
      <div className="flex items-center gap-1 flex-1 md:flex-none justify-end">
        {RADIUS_OPTIONS.map((opt) => {
          const isActive = selectedRadius === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`px-2.5 py-1.5 sm:py-1 text-xs font-semibold rounded-lg transition-all duration-200 flex-1 md:flex-none text-center ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/80'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default RadiusSelector;
