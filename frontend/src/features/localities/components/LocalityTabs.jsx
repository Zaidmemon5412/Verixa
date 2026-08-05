import React from 'react';

export function LocalityTabs({ localities = [], selectedId, onSelect }) {
  if (!Array.isArray(localities) || localities.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2">
      <div className="flex items-center gap-2.5 min-w-max">
        {localities.map((loc) => {
          const isSelected = String(loc.id) === String(selectedId) || String(loc.slug) === String(selectedId);
          return (
            <button
              key={loc.id}
              onClick={() => onSelect && onSelect(loc)}
              className={`px-5 py-2 rounded-full text-xs md:text-sm font-semibold transition-all duration-200 shrink-0 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-105'
                  : 'bg-card text-foreground border border-border/80 hover:border-blue-500/50 hover:bg-muted/60'
              }`}
            >
              {loc.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
