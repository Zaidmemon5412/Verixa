import React, { useState } from 'react';

const MACRO_GROUPS = [
  { key: 'all', label: 'All', icon: '📍', categories: ['all'] },
  { key: 'essentials', label: 'Essentials', icon: '🏥', categories: ['hospitals', 'banks', 'petrol_pumps'] },
  { key: 'education', label: 'Education', icon: '🎓', categories: ['schools'] },
  { key: 'transport', label: 'Transport', icon: '🚇', categories: ['metro', 'bus_stops'] },
  { key: 'lifestyle', label: 'Lifestyle', icon: '🍽', categories: ['restaurants', 'shopping', 'parks'] }
];

const INDIVIDUAL_CATEGORIES = [
  { key: 'all', label: 'All', icon: '📍' },
  { key: 'schools', label: 'Schools', icon: '🏫' },
  { key: 'hospitals', label: 'Hospitals', icon: '🏥' },
  { key: 'metro', label: 'Metro', icon: '🚇' },
  { key: 'bus_stops', label: 'Bus Stops', icon: '🚌' },
  { key: 'parks', label: 'Parks', icon: '🌳' },
  { key: 'restaurants', label: 'Restaurants', icon: '🍽️' },
  { key: 'shopping', label: 'Shopping', icon: '🛍️' },
  { key: 'banks', label: 'Banks', icon: '🏦' },
  { key: 'petrol_pumps', label: 'Petrol Pumps', icon: '⛽' }
];

export function CategoryChips({ activeCategory, counts = {}, onSelectCategory }) {
  const [activeGroup, setActiveGroup] = useState('all');

  const handleGroupSelect = (group) => {
    setActiveGroup(group.key);
    if (group.key === 'all') {
      onSelectCategory('all');
    } else {
      // Pick first category of the selected macro group
      onSelectCategory(group.categories[0]);
    }
  };

  return (
    <div className="space-y-2.5">
      {/* Macro Group Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-border/60">
        {MACRO_GROUPS.map((group) => {
          const isGroupActive = activeGroup === group.key;
          return (
            <button
              key={group.key}
              onClick={() => handleGroupSelect(group)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-xl text-xs font-bold transition-all border-b-2 shrink-0 ${
                isGroupActive
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
            >
              <span>{group.icon}</span>
              <span>{group.label}</span>
            </button>
          );
        })}
      </div>

      {/* Compact Category Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
        {INDIVIDUAL_CATEGORIES.map((cat) => {
          // If a macro group (other than 'all') is selected, filter chips that belong to it
          const currentGroupObj = MACRO_GROUPS.find(g => g.key === activeGroup);
          if (activeGroup !== 'all' && currentGroupObj && !currentGroupObj.categories.includes(cat.key)) {
            return null;
          }

          const isActive = activeCategory === cat.key;
          const count = cat.key === 'all'
            ? Object.values(counts).reduce((a, b) => a + b, 0)
            : (counts[cat.key] || 0);

          return (
            <button
              key={cat.key}
              onClick={() => onSelectCategory(cat.key)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 border snap-start ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm scale-105'
                  : 'bg-card text-foreground border-border/80 hover:border-indigo-300 hover:bg-muted/50'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                isActive
                  ? 'bg-white/25 text-white font-extrabold'
                  : 'bg-muted text-muted-foreground font-semibold'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CategoryChips;
